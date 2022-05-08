export default /*glsl*/ `
varying vec4 v_position;
varying vec3 v_uv;

void main()
{
  gl_FragColor = vec4(
    v_uv.z,
    1.0,
    1.0,
    v_uv.z
  );
}`;
