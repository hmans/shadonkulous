export const vertexShader = /* glsl */ `
uniform float u_time;

attribute vec3 positionStart;
attribute vec3 positionEnd;

void main() {
  csm_Position += positionStart;

  vec3 distance = positionEnd - positionStart;
  csm_Position += distance * u_time;
}
`;

export const fragmentShader = /* glsl */ `
`;
