import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSMImpl from "three-custom-shader-material/vanilla";
import * as shader from "./shader";

export const Instancicles = () => {
  const imesh = useRef<InstancedMesh>(null!);
  const material = useRef<CSMImpl>(null!);

  useEffect(() => {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);

    const mat = new Matrix4().compose(position, quaternion, scale);
    imesh.current.setMatrixAt(0, mat);
  }, []);

  const uniforms = useMemo(() => ({ u_time: { value: 0 } }), []);

  useFrame((_, dt) => {
    material.current.uniforms.u_time.value += dt;
  });

  return (
    <instancedMesh ref={imesh} args={[undefined, undefined, 10000]}>
      <dodecahedronBufferGeometry />
      <CustomShaderMaterial
        ref={material}
        baseMaterial={MeshStandardMaterial}
        color="hotpink"
        uniforms={uniforms}
        vertexShader={shader.vertexShader}
      />
    </instancedMesh>
  );
};
