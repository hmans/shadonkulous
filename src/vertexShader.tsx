export default /*glsl*/ `
uniform float pointSize;
uniform float time;

attribute vec3 velocity;
attribute vec3 acceleration;

varying vec4 v_position;
varying vec3 v_uv;

void main() {
  /* Start with the initial position */
  vec3 pos = position;

  /* Apply velocity */
  pos += velocity * time;

  /* Apply acceleration */
  pos += 0.5 * acceleration * time * time;

  /* DONE. Set gl variables and varyings. */
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
  v_position = gl_Position;
  v_uv = position;
}`;
