export default /*glsl*/ `
varying vec4 v_position;

void main()
{
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  gl_FragColor = vec4(10.0, 1.0, 1.0, 0.8);
}`;
