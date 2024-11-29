const vertex = /* glsl */ `

varying vec2 uvs;

void main() {
    uvs = position.xy * 0.5 + 0.5; // Convert position to UV coordinates

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}

`;

export default vertex;