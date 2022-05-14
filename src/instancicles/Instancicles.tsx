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

const tmpPosition = new Vector3();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3();
const tmpMatrix4 = new Matrix4();

export const Instancicles: FC<{
  maxParticles?: number;
  safetySize?: number;
}> = ({ maxParticles = 20_000, safetySize = 500 }) => {
  const maxInstanceCount = maxParticles + safetySize;

  const imesh = useRef<InstancedMesh>(null!);
  const material = useRef<CSMImpl>(null!);
  const { clock } = useThree();

  const createAttribute = (itemSize: number) =>
    new InstancedBufferAttribute(
      new Float32Array(maxInstanceCount * itemSize),
      itemSize
    );

  const timeStart = useMemo(() => createAttribute(1), [maxInstanceCount]);
  const timeEnd = useMemo(() => createAttribute(1), [maxInstanceCount]);
  const velocity = useMemo(() => createAttribute(3), [maxInstanceCount]);
  const acceleration = useMemo(() => createAttribute(3), [maxInstanceCount]);
  const colorStart = useMemo(() => createAttribute(4), [maxInstanceCount]);
  const colorEnd = useMemo(() => createAttribute(4), [maxInstanceCount]);
  const scaleStart = useMemo(() => createAttribute(3), [maxInstanceCount]);
  const scaleEnd = useMemo(() => createAttribute(3), [maxInstanceCount]);

  useEffect(() => {
    /* Add some extra attributes to the instanced mesh */
    imesh.current.geometry.setAttribute("timeStart", timeStart);
    imesh.current.geometry.setAttribute("timeEnd", timeEnd);
    imesh.current.geometry.setAttribute("velocity", velocity);
    imesh.current.geometry.setAttribute("acceleration", acceleration);
    imesh.current.geometry.setAttribute("colorStart", colorStart);
    imesh.current.geometry.setAttribute("colorEnd", colorEnd);
    imesh.current.geometry.setAttribute("scaleStart", scaleStart);
    imesh.current.geometry.setAttribute("scaleEnd", scaleEnd);

    imesh.current.count = 0;
  }, [timeStart, timeEnd, velocity, acceleration, colorStart, colorEnd]);

  const playhead = useRef(0);

  const spawnParticle = useCallback((count: number) => {
    console.log("spawnParticle", playhead.current, clock.elapsedTime);

    const { instanceMatrix } = imesh.current;

    [
      instanceMatrix,
      timeStart,
      timeEnd,
      velocity,
      acceleration,
      colorStart,
      colorEnd,
      scaleStart,
      scaleEnd,
    ].forEach((attribute) => {
      attribute.needsUpdate = true;
      attribute.updateRange.offset = playhead.current * attribute.itemSize;
      attribute.updateRange.count = count * attribute.itemSize;
    });

    for (let i = 0; i < count; i++) {
      /* Set Instance Matrix */
      imesh.current.setMatrixAt(
        playhead.current,
        tmpMatrix4.compose(
          tmpPosition.random().multiplyScalar(3),
          tmpRotation.random(),
          tmpScale.setScalar(1)
        )
      );

      /* Set times */
      timeStart.setX(playhead.current, clock.elapsedTime);
      timeEnd.setX(playhead.current, clock.elapsedTime + 4);

      /* Set velocity */
      velocity.setXYZ(
        playhead.current,
        ...new Vector3()
          .randomDirection()
          .multiplyScalar(Math.random() * 5)
          .toArray()
      );

      acceleration.setXYZ(playhead.current, 0, -5, 0);
      colorStart.setXYZW(playhead.current, 1, 1, 1, 1);
      colorEnd.setXYZW(playhead.current, 1, 1, 1, 0);
      scaleStart.setXYZ(playhead.current, 1, 1, 1);
      scaleEnd.setXYZ(playhead.current, 0.1, 0.1, 0.1);

      /* Advance playhead */
      playhead.current++;
    }

    /* Increase count of imesh to match playhead */
    if (playhead.current > imesh.current.count)
      imesh.current.count = playhead.current;
    if (playhead.current > maxParticles) playhead.current = 0;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      spawnParticle(100);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const uniforms = useMemo(() => ({ u_time: { value: 0 } }), []);

  useFrame(() => {
    material.current.uniforms.u_time.value = clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={imesh}
      args={[undefined, undefined, maxInstanceCount]}
      position-y={8}
    >
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
