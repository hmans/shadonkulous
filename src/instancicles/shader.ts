export const vertexShader = /* glsl */ `
uniform float u_time;

attribute float timeStart;
attribute float timeEnd;
attribute vec3 velocity;
attribute vec3 acceleration;
attribute vec4 colorStart;
attribute vec4 colorEnd;

varying float v_timeStart;
varying float v_timeEnd;
varying float v_lifetime;
varying float v_age;
varying vec4 v_colorStart;
varying vec4 v_colorEnd;

void main() {
  /* Set varyings */
  v_timeStart = timeStart;
  v_timeEnd = timeEnd;
  v_colorStart = colorStart;
  v_colorEnd = colorEnd;
  v_age = u_time - v_timeStart;
  v_lifetime = (u_time - v_timeStart) / (v_timeEnd - v_timeStart);

  /* Apply velocity and acceleration */
  vec3 offset = vec3(v_age * velocity + 0.5 * v_age * v_age * acceleration);

  /* Fixes rotation, but not scaling, argh! */
  offset *= mat3(instanceMatrix);
  csm_Position += offset;
}
`;

export const fragmentShader = /* glsl */ `
uniform float u_time;

varying float v_lifetime;
varying float v_age;
varying float v_timeStart;
varying float v_timeEnd;
varying vec4 v_colorStart;
varying vec4 v_colorEnd;

void main() {
  /* Discard this instance if it is not in the current time range */
  if (u_time < v_timeStart || u_time > v_timeEnd) discard;

  vec4 colorDistance = v_colorEnd - v_colorStart;
  csm_DiffuseColor = v_colorStart + colorDistance * v_lifetime;
}
`;
