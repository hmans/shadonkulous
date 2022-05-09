export default /*glsl*/ `

uniform sampler2D u_positions;
uniform float u_time;

varying vec2 v_uv;

void main()
{
  /* Get the current position */
  vec3 position = texture2D(u_positions, v_uv).rgb;

  /* Animate */
  position.x += cos(u_time);

  /* Set the position as the pixel's color */
  gl_FragColor = vec4(position, 1.0);
}

`;
