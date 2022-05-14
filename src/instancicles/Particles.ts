import { extend, InstancedMeshProps } from "@react-three/fiber";
import { InstancedMesh } from "three";

export type ParticlesProps = Omit<InstancedMeshProps, "args"> & {
  args?: ConstructorParameters<typeof Particles>;
};

export class Particles extends InstancedMesh {
  constructor(maxParticles: number, safetyCount: number) {
    super(undefined, undefined, maxParticles + safetyCount);
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      particles: ParticlesProps;
    }
  }
}

extend({ Particles });
