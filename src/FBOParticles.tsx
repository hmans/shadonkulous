import { FC, useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";

const useNormalizedGeometry = (width = 1024, height = 1024) => {
  return useMemo(() => {
    const length = width * height;
    let vertices = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      vertices[i3 + 0] = (i % width) / width;
      vertices[i3 + 1] = i / width / height;
    }

    // Create the particles geometry
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    return geometry;
  }, []);
};

export const FBOParticles: FC = () => {
  const geometry = useNormalizedGeometry();

  return (
    <points geometry={geometry}>
      <meshBasicMaterial />
    </points>
  );
};
