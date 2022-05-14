import { useEffect, useMemo, useRef } from "react";
import {
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";

export const Instancicles = () => {
  const imesh = useRef<InstancedMesh>(null!);

  useEffect(() => {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);

    const mat = new Matrix4().compose(position, quaternion, scale);
    imesh.current.setMatrixAt(0, mat);
  }, []);

  return (
    <instancedMesh ref={imesh} args={[undefined, undefined, 10000]}>
      <dodecahedronBufferGeometry />
      <CustomShaderMaterial
        baseMaterial={MeshStandardMaterial}
        color="hotpink"
      />
    </instancedMesh>
  );
};
