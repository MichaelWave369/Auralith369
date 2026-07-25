import * as THREE from 'three';
import { createWebGL2Context } from './capabilities.js';
import { normalizeGpuLabSettings } from './gpuLabDefaults.js';

export const GPU_LAB_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const GPU_LAB_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D tSource;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uCrtEnabled;
  uniform float uCurvature;
  uniform float uScanlineIntensity;
  uniform float uScanlineCount;
  uniform float uChromaticAberration;
  uniform float uVignette;
  uniform float uNoise;
  uniform float uBloomStrength;
  uniform float uBloomRadius;
  uniform float uBloomThreshold;

  varying vec2 vUv;

  float randomNoise(vec2 coordinate) {
    return fract(sin(dot(coordinate, vec2(12.9898, 78.233)) + uTime * 0.00017) * 43758.5453);
  }

  bool outsideUnitSquare(vec2 uv) {
    return uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0;
  }

  vec2 curvedUv(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    vec2 warped = centered * (1.0 + uCurvature * vec2(centered.y * centered.y, centered.x * centered.x));
    return mix(uv, warped * 0.5 + 0.5, uCrtEnabled);
  }

  vec4 sourceSample(vec2 uv) {
    if (outsideUnitSquare(uv)) return vec4(0.0);
    return texture2D(tSource, uv);
  }

  vec3 thresholdedBloom(vec2 uv, vec2 texel) {
    float radius = 1.0 + uBloomRadius * 12.0;
    vec2 dx = vec2(texel.x * radius, 0.0);
    vec2 dy = vec2(0.0, texel.y * radius);
    vec2 diagonal = vec2(texel.x * radius * 0.7071, texel.y * radius * 0.7071);

    vec4 samples[8];
    samples[0] = sourceSample(uv + dx);
    samples[1] = sourceSample(uv - dx);
    samples[2] = sourceSample(uv + dy);
    samples[3] = sourceSample(uv - dy);
    samples[4] = sourceSample(uv + diagonal);
    samples[5] = sourceSample(uv - diagonal);
    samples[6] = sourceSample(uv + vec2(diagonal.x, -diagonal.y));
    samples[7] = sourceSample(uv + vec2(-diagonal.x, diagonal.y));

    vec3 bloom = vec3(0.0);
    for (int index = 0; index < 8; index++) {
      float luminance = dot(samples[index].rgb, vec3(0.2126, 0.7152, 0.0722));
      float contribution = smoothstep(uBloomThreshold, 1.0, luminance) * samples[index].a;
      bloom += samples[index].rgb * contribution;
    }

    return bloom / 8.0;
  }

  void main() {
    vec2 uv = curvedUv(vUv);
    if (outsideUnitSquare(uv)) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 texel = 1.0 / max(uResolution, vec2(1.0));
    float channelOffset = uChromaticAberration * texel.x * uCrtEnabled;
    vec4 center = sourceSample(uv);

    vec3 color = vec3(
      sourceSample(uv + vec2(channelOffset, 0.0)).r,
      center.g,
      sourceSample(uv - vec2(channelOffset, 0.0)).b
    );

    color += thresholdedBloom(uv, texel) * uBloomStrength;

    float scanline = sin(uv.y * uScanlineCount * 6.28318530718) * 0.5 + 0.5;
    color *= 1.0 - scanline * uScanlineIntensity * uCrtEnabled;

    vec2 centered = uv * 2.0 - 1.0;
    float vignette = smoothstep(1.25, 0.2, dot(centered, centered));
    color *= mix(1.0, vignette, uVignette * uCrtEnabled);

    float noise = (randomNoise(gl_FragCoord.xy) - 0.5) * uNoise * uCrtEnabled;
    color += noise;

    gl_FragColor = vec4(max(color, vec3(0.0)), center.a);
  }
