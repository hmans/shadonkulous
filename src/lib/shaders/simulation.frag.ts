export default /*glsl*/ `

uniform sampler2D u_data;
uniform float u_deltatime;
uniform float u_time;

varying vec2 v_uv;

void main()
{
  vec3 position = texture2D(u_data, v_uv).rgb;
  position *= 1.0 + 0.25 * u_deltatime;
  gl_FragColor = vec4(position, 1.0);
}

`;
