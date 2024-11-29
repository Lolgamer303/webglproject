const fragment = /* glsl */ `

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 Mouse;
uniform vec3 MouseColor;
uniform float angle;
varying vec2 uvs;

// Smooth minimum function
float smoothMin(float d1, float d2, float k) {
    float h = max(k - abs(d1 - d2), 0.0) / k;
    return min(d1, d2) - h * h * k * 0.25;
}

// Sphere SDF with oscillating motion
float distanceToMovingSphere(vec3 p) {
    p = mod(p, 1.0) - vec3(0.5);
    vec3 sphereCenter = vec3(0., 0., 0.); // Sphere moves left and right
    float radius = 0.2;
    return length(p - sphereCenter) - radius;
}

float distanceToPlane(vec3 p, float y) {
    return abs(p.y - y);
}

// Cube SDF
float distanceToCube(vec3 p, vec3 cubeCenter, vec3 cubeSize) {
    vec3 d = abs(p - cubeCenter) - cubeSize;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

// Combined distance function with object ID
vec2 sceneDistance(vec3 p) {
    float sphereDist = distanceToMovingSphere(p);
    return vec2(sphereDist, 1.0);
}
vec3 calculate_normals(in vec3 p) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = sceneDistance(p + small_step.xyy).x - sceneDistance(p - small_step.xyy).x;
    float gradient_y = sceneDistance(p + small_step.yxy).x - sceneDistance(p - small_step.yxy).x;
    float gradient_z = sceneDistance(p + small_step.yyx).x - sceneDistance(p - small_step.yyx).x;
    
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

// Get color based on object ID
vec3 getObjectColor(float objectId) {
    if (objectId == 1.0) {
        return MouseColor; // Red for sphere
    } else if (objectId == 2.0) {
        return vec3(0.2, 0.2, 1.0); // Blue for cube
    } else if (objectId == 3.0) {
        return vec3(0.4, 0.4, 0.4);
    }
    return vec3(1.0); // Default color (white)
}

vec3 ray_march(vec3 rO, vec3 rD) {
    vec3 rayOrigin = rO;
    vec3 rayDirection = rD;
    int iterationsCount = 0;
    float dis;
    float objectId = -1.0;  // Initialize object ID
    // Ray marching loop
    for (int i = 0; i < 1000; i++) {
        vec2 distAndId = sceneDistance(rayOrigin);
        dis = distAndId.x;
        objectId = distAndId.y;
        // Check if close enough to the surface
        if (dis < 0.01) {
            vec3 color = getObjectColor(objectId);  // Get color based on object ID
            float grayValue = float(iterationsCount) / 1000.0;  // Normalize iterationsCount to range [0, 1]
            vec3 normal = calculate_normals(rayOrigin);
            // For now, hard-code the light's position in our scene
            vec3 light_position = vec3(2.0, -5.0, 3.0);
            // Calculate the unit direction vector that points from
            // the point of intersection to the light source
            vec3 direction_to_light = normalize(rayOrigin - light_position);
            float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
            return color * diffuse_intensity; 
        }


        // Move the ray origin forward along the ray direction
        rayOrigin += rayDirection * dis;
        iterationsCount += 1;
    }
    return vec3(0.5, 0.5, 1.0);
}

void main() {
    // Camera setup
    vec3 cameraPos = vec3(0.0, 0.0, 10.0);  // Camera
    vec3 targetPos = vec3(0.0, 0.0, 0.0); // The camera is looking at the origin
    vec3 rayOrigin = cameraPos;
    
    // Aspect ratio and field of view
    float fov = 0.15;  // Field of view factor; you can adjust this for zoom
    vec2 uv = (uvs - 0.5) * 2.0;  // Center uvs around (0,0)
    uv *= iResolution.x / iResolution.y;  // Correct for aspect ratio

    // Ray direction setup
    vec3 rayDirection = normalize(vec3(uv * fov, -1.0));  // Adjust for perspective
    
    mat3 rotationMatrix = mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
    rayOrigin = rotationMatrix * (rayOrigin - targetPos);
    rayDirection = rotationMatrix * rayDirection;

    // Perform ray marching
    vec3 color = ray_march(rayOrigin, rayDirection);

    // Set the fragment color
    gl_FragColor = vec4(color, 1.0);
}


`;
export default fragment;
