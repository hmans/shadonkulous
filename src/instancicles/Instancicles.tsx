import { useFrame, useThree } from "@react-three/fiber";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSMImpl from "three-custom-shader-material/vanilla";
import * as shader from "./shader";

export const Instancicles: FC<{
  maxParticles?: number;
  safetySize?: number;
}> = ({ maxParticles = 1_000_000, safetySize = 500 }) => {
  const maxInstanceCount = maxParticles + safetySize;

  const imesh = useRef<InstancedMesh>(null!);
  const material = useRef<CSMImpl>(null!);
  const { clock } = useThree();

  const timeStart = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxInstanceCount), 1),
    [maxInstanceCount]
  );
  const timeEnd = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxInstanceCount), 1),
    [maxInstanceCount]
  );
  const velocity = useMemo(
    () =>
      new InstancedBufferAttribute(new Float32Array(maxInstanceCount * 3), 3),
    [maxInstanceCount]
  );
  const acceleration = useMemo(
    () =>
      new InstancedBufferAttribute(new Float32Array(maxInstanceCount * 3), 3),
    [maxInstanceCount]
  );
  const colorStart = useMemo(
    () =>
      new InstancedBufferAttribute(new Float32Array(maxInstanceCount * 4), 4),
    [maxInstanceCount]
  );
  const colorEnd = useMemo(
    () =>
      new InstancedBufferAttribute(new Float32Array(maxInstanceCount * 4), 4),
    [maxInstanceCount]
  );

  useEffect(() => {
    /* Add some extra attributes to the instanced mesh */
    imesh.current.geometry.setAttribute("timeStart", timeStart);
    imesh.current.geometry.setAttribute("timeEnd", timeEnd);
    imesh.current.geometry.setAttribute("velocity", velocity);
    imesh.current.geometry.setAttribute("acceleration", acceleration);
    imesh.current.geometry.setAttribute("colorStart", colorStart);
    imesh.current.geometry.setAttribute("colorEnd", colorEnd);

    imesh.current.count = 0;
  }, [timeStart, timeEnd, velocity, acceleration, colorStart, colorEnd]);

  const playhead = useRef(0);

  const spawnParticle = useCallback(
    (position: Vector3, quaternion: Quaternion, scale: Vector3) => {
      // console.log("spawnParticle", playhead.current, clock.elapsedTime);

      const mat = new Matrix4().compose(position, quaternion, scale);
      imesh.current.setMatrixAt(playhead.current, mat);

      const { instanceMatrix } = imesh.current;
      instanceMatrix.needsUpdate = true;
      instanceMatrix.updateRange.offset =
        playhead.current * instanceMatrix.itemSize;
      instanceMatrix.updateRange.count = instanceMatrix.itemSize;

      timeStart.setX(playhead.current, clock.elapsedTime);
      timeStart.needsUpdate = true;
      timeStart.updateRange.offset = playhead.current;
      timeStart.updateRange.count = 1;

      timeEnd.setX(playhead.current, clock.elapsedTime + 4);
      timeEnd.needsUpdate = true;
      timeEnd.updateRange.offset = playhead.current;
      timeEnd.updateRange.count = 1;

      velocity.setXYZ(
        playhead.current,
        ...new Vector3()
          .randomDirection()
          .multiplyScalar(Math.random() * 5)
          .toArray()
      );
      velocity.needsUpdate = true;
      velocity.updateRange.offset = playhead.current * 3;
      velocity.updateRange.count = 3;

      acceleration.setXYZ(playhead.current, 0, -5, 0);
      acceleration.needsUpdate = true;
      acceleration.updateRange.offset = playhead.current * 3;
      acceleration.updateRange.count = 3;

      colorStart.setXYZW(playhead.current, 1, 1, 1, 1);
      colorStart.needsUpdate = true;
      colorStart.updateRange.offset = playhead.current * 4;
      colorStart.updateRange.count = 4;

      colorEnd.setXYZW(playhead.current, 1, 1, 1, 0);
      colorEnd.needsUpdate = true;
      colorEnd.updateRange.offset = playhead.current * 4;
      colorEnd.updateRange.count = 4;

      /* Advance playhead */
      if (playhead.current >= imesh.current.count) imesh.current.count++;
      playhead.current++;
      if (playhead.current > maxParticles) playhead.current = 0;
    },
    []
  );

  useEffect(() => {
    const pos = new Vector3();
    const quat = new Quaternion();
    const scale = new Vector3();

    const interval = setInterval(() => {
      spawnParticle(
        pos.random(),
        quat.random(),
        // scale.setScalar(Math.random() > 0.5 ? 1 : 0.5)
        // scale.setScalar(0.1 + Math.pow(Math.random(), 2) * 0.3)
        scale.setScalar(1)
      );
    }, 15);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const uniforms = useMemo(() => ({ u_time: { value: 0 } }), []);

  useFrame(() => {
    material.current.uniforms.u_time.value = clock.elapsedTime;
  });

  return (
    <instancedMesh ref={imesh} args={[undefined, undefined, maxInstanceCount]}>
      <boxGeometry />
      <CustomShaderMaterial
        ref={material}
        baseMaterial={MeshStandardMaterial}
        color="hotpink"
        uniforms={uniforms}
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
        transparent
      />
    </instancedMesh>
  );
};
