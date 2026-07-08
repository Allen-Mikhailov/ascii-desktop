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

vec3 fgColor = vec3(235.0 / 255.0, 162.0 / 255.0, 19.0 / 255.0);

layout(binding = 1) uniform sampler2D fontTex;

const float NUM_CHARS = 10.0;

// look up glyph coverage for charIndex at local cell-uv
float glyph(vec2 uv, float charIndex) {
    vec2 atlasUV = vec2((charIndex + uv.x) / NUM_CHARS, uv.y);
    return texture(fontTex, atlasUV).r;
}

mat2 rotate(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, s, -s, c);
}

// Standard 3D rotation matrices
mat3 lookAtRotation(vec3 origin, vec3 target, vec3 worldUp) {
    vec3 zAxis = normalize(target - origin);       // "forward" — circle's normal points here
    vec3 xAxis = normalize(cross(worldUp, zAxis));  // "right"
    vec3 yAxis = cross(zAxis, xAxis);                // "up" (already orthonormal)

    return mat3(xAxis, yAxis, zAxis); // columns = basis vectors
}

void main() {
	vec2 fragCoord = qt_TexCoord0 * ubuf.iResolution;

	vec2 cellOrigin = floor(fragCoord / ubuf.cellSize) * ubuf.cellSize;
	vec2 cellUV = cellOrigin * 2 / ubuf.iResolution;

	float aspect = ubuf.iResolution.x / ubuf.iResolution.y;
	vec2 p = vec2((cellUV.x-1) * aspect, cellUV.y - 1);


	float t = ubuf.iTime;

	vec3 world_up = vec3(0.0, 1.0, 0.0);

	vec3 look = normalize(vec3(sin(t), 1, 1));


	// Cool Code goes here
	vec2 ring_center = vec2(0, sin(t)*0);
	vec3 ring_center3 = vec3(ring_center, 0);
	float ring_radius = 0.1;
	float ring_thickness = 0.03;

	float angle = 3.14 / 4.0 * sin(t);

	vec2 offset = ring_center - p;
	vec3 offset3 = vec3(offset.x, offset.y, 0);

	mat3 rotation = lookAtRotation(ring_center3, look, world_up);

	vec3 rotated = rotation * offset3;
	//vec3 rotated = inverse(rotation) * offset3;

	p = vec2(rotated.x, rotated.y);
	
	float d = dot(p, p) - ring_radius;
	float lum = max(1-abs(d/ring_thickness), 0);
	lum = clamp(lum, 0.0, 0.999);

	vec3 ringColor = fgColor;


	float charIndex = floor(lum * NUM_CHARS);

	vec2 localUV = fract(fragCoord / ubuf.cellSize);
	localUV.y = 1.0 - localUV.y; // atlas is top-down, GL uv is bottom-up

	float coverage = glyph(localUV, charIndex);
	vec3 color = mix(ubuf.bgColor, ringColor, coverage);

	fragColor = vec4(color, 1.0) * ubuf.qt_Opacity;
}
