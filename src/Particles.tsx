import { useFrame } from "@react-three/fiber";
import { FC, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Points,
  ShaderMaterial,
} from "three";

const useDataTexture = () =>
  useMemo(() => {
    const width = 1024;
    const height = 1024;

    const length = width * height;
    const data = new Uint8Array(4 * length);

    for (let i = 0; i < length; i++) {
      const offset = i * 4;

      data[offset] = Math.random() * 256;
      data[offset + 1] = Math.random() * 256;
      data[offset + 2] = Math.random() * 256;
      data[offset + 3] = Math.random() * 256;
    }

    const texture = new DataTexture(data, width, height);
    texture.needsUpdate = true;

    return texture;
  }, []);

export const Particles: FC = () => {
  const ref = useRef<Points>(null!);

  const data = useDataTexture();

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          data: { value: data },
          pointSize: { value: 2 },
          time: { value: 0 },
        },

        vertexShader: /*glsl*/ `
          uniform sampler2D data;
          uniform float pointSize;
          uniform float time;

          varying vec4 v_position;

          void main() {
            vec4 data = texture2D(data, position.xy);

            vec3 pos = vec3(
              cos(time * data.x) * data.y * data.a,
              sin(time * data.y) * data.a * data.y * data.x,
              cos(time * data.z) * data.a * data.x
            );

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = pointSize;

            v_position = vec4(pos, 1.0);
          }
          `,

        fragmentShader: /*glsl*/ `
          varying vec4 v_position;

          void main()
          {
            // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            gl_FragColor = v_position;
          }
        `,
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

  useFrame((_, dt) => {
    renderMaterial.uniforms.time.value += dt;
    ref.current.rotation.y += dt * 0.3;
  });

  return (
    <points ref={ref} material={renderMaterial} geometry={geometry}></points>
  );
};
