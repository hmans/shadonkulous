export default /*glsl*/ `

uniform sampler2D u_data;
uniform float u_deltatime;
uniform float u_time;

varying vec2 v_uv;

void main()
{
  /* Get the current position */
  vec3 position = texture2D(u_data, v_uv).rgb;

  /* Animate */
  position *= 1.0 + u_deltatime;

  /* Set the position as the pixel's color */
  gl_FragColor = vec4(position, 1.0);
}

`;
