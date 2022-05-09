export default /*glsl*/ `

uniform sampler2D u_positions;

varying vec2 v_uv;

void main()
{
  vec3 position = texture2D(u_positions, v_uv).rgb;
  gl_FragColor = vec4(position, 1.0);
}

`;
