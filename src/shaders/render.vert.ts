export default /*glsl*/ `
uniform sampler2D u_positions;

varying vec3 v_pos;
varying vec2 v_uv;

void main()
{
  v_uv = uv;
  v_pos = texture2D(u_positions, position.xy).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(v_pos, 1.0);
  gl_PointSize = 4.0;
}
`;
