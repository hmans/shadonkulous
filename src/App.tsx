import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FC } from "react";
import { FBOParticles } from "./FBOParticles";

export const App: FC = () => (
  <>
    <Canvas flat>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <OrbitControls />

      <PerspectiveCamera position={[0, 0, 15]} makeDefault />

      <FBOParticles />
      {/* <Particles /> */}
      {/* <RenderPipeline /> */}

      {/* <mesh>
      <dodecahedronBufferGeometry />
      <meshStandardMaterial color="#ccc" />
    </mesh> */}
    </Canvas>
  </>
);
