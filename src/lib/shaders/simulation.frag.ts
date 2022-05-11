export default /*glsl*/ `

uniform sampler2D u_data;
uniform float u_deltatime;

varying vec2 v_uv;

void main()
{
  /* Get the current position */
  vec3 position = texture2D(u_data, v_uv).rgb;

  /* Animate */
  position *= 1.01;

  /* Set the position as the pixel's color */
  gl_FragColor = vec4(position, 1.0);
}

`;
