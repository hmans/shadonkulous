import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { FC } from "react";
import { Instancicles } from "./instancicles/Instancicles";
import { Particles } from "./Particles";

export const App: FC = () => (
  <>
    <Canvas flat>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <OrbitControls />

      <PerspectiveCamera position={[0, 0, 35]} makeDefault />

      <Instancicles />
      <Perf />
      {/* <RenderPipeline /> */}

      {/* <mesh>
      <dodecahedronBufferGeometry />
      <meshStandardMaterial color="#ccc" />
    </mesh> */}
    </Canvas>
  </>
);
