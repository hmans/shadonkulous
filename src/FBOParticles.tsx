import { useFrame } from "@react-three/fiber";
import { insideSphere } from "randomish";
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

  const positionsFBO = useMemo(() => {
    const length = width * height;
    const data = new Float32Array(length * 4);

    for (let i = 0; i < length; i++) {
      const offset = i * 4;
      const point = insideSphere();
      data[offset + 0] = point.x;
      data[offset + 1] = point.y;
      data[offset + 2] = point.z;
      data[offset + 3] = 1.0;
    }

    const chunk = /*glsl*/ `
      void main() {
        vec3 position = texture2D(u_data, v_uv).rgb;
        position *= 1.0 + 0.25 * u_deltatime;
        gl_FragColor = vec4(position, 1.0);
      }
    `;

    return new FBO(width, height, data, chunk);
  }, []);

  const aliveFBO = useMemo(() => {
    const length = width * height;
    const data = new Float32Array(length * 4);

    for (let i = 0; i < length; i++) {
      const offset = i * 4;
      data[offset + 0] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }

    const shader = /*glsl*/ `
      void main() {
        vec4 data = texture2D(u_data, v_uv).rgba;
        gl_FragColor = data;
      }
    `;

    return new FBO(width, height, data, shader);
  }, []);

  useFrame(({ gl, scene, camera }, dt) => {
    /* Render Simulation */
    aliveFBO.update(gl, dt);
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
