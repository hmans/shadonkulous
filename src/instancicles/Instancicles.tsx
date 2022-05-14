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

export const Instancicles: FC<{
  maxParticles?: number;
  safetySize?: number;
}> = ({ maxParticles = 10_000, safetySize = 500 }) => {
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
    // console.log("spawnParticle", playhead.current, clock.elapsedTime);

    const mat = new Matrix4().compose(
      tmpPosition.random().multiplyScalar(3),
      tmpRotation.random(),
      tmpScale.setScalar(1)
    );
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

    scaleStart.setXYZ(playhead.current, 1, 1, 1);
    scaleStart.needsUpdate = true;
    scaleStart.updateRange.offset = playhead.current * 3;
    scaleStart.updateRange.count = 3;

    scaleEnd.setXYZ(playhead.current, 0.1, 0.1, 0.1);
    scaleEnd.needsUpdate = true;
    scaleEnd.updateRange.offset = playhead.current * 3;
    scaleEnd.updateRange.count = 3;

    /* Advance playhead */
    if (playhead.current >= imesh.current.count) imesh.current.count++;
    playhead.current++;
    if (playhead.current > maxParticles) playhead.current = 0;
  }, []);

  useEffect(() => {
    const pos = new Vector3();
    const quat = new Quaternion();
    const scale = new Vector3();

    const interval = setInterval(() => {
      spawnParticle(1);
    }, 20);

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
