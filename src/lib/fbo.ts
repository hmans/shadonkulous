import { insideSphere } from "randomish";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import simulationFragmentShader from "../shaders/simulation.frag";
import simulationVertexShader from "../shaders/simulation.vert";

export class FBO {
  public texture!: DataTexture;
  public geometry!: BufferGeometry;
  private renderTargets!: [WebGLRenderTarget, WebGLRenderTarget];
  private scene!: Scene;
  private camera!: OrthographicCamera;
  private material!: ShaderMaterial;
  private active = 0;

  public get outputTarget() {
    return this.renderTargets[this.active];
  }

  public get inputTarget() {
    return this.renderTargets[(this.active + 1) % 2];
  }

  constructor(public width: number, public height: number) {
    this.createTexture();
    this.createGeometry();
    this.createRenderTargets();
    this.createMaterial();
    this.createScene();
  }

  public update(renderer: WebGLRenderer, dt: number) {
    /* Next! */
    this.active = (this.active + 1) % 2;

    /* Update Simulation */
    this.material.uniforms.u_time.value += dt;
    this.material.uniforms.u_positions.value = this.inputTarget.texture;

    /* Render Simulation */
    renderer.setRenderTarget(this.outputTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
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

  private createMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        u_positions: { value: this.texture },
        u_time: { value: 0.0 },
      },
      transparent: true,
      blending: AdditiveBlending,
    });
  }

  private createScene() {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

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

    this.scene.add(new Mesh(geometry, this.material));
  }
}
