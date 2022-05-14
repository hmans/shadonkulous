import { extend, InstancedMeshProps } from "@react-three/fiber";
import { InstancedMesh } from "three";

export class Particles extends InstancedMesh {}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      particles: InstancedMeshProps;
    }
  }
}

extend({ Particles });
