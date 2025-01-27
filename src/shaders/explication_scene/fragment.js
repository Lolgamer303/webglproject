const fragment = /* glsl */ `

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 Mouse;
uniform vec3 sphereColor;
uniform float angleX;
uniform float angleY;
uniform float size;
uniform int mode; // 0 for Sphere, 1 for Cube, 2 for Octahedron
uniform bool enableAntiAliasing;
uniform vec3 cameraPos;
uniform vec3 targetPos;
uniform int iStep;
varying vec2 uvs;

bool isMiddleCube = false;

float distanceToSphere(vec3 p, float size) {
    p = vec3(0.);
    vec3 sphereCenter = vec3(0., 0., 0.);
    float radius = size;
    return length(p - sphereCenter) - radius;
}

float distanceToCube(vec3 p, float size) {
    p = mod(p, 1.0) - vec3(0.5);
    vec3 cubeCenter = vec3(0., 0., 0.);
    vec3 halfSize = vec3(size);
    vec3 d = abs(p - cubeCenter) - halfSize;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float distanceToMiddleCube(vec3 p, float size) {
    vec3 cubeCenter = vec3(0., 0., 0.);
    vec3 halfSize = vec3(size);
    vec3 d = abs(p - cubeCenter) - halfSize;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float distanceToOctahedron(vec3 p, float s) {
    p = mod(p, 1.0) - vec3(0.5);
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;

    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
}

float sceneDistance(vec3 p) {
    if (iStep == 0) {
        return 0.0;
    }
    else if (iStep == 1) {
        return distanceToSphere(p, 2.0);
    }
    else if (iStep == 2) {
        return distanceToCube(p, 2.0);
    }
    else if (iStep == 3) {
        return distanceToOctahedron(p, 2.0);
    }
    return 0.0;
}

vec3 calculate_normals(in vec3 p) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = sceneDistance(p + small_step.xyy) - sceneDistance(p - small_step.xyy);
    float gradient_y = sceneDistance(p + small_step.yxy) - sceneDistance(p - small_step.yxy);
    float gradient_z = sceneDistance(p + small_step.yyx) - sceneDistance(p - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 getObjectColor() {
    if (isMiddleCube) {
        return vec3(1.0, 0.0, 0.0);
    }
    return sphereColor;
}

vec3 ray_march(vec3 rO, vec3 rD) {
    vec3 rayOrigin = rO;
    vec3 rayDirection = rD;
    int iterationsCount = 0;
    float dis;
    for (int i = 0; i < 1000; i++) {
        dis = sceneDistance(rayOrigin);
        if (dis < 0.001) {
            vec3 color = getObjectColor();
            vec3 normal = calculate_normals(rayOrigin);
            vec3 light_position = vec3(2.0, -5.0, 3.0);
            vec3 direction_to_light = normalize(light_position - rayOrigin);
            float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
            return color * diffuse_intensity;
        }
        rayOrigin += rayDirection * dis;
        iterationsCount += 1;
    }
    return vec3(0.0); // Background color
}

vec3[2] applyCameraRotation(vec3 rayOrigin, vec3 rayDirection, vec3 targetPos) {
    mat3 rotationMatrix = mat3(
        cos(angleX), 0.0, sin(angleX),
        0.0, 1.0, 0.0,
        -sin(angleX), 0.0, cos(angleX)
    );
    rotationMatrix *= mat3(
        1.0, 0.0, 0.0,
        0.0, cos(angleY), -sin(angleY),
        0.0, sin(angleY), cos(angleY)
    );
    vec3 result[2];
    result[0] = rotationMatrix * (rayOrigin - targetPos);
    result[1] = rotationMatrix * rayDirection;
    return result;
}

void main() {
    float fov = 0.15;
    vec2 uv = (uvs - 0.5) * 2.0;
    uv *= iResolution.x / iResolution.y;

    vec3 accumulatedColor = vec3(0.0);
    vec3 rayOrigin = cameraPos;
    vec3 rayDirection = normalize(vec3(uv * fov, -1.0));
    vec3[2] rotated = applyCameraRotation(rayOrigin, rayDirection, targetPos);
    rayOrigin = rotated[0];
    rayDirection = rotated[1];
    accumulatedColor = ray_march(rayOrigin, rayDirection);

    gl_FragColor = vec4(accumulatedColor, 1.0);
}

`;
export default fragment;