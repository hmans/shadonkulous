export default /*glsl*/ `
uniform float pointSize;
uniform float time;

attribute vec3 velocity;
attribute vec3 acceleration;

varying vec4 v_position;

void main() {
  vec3 acc = acceleration * 0.5 * time * time;
  vec3 vel = velocity * time;
  vec3 pos = acc + vel + position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;

  v_position = gl_Position;
}`;
