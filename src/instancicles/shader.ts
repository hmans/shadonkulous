export const vertexShader = /* glsl */ `
uniform float u_time;

attribute vec3 velocity;
attribute vec3 acceleration;

void main() {
  float t = u_time;

  csm_Position += t * velocity + 0.5 * t * t * acceleration;
}
`;

export const fragmentShader = /* glsl */ `
`;
