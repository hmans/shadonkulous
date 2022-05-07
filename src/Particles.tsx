import { useFrame } from "@react-three/fiber";
import { FC, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Points,
  ShaderMaterial,
} from "three";

const useDataTexture = (width: number, height: number) =>
  useMemo(() => {
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

const useBuffer = (width: number, height: number) =>
  useMemo(() => {
    const a = new Float32Array(3 * width * height);
    const l = width * height;

    for (let i = 0; i < l; i++) {
      const offset = i * 3;
      a[offset + 0] = Math.random() * 2 - 1;
      a[offset + 1] = Math.random() * 2 - 1;
      a[offset + 2] = Math.random() * 2 - 1;
    }

    return a;
  }, []);

export const Particles: FC<{ width?: number; height?: number }> = ({
  width = 1024,
  height = 1024,
}) => {
  const ref = useRef<Points>(null!);

  const positions = useDataTexture(width, height);

  const velocities = useBuffer(width, height);
  const accelerations = useBuffer(width, height);

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          positions: { value: positions },
          pointSize: { value: 2 },
          time: { value: 0 },
        },

        vertexShader: /*glsl*/ `
          uniform sampler2D positions;
          uniform float pointSize;
          uniform float time;

          attribute vec3 velocity;
          attribute vec3 acceleration;

          varying vec4 v_position;

          void main() {
            // vec4 position = texture2D(positions, position.xy).xyz;

            vec3 acc = acceleration * 0.5 * time * time;
            vec3 vel = velocity * time;
            vec3 pos = acc + vel + position.xyz;

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
    geometry.setAttribute("velocity", new BufferAttribute(velocities, 3));
    geometry.setAttribute(
      "acceleration",
      new BufferAttribute(accelerations, 3)
    );
    return geometry;
  }, []);

  useFrame((_, dt) => {
    renderMaterial.uniforms.time.value += dt;
    // ref.current.rotation.y += dt * 0.3;
  });

  return (
    <points ref={ref} material={renderMaterial} geometry={geometry}></points>
  );
};
