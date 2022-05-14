export const vertexShader = /* glsl */ `
uniform float u_time;

void main() {
  csm_Position *= 2.0 + cos(u_time) * 0.5;
}
`;

export const fragmentShader = /* glsl */ `
`;
