import { useFrame } from "@react-three/fiber";
import { FC, useMemo, useRef } from "react";
import { AdditiveBlending, Points, ShaderMaterial } from "three";
import { FBO } from "./lib/fbo";
import renderFragmentShader from "./shaders/render.frag";
import renderVertexShader from "./shaders/render.vert";

const useParticleRenderMaterial = () =>
  useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: renderVertexShader,
        fragmentShader: renderFragmentShader,
        uniforms: {
          u_positions: { value: null },
        },
        transparent: true,
        blending: AdditiveBlending,
      }),
    []
  );

export const FBOParticles: FC<{ width?: number; height?: number }> = ({
  width = 256,
  height = 256,
}) => {
  const renderMaterial = useParticleRenderMaterial();
  const points = useRef<Points>(null!);
  const positionsFBO = useMemo(() => new FBO(width, height), []);

  useFrame(({ gl, scene, camera }, dt) => {
    /* Render Simulation */
    positionsFBO.update(gl, dt);

    /* Render actual scene */
    renderMaterial.uniforms.u_positions.value =
      positionsFBO.outputTarget.texture;

    gl.render(scene, camera);
  }, 1);

  /* Rotate the particles */
  useFrame((_, dt) => {
    points.current.rotation.y += 0.5 * dt;
  });

  return (
    <>
      <points
        ref={points}
        geometry={positionsFBO.geometry}
        material={renderMaterial}
      />
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </>
  );
};
