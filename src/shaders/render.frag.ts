export default /* glsl */ `

varying vec3 v_pos;
varying vec2 v_uv;

void main()
{
  gl_FragColor = vec4(v_pos, 0.5);
}
`;
