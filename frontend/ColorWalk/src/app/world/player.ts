import { ElementRef, Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { World } from './world.service';


@Injectable()
export class Player {
  public local: boolean = true;
  public model!: THREE.Group;
  public grid_len: number = 2.0;

  
  public velocity: THREE.Vector3 = new THREE.Vector3(); //当前运动速度向量
  public easing: number = 0.08; //用于运动的缓动插值，越小越慢

  // public last_position: THREE.Vector3 = new THREE.Vector3();

  constructor(private world: World) {
    this.loadModel();
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load('assets/models/player.glb', (gltf) => {
      this.model = gltf.scene;
      this.model.position.set(0, 0, 0);
      // this.last_position = this.model.position.clone();

      this.world.scene.add(this.model);

      //待补充，如果是本地玩家需要initsocket，如果使远程玩家需要初始化
      if (this.local){
        this.world.createCamera();
        // game.sun.target = game.player.object;
        // game.animations.Idle = object.animations[0];
        // if (player.initSocket!==undefined) player.initSocket();
      }else{
        //非本地玩家的碰撞箱，感觉没什么意义，暂时不做
        // const geometry = new THREE.BoxGeometry(100,300,100);
        // const material = new THREE.MeshBasicMaterial({visible:false});
        // const box = new THREE.Mesh(geometry, material);
        // box.name = "Collider";
        // box.position.set(0, 150, 0);
        // player.object.add(box);
        // player.collider = box;

        // player.object.userData.id = player.id;
        // player.object.userData.remotePlayer = true;
        // const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
        // game.remotePlayers.push(players[0]);
      }
    });

    // if (player.deleted===undefined) game.scene.add(player.object);
    
  }

  public update(): void {
    const newPosition = this.model.position.clone().add(this.velocity.clone());
    newPosition.x = Math.round(newPosition.x / 2) * 2;
    newPosition.z = Math.round(newPosition.z / 2) * 2;

    const directPosition = newPosition.clone();
    if (Math.abs(directPosition.x - this.model.position.x) > 1.0){
      directPosition.x = this.model.position.x + Math.sign(directPosition.x - this.model.position.x) * 1;
    }
    if (Math.abs(directPosition.z - this.model.position.z) > 1.0){
      directPosition.z = this.model.position.z + Math.sign(directPosition.z - this.model.position.z) * 1;
    }
    this.model.position.lerp(directPosition, this.easing);

    // const v = newPosition.clone().sub(this.model.position.clone());
    // const dist = this.model.position.distanceTo(newPosition);
    // // if (dist < 0.9 && dist > 0){
    // //   console.log(dist);
    // //   console.log(Math.sign(this.velocity.x) * Math.min(dist, 0.9) * 2);
    // // }

    // this.model.rotation.z = (Math.abs(v.x) > 0.05 ? Math.sign(v.x) : 0) * Math.min(dist, 0.9) * 0.5;
    // this.model.rotation.x = - (Math.abs(v.z) > 0.05 ? Math.sign(v.z) : 0) * Math.min(dist, 0.9) * 0.5;

    // this.last_position = this.model.position.clone();

    const targetRotationZ = Math.sign(this.velocity.x) * (Math.abs(this.velocity.x) > 0.05 ? 0.5 : 0);
    this.model.rotation.z = THREE.MathUtils.lerp(this.model.rotation.z, targetRotationZ, this.easing);

    const targetRotationX = - Math.sign(this.velocity.z) * (Math.abs(this.velocity.z) > 0.05 ? 0.5 : 0);
    this.model.rotation.x = THREE.MathUtils.lerp(this.model.rotation.x, targetRotationX, this.easing);
  }
}

@Injectable()
export class PlayerLocal extends Player {

  constructor(world: World) {
    super(world);
    if (this.setupKeyControls !== undefined) {
      this.setupKeyControls();
    }
  }

  private setupKeyControls(): void {
    document.onkeydown = (event) => {
      switch (event.key) {
        case 'w':
          this.velocity.z = -this.grid_len;
          this.velocity.x = 0;
          break;
        case 's':
          this.velocity.z = this.grid_len;
          this.velocity.x = 0;
          break;
        case 'a':
          this.velocity.x = -this.grid_len;
          this.velocity.z = 0;
          break;
        case 'd':
          this.velocity.x = this.grid_len;
          this.velocity.z = 0;
          break;
      }
    };

    document.onkeyup = (event) => {
      switch (event.key) {
        case 'w':
        case 's':
          this.velocity.z = 0;
          break;
        case 'a':
        case 'd':
          this.velocity.x = 0;
          break;
      }
    };
  }

  
}