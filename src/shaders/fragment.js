const fragment = /* glsl */ `

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 Mouse;
uniform vec3 sphereColor;
uniform float angle;
uniform float distanceToCenter;
uniform int mode; // 0 for Sphere, 1 for Cube, 2 for Prism
varying vec2 uvs;

float distanceToSphere(vec3 p) {
    p = mod(p, 1.0) - vec3(0.5);
    vec3 sphereCenter = vec3(0., 0., 0.);
    float radius = 0.23;
    return length(p - sphereCenter) - radius;
}

float distanceToCube(vec3 p) {
    p = mod(p, 1.0) - vec3(0.5);
    vec3 cubeCenter = vec3(0., 0., 0.);
    vec3 halfSize = vec3(0.2, 0.2, 0.2);
    vec3 d = abs(p - cubeCenter) - halfSize;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float distanceToPyramid(vec3 p, float h, float size) {
    float m2 = h*h + 0.25;
    
    // symmetry
    p.xz = abs(p.xz);
    p.xz = (p.z>p.x) ? p.zx : p.xz;
    p.xz -= 0.5;
	
    // project into face plane (2D)
    vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
    float s = max(-q.x,0.0);
    float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
    float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
	float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
    float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
    // recover 3D and scale, and add sign
    return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));;
}

float sceneDistance(vec3 p) {
    if (mode == 0) {
        return distanceToSphere(p);
    } else if (mode == 1) {
        return distanceToCube(p);
    } else if (mode == 2) {
        return distanceToPyramid(p, 0.2, 0.4);
    }
}

vec3 calculate_normals(in vec3 p) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = sceneDistance(p + small_step.xyy) - sceneDistance(p - small_step.xyy);
    float gradient_y = sceneDistance(p + small_step.yxy) - sceneDistance(p - small_step.yxy);
    float gradient_z = sceneDistance(p + small_step.yyx) - sceneDistance(p - small_step.yyx);
    
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

// Get color based on user's preference
vec3 getObjectColor() {
    return sphereColor;
}

vec3 ray_march(vec3 rO, vec3 rD) {
    vec3 rayOrigin = rO;
    vec3 rayDirection = rD;
    int iterationsCount = 0;
    float dis;
    float objectId = -1.0;  // Initialize object ID
    // Ray marching loop
    for (int i = 0; i < 1000; i++) {
        dis = sceneDistance(rayOrigin);
        // Check if close enough to the surface
        if (dis < 0.001) {
            vec3 color = getObjectColor();  // Get color based on object ID
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
    return vec3(1);
}

void main() {
    // Camera setup
    vec3 cameraPos = vec3(0.0, 0.0, distanceToCenter);  // Camera
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
