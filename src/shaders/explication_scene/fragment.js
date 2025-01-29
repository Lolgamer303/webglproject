const fragment = /* glsl */ `

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 Mouse;
uniform vec3 sphereColor;
uniform float angleX;
uniform float angleY;
uniform float size;
uniform bool enableAntiAliasing;
uniform vec3 cameraPos;
uniform vec3 targetPos;
uniform int iStep;
varying vec2 uvs;


float distanceToSphere(vec3 p, vec3 loc, float size) {
    vec3 sphereCenter = loc;
    float radius = size;
    return length(p - sphereCenter) - radius;
}
float distanceToTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float distanceToHalfSphere(vec3 p, vec3 loc, float size) {
    vec3 sphereCenter = loc;
    float radius = size;
    vec3 d = p - sphereCenter;
    float distToSphere = length(d) - radius;
    float distToPlane = dot(d, vec3(0.0, 1.0, 0.0));
    return max(distToSphere, distToPlane);
}

float distanceToPlane( vec3 p, vec3 n, float h ) {
  // n must be normalized
  return dot(p, n) + h;
}
float distanceToBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
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

// arbitrary orientation
float distanceToCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 pa = p - a;
    vec3 ba = b - a;
    float baba = dot(ba, ba);
    float paba = dot(pa, ba);

    // Check for division by zero
    if (baba == 0.0) {
        return 1000.0; // or some other appropriate value indicating a large distance
    }

    // Calculate the projection of p onto the line defined by a and b
    float t = clamp(paba / baba, 0.0, 1.0);
    vec3 closestPoint = a + t * ba;

    // Check if p is within a reasonable range of the cylinder
    if (distance(p, closestPoint) > r + 100.0) { // Adjust the threshold as needed
        return 1000.0; // or some other appropriate value indicating a large distance
    }

    float x = length(pa * baba - ba * paba) - r * baba;
    float y = abs(paba - baba * 0.5) - baba * 0.5;
    float x2 = x * x;
    float y2 = y * y * baba;
    float d = (max(x, y) < 0.0) ? -min(x2, y2) : (((x > 0.0) ? x2 : 0.0) + ((y > 0.0) ? y2 : 0.0));

    // Check for negative value under the square root
    if (d < 0.0) {
        return 1000.0; // or some other appropriate value indicating a large distance
    }

    return sign(d) * sqrt(abs(d)) / baba;
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
float distanceToPyramid(vec3 p, float h, vec3 rotation) {
    // Apply rotation
    mat3 rotX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotation.x), -sin(rotation.x),
        0.0, sin(rotation.x), cos(rotation.x)
    );
    mat3 rotY = mat3(
        cos(rotation.y), 0.0, sin(rotation.y),
        0.0, 1.0, 0.0,
        -sin(rotation.y), 0.0, cos(rotation.y)
    );
    mat3 rotZ = mat3(
        cos(rotation.z), -sin(rotation.z), 0.0,
        sin(rotation.z), cos(rotation.z), 0.0,
        0.0, 0.0, 1.0
    );
    p = rotX * rotY * rotZ * p;

    float m2 = h * h + 0.25;
        
    // symmetry
    p.xz = abs(p.xz);
    p.xz = (p.z > p.x) ? p.zx : p.xz;
    p.xz -= 0.5;
        
    // project into face plane (2D)
    vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
       
    float s = max(-q.x, 0.0);
    float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
        
    float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
    float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
        
    float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
        
    // recover 3D and scale, and add sign
    return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

float sceneDistance(vec3 p) {
    if (iStep == 0) {
        return 1000.0;
    }
    else if (iStep == 1) {
        return distanceToSphere(p, vec3(0., 0., 0.), 2.0);
    }
    else if (iStep == 2) {
        return distanceToBox(p, vec3(1.,1.,0.01));
    }
    else if (iStep == 3) {
        return min(distanceToBox(p, vec3(1.,1.,0.01)), min(distanceToBox(p + vec3(0., 0., 2.5), vec3(0.3,0.3,0.6)), distanceToPyramid(p + vec3(0., 0., 1.5), 0.5, vec3(-1.5, 0.0, 0.0))));
    }
    else if (iStep == 4 || iStep == 5 || iStep == 6) {
        float dist1 = min(distanceToBox(p + vec3(0., 0., 2.5), vec3(0.3,0.3,0.6)), distanceToPyramid(p + vec3(0., 0., 1.5), 0.5, vec3(-1.5, 0.0, 0.0)));
        float dist2 = min(distanceToCylinder(p + vec3(0., 0., 2.), vec3(0., 1., 10.), vec3(0., 0., 0.5), 0.02), dist1);
        float dist3 = min(distanceToCylinder(p + vec3(0., 0., 2.), vec3(0., 0., 10.), vec3(0., 0., 0.5), 0.02), dist2);
        float dist4 = min(distanceToCylinder(p + vec3(0., 0., 2.), vec3(1., 1., 10.), vec3(0., 0., 0.5), 0.02), dist3);
        float dist5 = min(distanceToCylinder(p + vec3(0., 0., 2.), vec3(1., 0., 10.), vec3(0., 0., 0.5), 0.02), dist4);
        return min(distanceToBox(p, vec3(1.,1.,0.01)), dist5);
    }
    else if (iStep == 7) {
        float dist1 = min(distanceToHalfSphere(p, vec3(0., 0., 0.), 1.0), distanceToSphere(p, vec3(2., 0., 0.5), 0.05));
        float dist2 = min(distanceToSphere(p, vec3(0., 0., 0.), 0.05), dist1);
        float dist3 = min(distanceToCylinder(p + vec3(0., 0., 0.), vec3(2., 0., 0.5), vec3(0., 0., 0.), 0.02), dist2);
        float dist4 = min(distanceToCylinder(p + vec3(0., 0., 0.), vec3(1., 0., 0.25), vec3(0., 0., 0.), 0.04), dist3);
        return dist4;
    }
    else if (iStep >= 8) {
        float dist1 = min(distanceToBox(p + vec3(0., 0., 2.5), vec3(0.3,0.3,0.6)), distanceToPyramid(p + vec3(0., 0., 1.5), 0.5, vec3(-1.5, 0.0, 0.0)));
        float dist2 = min(distanceToHalfSphere(p, vec3(0., 0., 4.), 1.0), dist1);
        float dist3 = min(distanceToSphere(p, vec3(0., 0., 4.), 0.05), dist2);
        vec3 rayOrigin = vec3(0., 0., -1.5);
        vec3 rayDir = normalize(vec3(0.5, 0., 0.) - rayOrigin);
        int iterNumber = iStep - 8;
        if (iterNumber > 5) {
            iterNumber = 5;
        }
        for (int i = 0; i < iterNumber; i++) {
            float halfSphereDist = distanceToHalfSphere(rayOrigin, vec3(0., 0., 4.), 1.0);
            dist3 = min(distanceToCylinder(p, rayOrigin, rayOrigin + rayDir * halfSphereDist, 0.02), dist3);
            dist3 = min(distanceToTorus(p - rayOrigin, vec2(halfSphereDist, 0.02)), dist3);
            dist3 = min(distanceToSphere(p, rayOrigin + rayDir * halfSphereDist, 0.05), dist3);
            rayOrigin = rayOrigin + rayDir * halfSphereDist;
        }
        return min(distanceToBox(p, vec3(1.,1.,0.01)), dist3);
    }
    return 1000.0;
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
    return sphereColor;
}

vec3 ray_march(vec3 rO, vec3 rD) {
    vec3 rayOrigin = rO;
    vec3 rayDirection = rD;
    int iterationsCount = 0;
    float dis;
    float prevDis = 0.0;
    for (int i = 0; i < 100; i++) {
        dis = sceneDistance(rayOrigin);
        if (dis < 0.03) {
            vec3 color = getObjectColor();
            vec3 normal = calculate_normals(rayOrigin);
            vec3 light_position = vec3(2.0, 5.0, -10.0);
            vec3 direction_to_light = normalize(light_position - rayOrigin);
            float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
            return color * diffuse_intensity;
        }
        if (dis > 40.0 && prevDis >= dis) {
            break;
        }
        rayOrigin += rayDirection * dis;
        iterationsCount += 1;
    }
    return vec3(0.1); // Background color
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
