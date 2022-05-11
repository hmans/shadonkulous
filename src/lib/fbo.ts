import { insideSphere } from "randomish";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget,
} from "three";

export class FBO {
  public texture!: DataTexture;
  private geometry!: BufferGeometry;
  private renderTargets!: [WebGLRenderTarget, WebGLRenderTarget];

  constructor(public width: number, public height: number) {
    this.createTexture();
    this.createGeometry();
    this.createRenderTargets();
  }

  private createTexture() {
    /* Generate initial data for texture */
    const length = this.width * this.height;
    const data = new Float32Array(length * 4);

    for (let i = 0; i < length; i++) {
      const offset = i * 4;
      const point = insideSphere();
      data[offset + 0] = point.x;
      data[offset + 1] = point.y;
      data[offset + 2] = point.z;
      data[offset + 3] = 1.0;
    }

    /* Create data texture */
    this.texture = new DataTexture(
      data,
      this.width,
      this.height,
      RGBAFormat,
      FloatType
    );

    this.texture.needsUpdate = true;
  }

  private createGeometry() {
    const length = this.width * this.height;
    let vertices = new Float32Array(length * 3);

    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      vertices[i3 + 0] = (i % this.width) / this.width;
      vertices[i3 + 1] = i / this.width / this.height;
    }

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  }

  private createRenderTargets() {
    const make = () =>
      new WebGLRenderTarget(this.width, this.height, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
      });

    this.renderTargets = [make(), make()];
  }
}
