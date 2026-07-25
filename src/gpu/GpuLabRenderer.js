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
  uniform sampler2D tFeedback;
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
  uniform float uScanlineSoftness;
  uniform float uPhosphorMode;
  uniform float uPhosphorStrength;
  uniform float uGhosting;
  uniform float uGhostOffset;
  uniform float uBrightness;
  uniform float uBlackCrush;
  uniform float uHighlightRolloff;
  uniform float uFeedbackEnabled;
  uniform float uFeedbackAmount;
  uniform float uFeedbackDecay;
  uniform float uFeedbackScale;
  uniform float uFeedbackRotation;
  uniform vec2 uFeedbackOffset;
  uniform float uFeedbackMirror;
  uniform float uFeedbackKaleidoscope;
  uniform float uFeedbackBlend;
  uniform float uSpectralEnabled;
  uniform float uHueShift;
  uniform float uSaturation;
  uniform float uPrismAmount;
  uniform vec3 uShadowTint;
  uniform vec3 uHighlightTint;
  uniform float uTintStrength;
  uniform float uSolarize;
  uniform float uChannelMap;

  varying vec2 vUv;

  const float PI = 3.14159265358979323846;
  const float TAU = 6.28318530717958647692;

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

  vec3 phosphorPattern(vec2 pixel) {
    if (uPhosphorMode < 0.5 || uPhosphorStrength <= 0.0) return vec3(1.0);

    float column = mod(floor(pixel.x), 3.0);
    vec3 stripe = column < 1.0
      ? vec3(1.0, 0.42, 0.34)
      : (column < 2.0 ? vec3(0.36, 1.0, 0.42) : vec3(0.42, 0.36, 1.0));

    vec3 pattern = stripe;
    if (uPhosphorMode > 1.5 && uPhosphorMode < 2.5) {
      float rowGate = mix(0.68, 1.0, mod(floor(pixel.y / 2.0), 2.0));
      pattern *= rowGate;
    } else if (uPhosphorMode >= 2.5) {
      float diagonal = mod(floor(pixel.x) + floor(pixel.y), 3.0);
      float dotGate = diagonal < 1.0 ? 1.0 : 0.58;
      pattern *= dotGate;
    }

    return mix(vec3(1.0), pattern, uPhosphorStrength);
  }

  vec2 feedbackUv(vec2 uv) {
    vec2 centered = uv - 0.5;
    float cosine = cos(uFeedbackRotation);
    float sine = sin(uFeedbackRotation);
    centered = mat2(cosine, -sine, sine, cosine) * centered;

    if (uFeedbackKaleidoscope >= 2.0) {
      float radius = length(centered);
      float segments = max(2.0, floor(uFeedbackKaleidoscope + 0.5));
      float sector = TAU / segments;
      float angle = atan(centered.y, centered.x);
      angle = abs(mod(angle + sector * 0.5, sector) - sector * 0.5);
      centered = vec2(cos(angle), sin(angle)) * radius;
    }

    centered /= max(uFeedbackScale, 0.001);
    vec2 transformed = centered + 0.5 + uFeedbackOffset / max(uResolution, vec2(1.0));

    if (uFeedbackMirror > 0.5 && uFeedbackMirror < 1.5) {
      transformed.x = abs(transformed.x - 0.5) + 0.5;
    } else if (uFeedbackMirror >= 1.5 && uFeedbackMirror < 2.5) {
      transformed.y = abs(transformed.y - 0.5) + 0.5;
    } else if (uFeedbackMirror >= 2.5) {
      transformed = abs(transformed - 0.5) + 0.5;
    }

    return transformed;
  }

  vec3 blendFeedback(vec3 base, vec3 echo, float amount) {
    if (uFeedbackBlend < 0.5) return mix(base, echo, amount);
    if (uFeedbackBlend < 1.5) return base + echo * amount;
    return vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - echo * amount);
  }

  vec3 rotateHue(vec3 color, float angle) {
    vec3 axis = normalize(vec3(1.0));
    float cosine = cos(angle);
    float sine = sin(angle);
    return color * cosine + cross(axis, color) * sine + axis * dot(axis, color) * (1.0 - cosine);
  }

  vec3 remapChannels(vec3 color) {
    if (uChannelMap < 0.5) return color.rgb;
    if (uChannelMap < 1.5) return color.rbg;
    if (uChannelMap < 2.5) return color.grb;
    if (uChannelMap < 3.5) return color.gbr;
    if (uChannelMap < 4.5) return color.brg;
    return color.bgr;
  }

  vec3 applySpectralForge(vec3 color) {
    if (uSpectralEnabled < 0.5) return color;

    color = remapChannels(color);
    color = rotateHue(color, uHueShift);

    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luminance), color, uSaturation);

    luminance = clamp(dot(color, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
    vec3 duotone = mix(uShadowTint, uHighlightTint, smoothstep(0.0, 1.0, luminance));
    vec3 toned = duotone * max(luminance * 1.35, 0.08);
    color = mix(color, toned, uTintStrength);

    vec3 solarized = vec3(1.0) - abs(color * 2.0 - vec3(1.0));
    return mix(color, solarized, uSolarize);
  }

  void main() {
    vec2 uv = curvedUv(vUv);
    if (outsideUnitSquare(uv)) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 texel = 1.0 / max(uResolution, vec2(1.0));
    float channelOffset = uChromaticAberration * texel.x * uCrtEnabled;
    vec2 radial = uv - 0.5;
    float radialLength = length(radial);
    vec2 radialDirection = radialLength > 0.0001 ? radial / radialLength : vec2(1.0, 0.0);
    vec2 prismOffset = radialDirection * texel * uPrismAmount * uSpectralEnabled;
    vec4 center = sourceSample(uv);
    float outputAlpha = center.a;

    vec3 color = vec3(
      sourceSample(uv + vec2(channelOffset, 0.0) + prismOffset).r,
      center.g,
      sourceSample(uv - vec2(channelOffset, 0.0) - prismOffset).b
    );

    if (uGhosting > 0.0) {
      vec2 echoOffset = vec2(uGhostOffset * texel.x, 0.0);
      vec3 firstEcho = sourceSample(uv - echoOffset).rgb;
      vec3 secondEcho = sourceSample(uv - echoOffset * 2.0).rgb;
      color += (firstEcho * 0.72 + secondEcho * 0.28) * uGhosting * 0.5;
    }

    color += thresholdedBloom(uv, texel) * uBloomStrength;

    if (uFeedbackEnabled > 0.5 && uFeedbackAmount > 0.0) {
      vec2 echoUv = feedbackUv(uv);
      if (!outsideUnitSquare(echoUv)) {
        vec4 echoSample = texture2D(tFeedback, echoUv);
        vec3 echo = echoSample.rgb * uFeedbackDecay * echoSample.a;
        color = blendFeedback(color, echo, uFeedbackAmount);
        outputAlpha = max(outputAlpha, echoSample.a * uFeedbackAmount);
      }
    }

    color = applySpectralForge(color);

    float sineLine = sin(uv.y * uScanlineCount * TAU) * 0.5 + 0.5;
    float hardLine = step(0.5, sineLine);
    float scanline = mix(hardLine, sineLine, uScanlineSoftness);
    color *= 1.0 - scanline * uScanlineIntensity * uCrtEnabled;

    color *= phosphorPattern(gl_FragCoord.xy) * mix(1.0, uBrightness, uCrtEnabled);

    vec2 centered = uv * 2.0 - 1.0;
    float vignette = smoothstep(1.25, 0.2, dot(centered, centered));
    color *= mix(1.0, vignette, uVignette * uCrtEnabled);

    float noise = (randomNoise(gl_FragCoord.xy) - 0.5) * uNoise * uCrtEnabled;
    color += noise;

    float crushRange = max(1.0 - uBlackCrush, 0.001);
    color = max(color - vec3(uBlackCrush), vec3(0.0)) / crushRange;

    vec3 compressed = color / (1.0 + max(color - vec3(0.55), vec3(0.0)) * 1.5);
    color = mix(color, compressed, uHighlightRolloff);

    gl_FragColor = vec4(max(color, vec3(0.0)), outputAlpha);
  }
`;

const DISPLAY_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D tFrame;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(tFrame, vUv);
  }
`;

const PHOSPHOR_MODE = Object.freeze({ off: 0, aperture: 1, slot: 2, triad: 3 });
const FEEDBACK_MIRROR = Object.freeze({ off: 0, x: 1, y: 2, quad: 3 });
const FEEDBACK_BLEND = Object.freeze({ mix: 0, add: 1, screen: 2 });
const CHANNEL_MAP = Object.freeze({ rgb: 0, rbg: 1, grb: 2, gbr: 3, brg: 4, bgr: 5 });

const colorVector = value => {
  const color = new THREE.Color(value);
  return new THREE.Vector3(color.r, color.g, color.b);
};

function makeUniforms(settings) {
  return {
    tSource: { value: null },
    tFeedback: { value: null },
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
    uBloomThreshold: { value: settings.bloom.threshold },
    uScanlineSoftness: { value: settings.display.scanlineSoftness },
    uPhosphorMode: { value: PHOSPHOR_MODE[settings.display.phosphorMask] ?? 0 },
    uPhosphorStrength: { value: settings.display.phosphorStrength },
    uGhosting: { value: settings.display.ghosting },
    uGhostOffset: { value: settings.display.ghostOffset },
    uBrightness: { value: settings.display.brightness },
    uBlackCrush: { value: settings.display.blackCrush },
    uHighlightRolloff: { value: settings.display.highlightRolloff },
    uFeedbackEnabled: { value: settings.feedback.enabled ? 1 : 0 },
    uFeedbackAmount: { value: settings.feedback.amount },
    uFeedbackDecay: { value: settings.feedback.decay },
    uFeedbackScale: { value: settings.feedback.scale },
    uFeedbackRotation: { value: THREE.MathUtils.degToRad(settings.feedback.rotation) },
    uFeedbackOffset: { value: new THREE.Vector2(settings.feedback.offsetX, settings.feedback.offsetY) },
    uFeedbackMirror: { value: FEEDBACK_MIRROR[settings.feedback.mirror] ?? 0 },
    uFeedbackKaleidoscope: { value: settings.feedback.kaleidoscope },
    uFeedbackBlend: { value: FEEDBACK_BLEND[settings.feedback.blend] ?? 2 },
    uSpectralEnabled: { value: settings.spectral.enabled ? 1 : 0 },
    uHueShift: { value: THREE.MathUtils.degToRad(settings.spectral.hueShift) },
    uSaturation: { value: settings.spectral.saturation },
    uPrismAmount: { value: settings.spectral.prismAmount },
    uShadowTint: { value: colorVector(settings.spectral.shadowTint) },
    uHighlightTint: { value: colorVector(settings.spectral.highlightTint) },
    uTintStrength: { value: settings.spectral.tintStrength },
    uSolarize: { value: settings.spectral.solarize },
    uChannelMap: { value: CHANNEL_MAP[settings.spectral.channelMap] ?? 0 }
  };
}

function createFrameTarget(width, height) {
  const target = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    stencilBuffer: false
  });
  target.texture.generateMipmaps = false;
  target.texture.wrapS = THREE.ClampToEdgeWrapping;
  target.texture.wrapT = THREE.ClampToEdgeWrapping;
  return target;
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
    this.feedbackFrames = 0;

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
    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.scene = new THREE.Scene();
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

    this.displayScene = new THREE.Scene();
    this.displayMaterial = new THREE.ShaderMaterial({
      uniforms: { tFrame: { value: null } },
      vertexShader: GPU_LAB_VERTEX_SHADER,
      fragmentShader: DISPLAY_FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.displayMesh = new THREE.Mesh(this.geometry, this.displayMaterial);
    this.displayScene.add(this.displayMesh);

    this.texture = null;
    this.lastSource = null;
    this.feedbackRead = null;
    this.feedbackWrite = null;
    this.resize(this.width, this.height);
  }

  resize(width, height) {
    this.width = Math.max(1, Math.round(width || 1));
    this.height = Math.max(1, Math.round(height || 1));
    this.renderer.setSize(this.width, this.height, false);
    this.material.uniforms.uResolution.value.set(this.width, this.height);

    this.feedbackRead?.dispose();
    this.feedbackWrite?.dispose();
    this.feedbackRead = createFrameTarget(this.width, this.height);
    this.feedbackWrite = createFrameTarget(this.width, this.height);
    this.clearFeedback();
  }

  clearFeedback() {
    if (!this.feedbackRead || !this.feedbackWrite) return false;
    const previousTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.feedbackRead);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.feedbackWrite);
    this.renderer.clear();
    this.renderer.setRenderTarget(previousTarget);
    this.feedbackFrames = 0;
    return true;
  }

  updateSettings(input) {
    const previousFeedback = this.settings.feedback.enabled;
    this.settings = normalizeGpuLabSettings(input);
    const { crt, bloom, display, feedback, spectral } = this.settings;
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
    uniforms.uScanlineSoftness.value = display.scanlineSoftness;
    uniforms.uPhosphorMode.value = PHOSPHOR_MODE[display.phosphorMask] ?? 0;
    uniforms.uPhosphorStrength.value = display.phosphorStrength;
    uniforms.uGhosting.value = display.ghosting;
    uniforms.uGhostOffset.value = display.ghostOffset;
    uniforms.uBrightness.value = display.brightness;
    uniforms.uBlackCrush.value = display.blackCrush;
    uniforms.uHighlightRolloff.value = display.highlightRolloff;
    uniforms.uFeedbackEnabled.value = feedback.enabled ? 1 : 0;
    uniforms.uFeedbackAmount.value = feedback.amount;
    uniforms.uFeedbackDecay.value = feedback.decay;
    uniforms.uFeedbackScale.value = feedback.scale;
    uniforms.uFeedbackRotation.value = THREE.MathUtils.degToRad(feedback.rotation);
    uniforms.uFeedbackOffset.value.set(feedback.offsetX, feedback.offsetY);
    uniforms.uFeedbackMirror.value = FEEDBACK_MIRROR[feedback.mirror] ?? 0;
    uniforms.uFeedbackKaleidoscope.value = feedback.kaleidoscope;
    uniforms.uFeedbackBlend.value = FEEDBACK_BLEND[feedback.blend] ?? 2;
    uniforms.uSpectralEnabled.value = spectral.enabled ? 1 : 0;
    uniforms.uHueShift.value = THREE.MathUtils.degToRad(spectral.hueShift);
    uniforms.uSaturation.value = spectral.saturation;
    uniforms.uPrismAmount.value = spectral.prismAmount;
    uniforms.uShadowTint.value.set(...colorVector(spectral.shadowTint).toArray());
    uniforms.uHighlightTint.value.set(...colorVector(spectral.highlightTint).toArray());
    uniforms.uTintStrength.value = spectral.tintStrength;
    uniforms.uSolarize.value = spectral.solarize;
    uniforms.uChannelMap.value = CHANNEL_MAP[spectral.channelMap] ?? 0;

    if (previousFeedback !== feedback.enabled) this.clearFeedback();
  }

  render(sourceCanvas, options = {}) {
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

    if (options.updateSource !== false) this.texture.needsUpdate = true;
    this.material.uniforms.uTime.value = performance.now() - this.startedAt;
    this.material.uniforms.tFeedback.value = this.feedbackRead.texture;

    this.renderer.setRenderTarget(this.feedbackWrite);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.displayMaterial.uniforms.tFrame.value = this.feedbackWrite.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.displayScene, this.camera);

    [this.feedbackRead, this.feedbackWrite] = [this.feedbackWrite, this.feedbackRead];
    if (this.settings.feedback.enabled) this.feedbackFrames += 1;
    return true;
  }

  captureDataURL(type = 'image/png', quality) {
    if (this.lastSource) this.render(this.lastSource, { updateSource: true });
    return this.canvas.toDataURL(type, quality);
  }

  getDiagnostics() {
    return {
      backend: 'three-webgl2',
      size: { width: this.width, height: this.height },
      contextLost: this.context.isContextLost(),
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      drawCalls: this.renderer.info.render.calls,
      feedback: {
        enabled: this.settings.feedback.enabled,
        frames: this.feedbackFrames,
        pingPongTargets: 2
      },
      spectral: {
        enabled: this.settings.spectral.enabled,
        channelMap: this.settings.spectral.channelMap,
        prismAmount: this.settings.spectral.prismAmount
      }
    };
  }

  dispose() {
    this.texture?.dispose();
    this.feedbackRead?.dispose();
    this.feedbackWrite?.dispose();
    this.material.dispose();
    this.displayMaterial.dispose();
    this.geometry.dispose();
    this.renderer.dispose();
    this.texture = null;
    this.feedbackRead = null;
    this.feedbackWrite = null;
    this.lastSource = null;
  }
}

export default GpuLabRenderer;
