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

const float PI = 3.1459;

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

// Returns false if the line is parallel to the plane (no unique intersection)
vec2 intersectLinePlane(
    vec3 lineOrigin, vec3 lineDir,
    vec3 planePoint, vec3 planeNormal,
    out vec3 intersection
) {
    float denom = dot(planeNormal, lineDir);

    // Line is parallel to the plane (or lies in it)
    if (abs(denom) < 1e-6) {
        return vec2(0, 0);
    }

    float t = dot(planePoint - lineOrigin, planeNormal) / denom;
    intersection = lineOrigin + t * lineDir;
    return vec2(1, t);
}

struct ring {
	vec3 pos;
	float radius;

};

// const ring Rings[3] = ring[3](


// );

void main() {
	float t = ubuf.iTime * 0.05;
	vec2 fragCoord = qt_TexCoord0 * ubuf.iResolution;

	vec2 cellOrigin = floor(fragCoord / ubuf.cellSize) * ubuf.cellSize;
	//vec2 cellUV = cellOrigin * 2 / ubuf.iResolution;
	 vec2 cellUV = fragCoord * 2 / ubuf.iResolution;

	float aspect = ubuf.iResolution.x / ubuf.iResolution.y;
	vec2 p = vec2((cellUV.x-1) * aspect, cellUV.y - 1);


	


	// Cool Code goes here
	vec2 ring_center = vec2(0, sin(t)*0);
	vec3 ring_center3 = vec3(ring_center, 0);
	float ring_radius = 0.3;
	float ring_thickness = 0.2;

	vec3 world_up = vec3(0.0, 1.0, 0.0);
	vec3 look = normalize(vec3(-1, -1, 1));
	mat3 ringRot = lookAtRotation(ring_center3, look, world_up);

	float lum = 0.5;

	vec3 ringColor = fgColor;

	vec3 camPos = vec3(p.x, p.y, 0);
	vec3 rayDir = vec3(0, 0, 1);

	vec3 hitPoint;
	vec2 result = intersectLinePlane(camPos, rayDir, ring_center3, look, hitPoint);
	if (result.x == 1) {
		// transform hitPoint into the circle's local 2D space to test against radius
		vec3 local = hitPoint - ring_center3;
		float u = dot(local, ringRot[0]); // xAxis/yAxis from your rotation basis
		float v = dot(local, ringRot[1]);
		float rot = mod(atan(v, u) + PI + t*3, PI * 2);
		float distFromCenter = length(vec2(u, v));
		float distFromRing = distFromCenter - ring_radius;
		
		// 0 to 1 inside circle section
		float f = mod(rot + distFromCenter * - 2, PI / 2.0) / (PI/2.0);
		float f1 = (1-abs(f-0.5) *2);


		// These start at 0
		float inner_d = min(distFromRing, 0);
		float outer_d = max(distFromRing, 0);

		float outer = max(sign(distFromRing), 0);


		float ring_thick = ring_thickness * (1+10*f1 * outer);

		lum = max(1-abs(distFromRing)/ring_thick, 0);
		// lum = lum * f1
		lum = clamp(lum, 0.0, 0.999);
		
		ringColor = ringColor + vec3(1,1,1) * result.y;
	} 
	


	float charIndex = floor(lum * NUM_CHARS);

	vec2 localUV = fract(fragCoord / ubuf.cellSize);
	localUV.y = 1.0 - localUV.y; // atlas is top-down, GL uv is bottom-up

	float coverage = glyph(localUV, charIndex);
	vec3 color = mix(ubuf.bgColor, mix(ubuf.bgColor, ringColor, lum), coverage);

	fragColor = vec4(color, 1.0) * ubuf.qt_Opacity;
}
