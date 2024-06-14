import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Player, PlayerLocal } from './player';

@Injectable({ providedIn: 'root' })
export class World implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  public scene!: THREE.Scene;
  private light!: THREE.AmbientLight;
  private controls!: OrbitControls;

  private player!: PlayerLocal;

  private scene_scale = 0.8;

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

  createCamera() {
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

  loadModel() {
    const loader = new GLTFLoader();
    loader.load('assets/models/1.glb', (gltf) => {
      this.scene.add(gltf.scene);
      gltf.scene.position.set(-1, -1, -1);
    });
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
    if (this.player) {
      this.player.update();
      const playerPosition = new THREE.Vector3();
      this.player.model.getWorldPosition(playerPosition);

      this.camera.position.set(
        playerPosition.x + 30,
        playerPosition.y + 30,
        playerPosition.z + 30
      );
      this.camera.lookAt(playerPosition);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    console.log("resized");
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}