export default /*glsl*/ `
varying vec4 v_position;
varying vec3 v_uv;

void main()
{
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  gl_FragColor = vec4(v_uv.z, 1.0, 1.0, v_uv.z);
}`;
