import { useFrame } from "@react-three/fiber";
import { plusMinus } from "randomish";
import { FC, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";

const useBuffer = (
  width: number,
  height: number,
  factory: () => [number, number, number]
) =>
  useMemo(() => {
    const a = new Float32Array(3 * width * height);
    const l = width * height;

    for (let i = 0; i < l; i++) {
      const offset = i * 3;
      const r = factory();
      a[offset + 0] = r[0];
      a[offset + 1] = r[1];
      a[offset + 2] = r[2];
    }

    return a;
  }, []);

export const Particles: FC<{ width?: number; height?: number }> = ({
  width = 1024,
  height = 1024,
}) => {
  const ref = useRef<Points>(null!);

  const positions = useBuffer(width, height, () => [
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  ]);

  const velocities = useBuffer(width, height, () => [
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
  ]);

  const accelerations = useBuffer(width, height, () => [0, -9.81, 0]);

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          pointSize: { value: 3 },
          time: { value: 0 },
        },

        vertexShader: /*glsl*/ `
          uniform float pointSize;
          uniform float time;

          attribute vec3 velocity;
          attribute vec3 acceleration;

          varying vec4 v_position;

          void main() {
            vec3 acc = acceleration * 0.5 * time * time;
            vec3 vel = velocity * time;
            vec3 pos = acc + vel + position;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = pointSize;

            v_position = gl_Position;
          }
          `,

        fragmentShader: /*glsl*/ `
          varying vec4 v_position;

          void main()
          {
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            gl_FragColor = vec4(1.0, 1.0, 1.0, 0.2);
          }
        `,

        transparent: true,
      }),
    []
  );

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();

    geometry.setAttribute("position", new BufferAttribute(positions, 3));
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
