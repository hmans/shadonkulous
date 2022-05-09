export default /*glsl*/ `

uniform float u_time;

varying vec2 v_uv;

void main()
{
  /*
  We're not going to do anything interesting here. All the fun is
  happening in the fragment shader.
  */

  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

`;
