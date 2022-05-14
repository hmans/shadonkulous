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

  useEffect(() => {
    /* Add some extra attributes to the instanced mesh */
    imesh.current.geometry.setAttribute(
      "timeStart",
      new InstancedBufferAttribute(new Float32Array(maxParticles), 1)
    );
    imesh.current.geometry.setAttribute(
      "timeEnd",
      new InstancedBufferAttribute(new Float32Array(maxParticles), 1)
    );
    imesh.current.geometry.setAttribute(
      "velocity",
      new InstancedBufferAttribute(new Float32Array(maxParticles), 3)
    );
    imesh.current.geometry.setAttribute(
      "acceleration",
      new InstancedBufferAttribute(new Float32Array(maxParticles), 3)
    );

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

    imesh.current.geometry.attributes.timeStart.setX(
      playhead.current,
      clock.elapsedTime
    );
    imesh.current.geometry.attributes.timeStart.needsUpdate = true;

    imesh.current.geometry.attributes.timeEnd.setX(
      playhead.current,
      clock.elapsedTime + 2
    );
    imesh.current.geometry.attributes.timeEnd.needsUpdate = true;

    imesh.current.geometry.attributes.velocity.setXYZ(
      playhead.current,
      ...new Vector3().randomDirection().toArray()
    );
    imesh.current.geometry.attributes.velocity.needsUpdate = true;

    imesh.current.geometry.attributes.acceleration.setXYZ(
      playhead.current,
      0,
      -5,
      0
    );
    imesh.current.geometry.attributes.acceleration.needsUpdate = true;

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
