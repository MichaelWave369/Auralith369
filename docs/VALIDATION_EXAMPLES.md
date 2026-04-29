# Validation Examples

## Minimal valid project
```json
{
  "title": "Auralith Project",
  "version": "0.1.0-alpha",
  "canvas": { "width": 900, "height": 520 },
  "layers": [
    { "id": "base-1", "name": "Base Layer", "visible": true, "opacity": 1, "blendMode": "normal" }
  ]
}
```

## Rejected oversized canvas
```json
{
  "canvas": { "width": 9000, "height": 520 },
  "layers": []
}
```

## Rejected invalid image data URL
```json
{
  "canvas": { "width": 900, "height": 520 },
  "layers": [
    { "id": "base-1", "name": "Base", "imageData": "http://example.com/image.png" }
  ]
}
```

## Rejected too many layers
```json
{
  "canvas": { "width": 900, "height": 520 },
  "layers": ["... more than 128 layers ..."]
}
```
