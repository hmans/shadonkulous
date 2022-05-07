import { FC, useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  ShaderMaterial,
} from "three";

export const Particles: FC = () => {
  const positions = useMemo(() => {
    const width = 512;
    const height = 512;

    const size = width * height;
    const data = new Uint8Array(4 * size);
    const color = new Color(0xffffff);

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    for (let i = 0; i < size; i++) {
      const stride = i * 4;

      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = 255;
    }

    // used the buffer to create a DataTexture

    const texture = new DataTexture(data, width, height);
    texture.needsUpdate = true;

    return texture;
  }, []);

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          positions: { value: positions },
          pointSize: { value: 2 },
        },
        vertexShader: /*glsl*/ `
          uniform sampler2D positions;//RenderTarget containing the transformed positions
          uniform float pointSize;//size
          void main() {

              //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
              vec3 pos = texture2D( positions, position.xy ).xyz;
              //pos now contains a 3D position in space, we can use it as a regular vertex

              //regular projection of our position
              gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

              //sets the point size
              gl_PointSize = pointSize;
          }
          `,

        fragmentShader: /*glsl*/ `
        void main()
        {
            gl_FragColor = vec4( vec3( 1. ), .25 );
        }`,
      }),
    []
  );

  const geometry = useMemo(() => {
    const width = 256;
    const height = 256;

    var l = width * height;
    var vertices = new Float32Array(l * 3);
    for (var i = 0; i < l; i++) {
      var i3 = i * 3;
      vertices[i3] = (i % width) / width;
      vertices[i3 + 1] = i / width / height;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    return geometry;
  }, []);

  return <points material={renderMaterial} geometry={geometry}></points>;
};
