import { useFrame } from "@react-three/fiber";
import { insideSphere, number, plusMinus } from "randomish";
import { FC, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";

const useBuffer = (count: number, factory: () => [number, number, number]) =>
  useMemo(() => {
    const a = new Float32Array(3 * count);
    const l = count;

    for (let i = 0; i < l; i++) {
      const offset = i * 3;
      const r = factory();
      a[offset + 0] = r[0];
      a[offset + 1] = r[1];
      a[offset + 2] = r[2];
    }

    return a;
  }, []);

const vertexShader = /*glsl*/ `
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
}`;

const fragmentShader = /*glsl*/ `
varying vec4 v_position;

void main()
{
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  gl_FragColor = vec4(10.0, 1.0, 1.0, 0.8);
}`;

export const Particles: FC<{ count?: number }> = ({ count = 1_000_000 }) => {
  const ref = useRef<Points>(null!);

  const positions = useBuffer(count, () => {
    const pos = insideSphere();
    return [pos.x, pos.y, pos.z];
  });

  const velocities = useBuffer(count, () => {
    const vel = insideSphere();
    return [vel.x, Math.pow(Math.random(), 2) * 5, vel.z];
  });

  const accelerations = useBuffer(count, () => [0, -1, 0]);

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          pointSize: { value: 3 },
          time: { value: 0 },
        },

        vertexShader,
        fragmentShader,
        transparent: true,
        toneMapped: false,
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
