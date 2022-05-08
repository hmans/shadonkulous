import { useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { insideSphere, number, plusMinus } from "randomish";
import { FC, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";
import { useBuffer } from "./useBuffer";
import fragmentShader from "./fragmentShader";
import vertexShader from "./vertexShader";

export const Particles: FC = () => {
  const { count, size } = useControls({
    count: { value: 1_000, min: 100, max: 1_000_000, step: 100 },
    size: { value: 3, min: 1, max: 20 },
  });

  const ref = useRef<Points>(null!);

  const positions = useBuffer(count, () => {
    const pos = insideSphere();
    return [pos.x, pos.y, pos.z];
  });

  const velocities = useBuffer(count, () => {
    const vel = insideSphere();
    return [vel.x, Math.pow(Math.random(), 2) * 5, vel.z];
  });

  const accelerations = useBuffer(count, () => [
    0 + plusMinus(1),
    -5 + plusMinus(1),
    plusMinus(1),
  ]);

  const renderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          pointSize: { value: size },
          time: { value: 0 },
        },

        vertexShader,
        fragmentShader,
        transparent: true,
      }),
    [count, size]
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
  }, [positions, velocities, accelerations]);

  useFrame((_, dt) => {
    renderMaterial.uniforms.time.value += dt;
    // ref.current.rotation.y += dt * 0.3;
  });

  return (
    <points
      ref={ref}
      material={renderMaterial}
      geometry={geometry}
      position-y={3}
    ></points>
  );
};
