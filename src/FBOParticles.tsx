import { useFrame, useThree } from "@react-three/fiber";
import { insideSphere } from "randomish";
import { FC, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";
import renderFragmentShader from "./shaders/render.frag";
import renderVertexShader from "./shaders/render.vert";
import simulationFragmentShader from "./shaders/simulation.frag";
import simulationVertexShader from "./shaders/simulation.vert";

const useNormalizedGeometry = (width: number, height: number) =>
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
    const data = new Float32Array(l * 4);

    for (let i = 0; i < l; i++) {
      const offset = i * 4;
      const point = insideSphere();
      data[offset + 0] = point.x;
      data[offset + 1] = point.y;
      data[offset + 2] = point.z;
      data[offset + 3] = 1.0;
    }

    const positions = new DataTexture(
      data,
      width,
      height,
      RGBAFormat,
      FloatType
    );
    positions.needsUpdate = true;

    return positions;
  }, [width, height]);

const useParticleSimulationMaterial = (positions: DataTexture) =>
  useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: simulationVertexShader,
        fragmentShader: simulationFragmentShader,
        uniforms: {
          u_positions: { value: positions },
          u_time: { value: 0.0 },
        },
        transparent: true,
        blending: AdditiveBlending,
      }),
    []
  );

const useParticleRenderMaterial = (positions: DataTexture) =>
  useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: renderVertexShader,
        fragmentShader: renderFragmentShader,
        uniforms: {
          u_positions: { value: positions },
        },
        transparent: true,
        blending: AdditiveBlending,
      }),
    [positions]
  );

export const FBOParticles: FC<{ width?: number; height?: number }> = ({
  width = 256,
  height = 256,
}) => {
  const geometry = useNormalizedGeometry(width, height);
  const positions = usePositions(width, height);
  const renderMaterial = useParticleRenderMaterial(positions);
  const simulationMaterial = useParticleSimulationMaterial(positions);

  const [simulationScene, simulationCamera, simulationRenderTargets] =
    useMemo(() => {
      const scene = new Scene();
      const camera = new OrthographicCamera(
        -1,
        1,
        1,
        -1,
        1 / Math.pow(2, 53),
        1
      );

      const renderTargets = [
        new WebGLRenderTarget(width, height, {
          minFilter: NearestFilter,
          magFilter: NearestFilter,
          format: RGBAFormat,
          type: FloatType,
        }),
        new WebGLRenderTarget(width, height, {
          minFilter: NearestFilter,
          magFilter: NearestFilter,
          format: RGBAFormat,
          type: FloatType,
        }),
      ];

      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array([
            -1, -1, 0, 1, -1, 0, 1, 1, 0,

            -1, -1, 0, 1, 1, 0, -1, 1, 0,
          ]),
          3
        )
      );

      geometry.setAttribute(
        "uv",
        new BufferAttribute(
          new Float32Array([
            0, 1, 1, 1, 1, 0,

            0, 1, 1, 0, 0, 0,
          ]),
          2
        )
      );

      scene.add(new Mesh(geometry, simulationMaterial));

      return [scene, camera, renderTargets];
    }, [positions]);

  const points = useRef<Points>(null!);

  const { gl } = useThree();

  useEffect(() => {
    gl.setRenderTarget(simulationRenderTargets[0]);
    gl.clear();
    gl.render(simulationScene, simulationCamera);
    gl.setRenderTarget(simulationRenderTargets[1]);
    gl.clear();
    gl.render(simulationScene, simulationCamera);
    gl.setRenderTarget(null);
  }, []);

  let active = 0;

  useFrame(({ gl, scene, camera }, dt) => {
    /* Update Simulation */
    simulationMaterial.uniforms.u_time.value += dt;
    simulationMaterial.uniforms.u_positions.value =
      simulationRenderTargets[(active + 1) % 2].texture;

    /* Render Simulation */
    gl.setRenderTarget(simulationRenderTargets[active]);
    gl.clear();
    gl.render(simulationScene, simulationCamera);
    gl.setRenderTarget(null);

    /* Render actual scene */
    renderMaterial.uniforms.u_positions.value =
      simulationRenderTargets[active].texture;

    gl.render(scene, camera);

    active = (active + 1) % 2;
  }, 1);

  return (
    <>
      <points ref={points} geometry={geometry} material={renderMaterial} />
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </>
  );
};