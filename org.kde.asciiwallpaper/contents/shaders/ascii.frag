#version 440

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float iTime;
    vec2  iResolution;
    vec2  cellSize;     // ascii cell size in pixels, e.g. (16,16)
    vec3  fgColor;
    vec3  bgColor;
} ubuf;

layout(binding = 1) uniform sampler2D fontTex;

const float NUM_CHARS = 10.0;

// look up glyph coverage for charIndex at local cell-uv
float glyph(vec2 uv, float charIndex) {
    vec2 atlasUV = vec2((charIndex + uv.x) / NUM_CHARS, uv.y);
    return texture(fontTex, atlasUV).r;
}

// purely procedural animated field -- this is the "video" replacement.
// swap this function out for any pattern you like (flow noise, audio-reactive, etc.)
float field(vec2 p, float t) {
    float v = 0.0;
    v += sin(p.x * 6.0 + t * 1.0);
    v += sin(p.y * 6.0 - t * 1.3);
    v += sin((p.x + p.y) * 5.0 + t * 0.6);
    v += sin(length(p - 0.5) * 14.0 - t * 2.2);
    return v * 0.25 * 0.5 + 0.5; // normalize roughly to 0..1
}

void main() {
    vec2 fragCoord = qt_TexCoord0 * ubuf.iResolution;

    vec2 cellOrigin = floor(fragCoord / ubuf.cellSize) * ubuf.cellSize;
    vec2 cellUV = cellOrigin / ubuf.iResolution;

    float lum = clamp(field(cellUV * 2.0, ubuf.iTime), 0.0, 0.999);
    float charIndex = floor(lum * NUM_CHARS);

    vec2 localUV = fract(fragCoord / ubuf.cellSize);
    localUV.y = 1.0 - localUV.y; // atlas is top-down, GL uv is bottom-up

    float coverage = glyph(localUV, charIndex);
    vec3 color = mix(ubuf.bgColor, ubuf.fgColor, coverage);

    fragColor = vec4(color, 1.0) * ubuf.qt_Opacity;
}

void main3() {
    vec2 fragCoord = qt_TexCoord0 * ubuf.iResolution;
    vec2 cellOrigin = floor(fragCoord / ubuf.cellSize) * ubuf.cellSize;
    vec2 cellUV = cellOrigin / ubuf.iResolution;
    float lum = clamp(field(cellUV * 2.0, ubuf.iTime), 0.0, 0.999);
    fragColor = vec4(vec3(lum), 1.0) * ubuf.qt_Opacity;   // debug: skip glyph lookup
}

