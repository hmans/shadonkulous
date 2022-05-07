import { Canvas } from "@react-three/fiber";
import { FC } from "react";
import { Particles } from "./Particles";

export const App: FC = () => (
  <Canvas>
    <Particles />
  </Canvas>
);
