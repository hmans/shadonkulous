import { insideSphere } from "randomish";
import { FC, useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  RGBFormat,
} from "three";

const useNormalizedGeometry = (width = 1024, height = 1024) => {
  return useMemo(() => {
    const length = width * height;

    let vertices = new Float32Array(length * 3);

    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      vertices[i3 + 0] = (i % width) / width;
      vertices[i3 + 1] = i / width / height;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    return geometry;
  }, [width, height]);
};

export const FBOParticles: FC<{ width?: number; height?: number }> = ({
  width = 1024,
  height = 1024,
}) => {
  const geometry = useNormalizedGeometry(width, height);

  const randomizedTexture = useMemo(() => {
    const l = width * height;
    const data = new Float32Array(l * 3);

    for (let i = 0; i < l; i++) {
      const offset = i * 3;
      const point = insideSphere();
      data[offset + 0] = point.x;
      data[offset + 1] = point.y;
      data[offset + 2] = point.z;
    }

    const positions = new DataTexture(
      data,
      width,
      height,
      RGBFormat,
      FloatType
    );
    positions.needsUpdate = true;

    return positions;
  }, []);

  return (
    <points geometry={geometry}>
      <meshBasicMaterial />
    </points>
  );
};
