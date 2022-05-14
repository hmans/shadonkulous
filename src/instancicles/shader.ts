export const vertexShader = /* glsl */ `
uniform float u_time;

attribute float timeStart;
attribute float timeEnd;
attribute vec3 velocity;
attribute vec3 acceleration;

varying float v_timeStart;
varying float v_timeEnd;

void main() {
  float t = u_time - timeStart;

  /* Apply velocity and acceleration */
  vec3 offset = t * velocity + 0.5 * t * t * acceleration;
  // offset = vec3(vec4(offset, 1.0) * instanceMatrix);
  csm_Position += offset;

  /* Pass varyings to fragment shader */
  v_timeStart = timeStart;
  v_timeEnd = timeEnd;
}
`;

export const fragmentShader = /* glsl */ `
uniform float u_time;

varying float v_timeStart;
varying float v_timeEnd;

void main() {
  /* Discard this instance if it is not in the current time range */
  if (u_time < v_timeStart || u_time > v_timeEnd) {
    discard;
  }
}
`;
