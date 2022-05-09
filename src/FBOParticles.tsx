import { render } from "@testing-library/react";
import { insideSphere } from "randomish";
import { FC, useMemo } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  RGBFormat,
  ShaderMaterial,
} from "three";

const useNormalizedGeometry = (width = 1024, height = 1024) =>
  useMemo(() => {
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

const usePositions = (width: number, height: number) =>
  useMemo(() => {
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
  }, [width, height]);

const useParticleRenderMaterial = (positions: DataTexture) =>
  useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          positions: { value: positions },
        },
        transparent: true,
        blending: AdditiveBlending,
      }),
    []
  );

export const FBOParticles: FC<{ width?: number; height?: number }> = ({
  width = 1024,
  height = 1024,
}) => {
  const geometry = useNormalizedGeometry(width, height);
  const positions = usePositions(width, height);
  const renderMaterial = useParticleRenderMaterial(positions);

  return <points geometry={geometry} material={renderMaterial} />;
};
