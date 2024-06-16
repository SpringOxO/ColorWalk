import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Player, PlayerLocal } from './player';

@Injectable({ providedIn: 'root' })
export class WhiteWorld implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  public scene!: THREE.Scene;
  private light!: THREE.AmbientLight;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private savedColor = [1, 0, 0];

  private player!: PlayerLocal;

  private scene_scale = 0.8;

  public airWalls : THREE.Group<THREE.Object3DEventMap> [] = [];

  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = null!;
      this.canvas = null!;
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    this.scene = new THREE.Scene();

    this.player = new PlayerLocal(this);

    this.light = new THREE.AmbientLight(0xffffff);
    this.light.position.z = 10;
    this.scene.add(this.light);

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);
    this.loadModel();
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load('assets/models/1.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {  // 使用 instanceof 检查 child 是否为 Mesh
          // 确保每个网格的材料支持顶点颜色
            const material = new THREE.MeshBasicMaterial({
                vertexColors: true
            });
            material.color.convertSRGBToLinear();
            child.material = material;
            // 初始化颜色属性
            const colors = [];
            for (let i = 0; i < child.geometry.attributes.position.count; i++) {
                colors.push(0.5, 0.5, 0);
            }
            child.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }
      });
      this.scene.add(gltf.scene);
      gltf.scene.position.set(0, 0, 0);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(gltf.scene.position);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      this.scene.add(directionalLight);
    });
  }

  createCamera() { //在用户初始化时被调用
    if (this.scene === undefined) return;

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -this.scene_scale,
      frustumSize * aspect / this.scene_scale,
      frustumSize / this.scene_scale,
      frustumSize / -this.scene_scale,
      0.1,
      1000
    );
    this.camera.position.set(30, 30, 30);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  cameraFollow() {
    const playerPosition = new THREE.Vector3();
    this.player.model.getWorldPosition(playerPosition);
  
    const targetPosition = new THREE.Vector3(
      playerPosition.x + 30,
      playerPosition.y + 30,
      playerPosition.z + 30
    );
  
    const lerpFactor = 0.02; // 调整这个值来控制相机的缓动速度
    this.camera.position.lerp(targetPosition, lerpFactor);

    const lookPosition = new THREE.Vector3(
      this.camera.position.x - 30,
      this.camera.position.y - 30,
      this.camera.position.z - 30
    );
    this.camera.lookAt(lookPosition);
  }
  

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    requestAnimationFrame(() => {
      this.render();
    });

    if (this.player === undefined || this.player.model === undefined)return ;
    if (this.player) { //更新用户位置，并让相机跟随
      this.player.update();
      this.cameraFollow();
    }

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    console.log("resized");
    const width = window.innerWidth;
    const height = window.innerHeight;
  
    const aspect = width / height;
    const frustumSize = 10;
  
    this.camera.left = frustumSize * aspect / -this.scene_scale;
    this.camera.right = frustumSize * aspect / this.scene_scale;
    this.camera.top = frustumSize / this.scene_scale;
    this.camera.bottom = frustumSize / -this.scene_scale;
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize(width, height);
  }

    /*
    * This method handles the mouse click event.
    * It uses the raycaster to determine the object clicked.
    * and changes the color of the whole face clicked.
    */
    public coloration(event: MouseEvent): void {
        event.preventDefault();
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const faceIndex = intersect.faceIndex;
            const mesh = intersect.object as THREE.Mesh;
            const face = intersect.face;
            const vSet = new Set<number>();
            if (face !== undefined && face !== null) {
                const a = face.a;
                const b = face.b;
                const c = face.c;
                vSet.add(a);
                vSet.add(b);
                vSet.add(c);
            } else {
                return;
            }

            if (faceIndex !== undefined && mesh.geometry) {
                const indices = mesh.geometry.index;
                if (indices) {
                    /*
                    * 按照gpt的说法 两个相邻的三角面片会共享两个顶点 但是faceIndex不一定是相邻的
                    * 但是就目前的初步实践来看 两个相邻的三角面片的faceIndex是相邻的
                    * 这里的思路是 从当前面片开始 向上下两个方向遍历
                    * 这里假定了faceIndex是相邻的 所以如果发现一个不满足条件的面片就停止遍历
                    * 但是如果后续的测试中发现gpt说的是对的 那么相应的break删除即可
                    */
                    let indexBelow = faceIndex - 1;
                    while(indexBelow >= 0) {
                    const a = indices.getX(indexBelow * 3);
                    const b = indices.getX(indexBelow * 3 + 1);
                    const c = indices.getX(indexBelow * 3 + 2);
                    let vote = 0;
                    let toPush = null;
                    if (vSet.has(a)) {
                        vote++;
                    } else {
                        toPush = a;
                    }
                    if (vSet.has(b)) {
                        vote++;
                    } else {
                        toPush = b;
                    }
                    if (vSet.has(c)) {
                        vote++;
                    } else {
                        toPush = c;
                    }
                    if (vote === 2 && toPush !== null) {
                        vSet.add(toPush);
                    } else {
                        break;
                    }
                    }
                    let indexAbove = faceIndex + 1;
                    while (indexAbove < indices.count / 3) {
                    const a = indices.getX(indexAbove * 3);
                    const b = indices.getX(indexAbove * 3 + 1);
                    const c = indices.getX(indexAbove * 3 + 2);
                    let vote = 0;
                    let toPush = null;
                    if (vSet.has(a)) {
                        vote++;
                    } else {
                        toPush = a;
                    }
                    if (vSet.has(b)) {
                        vote++;
                    } else {
                        toPush = b;
                    }
                    if (vSet.has(c)) {
                        vote++;
                    } else {
                        toPush = c;
                    }
                    if (vote === 2 && toPush !== null) {
                        vSet.add(toPush);
                    } else {
                        break;
                    }
                    }
                    let positionIndex = [...vSet];
                    const colors = mesh.geometry.attributes['color'];
                    // const x = this.convertToVertexColor(this.savedColor[0]);
                    // const y = this.convertToVertexColor(this.savedColor[1]);
                    // const z = this.convertToVertexColor(this.savedColor[2]);
                    const x = this.savedColor[0] / 255;
                    const y = this.savedColor[1] / 255;
                    const z = this.savedColor[2] / 255;
                    for (let i of positionIndex) {
                        colors.setXYZ(i, x, y, z);
                    }
                    colors.needsUpdate = true;
                }
            }
        }
        }
    
    public setSavedColor(color: number): void {
        const a = (color >> 16) & 0xff;
        const b = (color >> 8) & 0xff;
        const c = color & 0xff;
        this.savedColor =[a, b, c];
        console.log('savedcolor' + this.savedColor);
    }

    private convertToVertexColor(color: number): number {
        const sample = [0, 89, 124, 149, 170, 188, 203, 218, 231, 243, 255]
        let i= 0;
        for (; i < sample.length; i++) {
            if (color === sample[i]) {
                return i * 0.1;
            }
            if (color < sample[i]) {
                break;
            }
        }
        const bottom = sample[i - 1];
        const top = sample[i];
        const bottomIdx = i * 0.1;
        return bottomIdx + (color - bottom) / (top - bottom) * 0.1;
    }
}