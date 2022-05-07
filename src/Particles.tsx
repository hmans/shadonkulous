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
    const width = 1024;
    const height = 1024;

    const size = width * height;
    const data = new Uint8Array(4 * size);

    for (let i = 0; i < size; i++) {
      const offset = i * 4;

      data[offset] = Math.random() * 256;
      data[offset + 1] = Math.random() * 256 - 128;
      data[offset + 2] = Math.random() * 256 - 128;
      data[offset + 3] = 256;
    }

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
          uniform sampler2D positions;
          uniform float pointSize;

          varying vec4 v_position;

          void main() {
              vec3 pos = texture2D(positions, position.xy).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = pointSize;

              v_position = vec4(pos, 1.0);
          }
          `,

        fragmentShader: /*glsl*/ `
        varying vec4 v_position;

        void main()
        {
          gl_FragColor = vec4(1., 0., 0., .25);
          gl_FragColor = v_position;
        }`,
      }),
    []
  );

  const geometry = useMemo(() => {
    const width = 1024;
    const height = 1024;

    var l = width * height;
    var vertices = new Float32Array(l * 3);

    for (var i = 0; i < l; i++) {
      var offset = i * 3;
      vertices[offset] = (i % width) / width;
      vertices[offset + 1] = i / width / height;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    return geometry;
  }, []);

  return <points material={renderMaterial} geometry={geometry}></points>;
};