`;

function makeUniforms(settings) {
  return {
    tSource: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uCrtEnabled: { value: settings.crt.enabled ? 1 : 0 },
    uCurvature: { value: settings.crt.curvature },
    uScanlineIntensity: { value: settings.crt.scanlineIntensity },
    uScanlineCount: { value: settings.crt.scanlineCount },
    uChromaticAberration: { value: settings.crt.chromaticAberration },
    uVignette: { value: settings.crt.vignette },
    uNoise: { value: settings.crt.noise },
    uBloomStrength: { value: settings.bloom.enabled ? settings.bloom.strength : 0 },
    uBloomRadius: { value: settings.bloom.radius },
    uBloomThreshold: { value: settings.bloom.threshold }
  };
}

export class GpuLabRenderer {
  constructor(canvas, options = {}) {
    const context = createWebGL2Context(canvas);
    if (!context) throw new Error('Auralith GPU Lab requires a WebGL2 context.');

    this.canvas = canvas;
    this.context = context;
    this.settings = normalizeGpuLabSettings(options.settings);
    this.width = Math.max(1, Math.round(options.width || 1));
    this.height = Math.max(1, Math.round(options.height || 1));
    this.startedAt = performance.now();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      uniforms: makeUniforms(this.settings),
      vertexShader: GPU_LAB_VERTEX_SHADER,
      fragmentShader: GPU_LAB_FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.texture = null;
    this.lastSource = null;
    this.resize(this.width, this.height);
  }

  resize(width, height) {
    this.width = Math.max(1, Math.round(width || 1));
    this.height = Math.max(1, Math.round(height || 1));
    this.renderer.setSize(this.width, this.height, false);
    this.material.uniforms.uResolution.value.set(this.width, this.height);
  }

  updateSettings(input) {
    this.settings = normalizeGpuLabSettings(input);
    const { crt, bloom } = this.settings;
    const uniforms = this.material.uniforms;
    uniforms.uCrtEnabled.value = crt.enabled ? 1 : 0;
    uniforms.uCurvature.value = crt.curvature;
    uniforms.uScanlineIntensity.value = crt.scanlineIntensity;
    uniforms.uScanlineCount.value = crt.scanlineCount;
    uniforms.uChromaticAberration.value = crt.chromaticAberration;
    uniforms.uVignette.value = crt.vignette;
    uniforms.uNoise.value = crt.noise;
    uniforms.uBloomStrength.value = bloom.enabled ? bloom.strength : 0;
    uniforms.uBloomRadius.value = bloom.radius;
    uniforms.uBloomThreshold.value = bloom.threshold;
  }

  render(sourceCanvas) {
    if (!sourceCanvas) return false;
    if (this.context.isContextLost()) throw new Error('The WebGL2 context was lost.');

    if (sourceCanvas.width !== this.width || sourceCanvas.height !== this.height) {
      this.resize(sourceCanvas.width, sourceCanvas.height);
    }

    this.lastSource = sourceCanvas;
    if (!this.texture) {
      this.texture = new THREE.CanvasTexture(sourceCanvas);
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.generateMipmaps = false;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.wrapS = THREE.ClampToEdgeWrapping;
      this.texture.wrapT = THREE.ClampToEdgeWrapping;
      this.material.uniforms.tSource.value = this.texture;
    } else {
      this.texture.image = sourceCanvas;
    }

    this.texture.needsUpdate = true;
    this.material.uniforms.uTime.value = performance.now() - this.startedAt;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    return true;
  }

  captureDataURL(type = 'image/png', quality) {
    if (this.lastSource) this.render(this.lastSource);
    return this.canvas.toDataURL(type, quality);
  }

  getDiagnostics() {
    return {
      backend: 'three-webgl2',
      size: { width: this.width, height: this.height },
      contextLost: this.context.isContextLost(),
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      drawCalls: this.renderer.info.render.calls
    };
  }

  dispose() {
    this.texture?.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.texture = null;
    this.lastSource = null;
  }
}

export default GpuLabRenderer;
