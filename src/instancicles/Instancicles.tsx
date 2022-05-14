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
}> = ({ maxParticles = 20_0000, safetySize = 5000 }) => {
  const maxInstanceCount = maxParticles + safetySize;

  const imesh = useRef<InstancedMesh>(null!);
  const material = useRef<CSMImpl>(null!);
  const { clock } = useThree();

  const createAttribute = (itemSize: number) =>
    new InstancedBufferAttribute(
      new Float32Array(maxInstanceCount * itemSize),
      itemSize
    );

  const attributes = useMemo(
    () => ({
      time: createAttribute(2),
      velocity: createAttribute(3),
      acceleration: createAttribute(3),
      colorStart: createAttribute(4),
      colorEnd: createAttribute(4),
      scaleStart: createAttribute(3),
      scaleEnd: createAttribute(3),
    }),
    [maxInstanceCount]
  );

  useEffect(() => {
    /* Add some extra attributes to the instanced mesh */
    for (const key in attributes) {
      imesh.current.geometry.setAttribute(
        key,
        attributes[key as keyof typeof attributes]
      );
    }

    imesh.current.count = 0;
  }, [attributes]);

  const playhead = useRef(0);

  const spawnParticle = useCallback((count: number) => {
    // console.log("spawnParticle", playhead.current, clock.elapsedTime);

    const { instanceMatrix } = imesh.current;

    [instanceMatrix, ...Object.values(attributes)].forEach((attribute) => {
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
      attributes.time.setXY(
        playhead.current,
        clock.elapsedTime,
        clock.elapsedTime + 4 + Math.random() * 0.1
      );

      /* Set velocity */
      attributes.velocity.setXYZ(
        playhead.current,
        ...new Vector3()
          .randomDirection()
          .multiplyScalar(
            Math.random() *
              (5 +
                Math.cos(clock.elapsedTime * 3) *
                  Math.sin(clock.elapsedTime / 2) *
                  4)
          )
          .toArray()
      );

      attributes.acceleration.setXYZ(playhead.current, 0, -8, 0);
      attributes.colorStart.setXYZW(playhead.current, 1, 1, 1, 1);
      attributes.colorEnd.setXYZW(playhead.current, 1, 1, 1, 0);
      attributes.scaleStart.setXYZ(playhead.current, 1, 1, 1);
      attributes.scaleEnd.setXYZ(playhead.current, 0.1, 0.1, 0.1);

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
      spawnParticle(1000);
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
        color="cyan"
        uniforms={uniforms}
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
        transparent
      />
    </instancedMesh>
  );
};
