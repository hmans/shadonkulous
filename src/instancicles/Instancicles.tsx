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

export const Instancicles: FC<{ maxParticles?: number }> = ({
  maxParticles = 10000,
}) => {
  const imesh = useRef<InstancedMesh>(null!);
  const material = useRef<CSMImpl>(null!);
  const { clock } = useThree();

  const timeStart = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxParticles), 1),
    []
  );
  const timeEnd = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxParticles), 1),
    []
  );
  const velocity = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxParticles), 3),
    []
  );
  const acceleration = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(maxParticles), 3),
    []
  );

  useEffect(() => {
    /* Add some extra attributes to the instanced mesh */
    imesh.current.geometry.setAttribute("timeStart", timeStart);
    imesh.current.geometry.setAttribute("timeEnd", timeEnd);
    imesh.current.geometry.setAttribute("velocity", velocity);
    imesh.current.geometry.setAttribute("acceleration", acceleration);

    imesh.current.count = 0;
  }, [maxParticles]);

  const playhead = useRef(0);

  const spawnParticle = useCallback(() => {
    // console.log("spawnParticle", playhead.current, clock.elapsedTime);

    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);

    const mat = new Matrix4().compose(position, quaternion, scale);
    imesh.current.setMatrixAt(playhead.current, mat);
    imesh.current.instanceMatrix.needsUpdate = true;

    timeStart.setX(playhead.current, clock.elapsedTime);
    timeStart.needsUpdate = true;
    timeStart.updateRange.offset = playhead.current;
    timeStart.updateRange.count = 1;

    timeEnd.setX(playhead.current, clock.elapsedTime + 2);
    timeEnd.needsUpdate = true;
    timeEnd.updateRange.offset = playhead.current;
    timeEnd.updateRange.count = 1;

    velocity.setXYZ(
      playhead.current,
      ...new Vector3().randomDirection().toArray()
    );
    velocity.needsUpdate = true;
    velocity.updateRange.offset = playhead.current * 3;
    velocity.updateRange.count = 3;

    acceleration.setXYZ(playhead.current, 0, -5, 0);
    acceleration.needsUpdate = true;
    acceleration.updateRange.offset = playhead.current * 3;
    acceleration.updateRange.count = 3;

    /* Advance playhead */
    imesh.current.count++;
    playhead.current++;
  }, []);

  useEffect(() => {
    spawnParticle();

    const interval = setInterval(() => {
      spawnParticle();
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
    <instancedMesh ref={imesh} args={[undefined, undefined, maxParticles]}>
      <dodecahedronBufferGeometry />
      <CustomShaderMaterial
        ref={material}
        baseMaterial={MeshStandardMaterial}
        color="hotpink"
        uniforms={uniforms}
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
      />
    </instancedMesh>
  );
};
