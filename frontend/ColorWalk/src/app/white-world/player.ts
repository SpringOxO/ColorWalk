import { ElementRef, Injectable, Inject } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WhiteWorld } from './white-world.service';


@Injectable()
export class Player {
  public model!: THREE.Group;
  public grid_len: number = 2.0;
  public id: number = 0;
  
  public velocity: THREE.Vector3 = new THREE.Vector3(); //当前运动速度向量
  public easing: number = 0.08; //用于运动的缓动插值，越小越慢

  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  // public last_position: THREE.Vector3 = new THREE.Vector3();

  constructor(private world: WhiteWorld, @Inject('localToken')private local: boolean) {
    this.loadModel();
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load('assets/models/player_1.glb', (gltf) => {
      this.model = gltf.scene;
      this.model.position.set(0, 0, 0);
      // this.last_position = this.model.position.clone();

      this.world.scene.add(this.model);
      const player = this;
      //待补充，如果是本地玩家需要initsocket，如果使远程玩家需要初始化
      if (this.local){
        console.log("Local player loaded");
        this.world.createCamera();
        // game.sun.target = game.player.object;
        // game.animations.Idle = object.animations[0];
        //if (player.initSocket!==undefined) player.initSocket();
      }else{
        //非本地玩家的碰撞箱，感觉没什么意义，暂时不做
        // const geometry = new THREE.BoxGeometry(100,300,100);
        // const material = new THREE.MeshBasicMaterial({visible:false});
        // const box = new THREE.Mesh(geometry, material);
        // box.name = "Collider";
        // box.position.set(0, 150, 0);
        // player.object.add(box);
        // player.collider = box;
        console.log("Remote player loaded");
        player.model.userData['id'] = player.id;
        player.model.userData['remotePlayer'] = true;
        const players = this.world.initialisingPlayers.splice(this.world.initialisingPlayers.indexOf(this), 1);
        //console.log(this.world.initialisingPlayers);
        this.world.remotePlayers.push(players[0]);
        //console.log(this.world.remotePlayers);
      }
    });

    // if (player.deleted===undefined) game.scene.add(player.object);
    
  }

  public update(): void {
    let newPosition = new THREE.Vector3();
    if (this.local) {
      newPosition = this.model.position.clone().add(this.velocity.clone());
      newPosition.x = Math.round(newPosition.x / 2) * 2;
      newPosition.z = Math.round(newPosition.z / 2) * 2;
    } else {
      if (this.world.remoteData.length>0){
        let found = false;
        for(let data of this.world.remoteData){
          if (data.id != this.id) continue;
          //Found the player
          newPosition = new THREE.Vector3(data.x, data.y, data.z);
          //maybe need to update rotation
          found = true;
        }
        if (!found) {
          this.world.removePlayer(this);
          return;
        }
      }
    }

    
    this.world.airWalls.forEach((airWall) => {
      if (airWall) {
        // console.log(this.world.airWalls);
        this.raycaster.set(this.model.position, newPosition.clone().sub(this.model.position).normalize());
        const intersects = this.raycaster.intersectObject(airWall, true);
        if (intersects.length > 0 && intersects[0].distance < 1) {
          // 如果距离小于 1,阻止玩家继续移动
          newPosition.copy(this.model.position);
        }
      }
    });
    

    const directPosition = newPosition.clone();
    if (Math.abs(directPosition.x - this.model.position.x) > 1.0){
      directPosition.x = this.model.position.x + Math.sign(directPosition.x - this.model.position.x) * 1;
    }
    if (Math.abs(directPosition.z - this.model.position.z) > 1.0){
      directPosition.z = this.model.position.z + Math.sign(directPosition.z - this.model.position.z) * 1;
    }
    this.model.position.lerp(directPosition, this.easing);

    const targetRotationZ = Math.sign(this.velocity.x) * (Math.abs(this.velocity.x) > 0.05 ? 0.5 : 0);
    this.model.rotation.z = THREE.MathUtils.lerp(this.model.rotation.z, targetRotationZ, this.easing);

    const targetRotationX = - Math.sign(this.velocity.z) * (Math.abs(this.velocity.z) > 0.05 ? 0.5 : 0);
    this.model.rotation.x = THREE.MathUtils.lerp(this.model.rotation.x, targetRotationX, this.easing);
  }

}

@Injectable()
export class PlayerLocal extends Player {
  private socket: WebSocket= new WebSocket('http://localhost:3000/ws');

  constructor(world: WhiteWorld) {
    super(world, true);
    if (this.setupKeyControls !== undefined) {
      this.setupKeyControls();
    }
    const player = this;
    const initMsg= {
      type: 'init',
      "model": "model1",
      "colour": "blue",
      "x": 0,
      "y": 0,
      "z": 0,
      "h": 0,
      "pb": 0
    };
    player.socket.onopen = function (event) {
      player.socket.send(JSON.stringify(initMsg));
    };
    player.socket.onmessage = function (event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'deletePlayer') {
        const rplayers = world.remotePlayers.filter((player) => player.id === msg.id);
        if (rplayers.length > 0) {
          let idx = world.remotePlayers.indexOf(rplayers[0]);
          if (idx !== -1){
            world.remotePlayers.splice(idx, 1);
            world.scene.remove(rplayers[0].model);
          }
        } // initialisingPlayers not implemented
      } else if (msg.type === 'chat message') {
        let chatMsg =msg.message;
        console.log(chatMsg); // 
      } else if (msg.type === 'setId') {
        player.id = msg.id;
      } else if (msg.type === 'remoteData') {
        world.remoteData = msg.data;
        //console.log(world.remoteData);
      } else if (msg.type === 'colorData') {
        console.log('colorData111')
        world.colorData = msg.data;
        world.socketColor(msg.data);
      }
    };
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

  public updateSocket(updateMsg: any): void{
    this.socket.send(JSON.stringify(updateMsg));
	}
  
  public override update(): void {
    super.update();
    const updateMsg = {
      type: 'update',
      "x": this.model.position.x,
      "y": this.model.position.y,
      "z": this.model.position.z,
      "h": this.model.rotation.y,
      "pb": 0
    };
    this.updateSocket(updateMsg);
  }

  public updateColor(updateMsg: any): void{
    this.socket.send(JSON.stringify(updateMsg));
  }

}