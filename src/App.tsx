import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FC } from "react";
import { Particles } from "./Particles";

export const App: FC = () => (
  <Canvas>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 10]} intensity={1} />

    <OrbitControls />

    <PerspectiveCamera position={[0, 0, 15]} makeDefault />

    <Particles />

    {/* <mesh>
      <dodecahedronBufferGeometry />
      <meshStandardMaterial color="#ccc" />
    </mesh> */}
  </Canvas>
);
