import { ElementRef, Injectable, NgZone, OnDestroy, Output } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Player, PlayerLocal } from './player';
import { Zone, Zone1, Zone2, Zone3, Zone4 } from './zone';
import { ZonePassService } from '../zone-pass.service';
import { Observable, Subscription, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaintingNearService } from '../painting-near.service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class World implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  public scene!: THREE.Scene;
  private light!: THREE.AmbientLight;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private savedColor = [1, 1, 0];

  private player!: PlayerLocal;

  private scene_scale = 0.8;


  private zones : Zone[] = [];

  public airWalls : THREE.Group<THREE.Object3DEventMap> [] = [];

  currentZonePassNumber : number = 0;
  preZonePassNumber : number = 0;

  private subscription!: Subscription;

  requestID : number = 0; //动画id

  isLatestRecord : boolean = false; //用来判断是否已经读到数据库里真正的学习记录，否则刷新时前一个用户的学习记录还没被读到的真正数据覆盖（因为异步）场景就加载了


  private listener: THREE.AudioListener = new THREE.AudioListener();
  private audioPath:string = '';
  private currentSounds: THREE.Audio [] = [];
  private currentSoundNumber: number = -1;

  public constructor(private ngZone: NgZone, private zonePassService : ZonePassService, private paintingNearService: PaintingNearService, private authService: AuthService) {
    
  }

  getMyZonePassedNumber(): Observable<number> {
    const username = this.authService.getUsername();
    return this.authService.getMyInfo(username).pipe(
      map(response => {
        // console.log(response);
        // console.log(response.zonepassed);
        return Math.min(response.zonepassed, 3);
      }),
      catchError(error => {
        console.error('Error retrieving user:', error);
        return of(0);
      })
    );
  }


  public ngOnDestroy(): void {
    if (this.renderer) {
      // 停止动画循环
      cancelAnimationFrame(this.requestID);
  
      // 销毁控制器
      // this.controls.dispose();
  
      // // 销毁区域
      // this.zones.forEach((zone) => {
      //   zone.dispose();
      // });
      this.zones = [];
  
      // 销毁空气墙
      this.airWalls.forEach((airWall) => {
        this.scene.remove(airWall);
      });
      this.airWalls = [];
  
      // // 销毁玩家
      // if (this.player) {
      //   this.player.dispose();
      //   this.player = null!;
      // }
  
      // 销毁光源
      this.scene.remove(this.light);
  
      // 销毁场景中的其他对象
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      this.preZonePassNumber = 0;
  
      // 销毁渲染器
      this.renderer.dispose();
      this.renderer = null!;
  
      // 清空场景
      this.scene = null!;
      this.camera = null!;

      this.currentSoundNumber = -1;
      this.audioPath = '';
      this.reloadAudio();
  
      // 取消订阅
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    console.log("createscene!");
    this.isLatestRecord = false; //设为假，在读取到学习记录之前先别加载场景
    this.subscription = this.zonePassService.zoneNumber.subscribe(zoneNumber => {
      // console.log(zoneNumber);
      this.currentZonePassNumber = zoneNumber;
    });
    this.getMyZonePassedNumber().subscribe(zonePassedNumber => {
      this.currentZonePassNumber = zonePassedNumber;
      console.log(this.currentZonePassNumber);
      this.zonePassService.passZone(this.currentZonePassNumber); //保险起见
      this.isLatestRecord = true;
      console.log('!' + this.currentZonePassNumber);
    });
    this.zones = [];
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

    this.initZone1();
  }

  initZone1 (){
    //加载第一个区域
    this.preZonePassNumber = 0;
    const zone1 : Zone1 = new Zone1(this, new THREE.Vector3(0, 0, 0));
    this.zones.push(zone1);
    // this.initZone2();
  }

  initZone2 (){
    const zone2 : Zone2 = new Zone2(this, this.zones[this.zones.length - 1].endV.clone());
    this.zones.push(zone2);
    
    // this.initZone3();
  }

  initZone3 (){
    const zone3 : Zone3 = new Zone3(this, this.zones[this.zones.length - 1].endV.clone());
    this.zones.push(zone3);
  }

  initZone4 (){
    const zone4 : Zone4 = new Zone4(this, this.zones[this.zones.length - 1].endV.clone());
    this.zones.push(zone4);
  }

  checkNearPosition (position1 : THREE.Vector3, position2 : THREE.Vector3): boolean{
    return Math.abs(position1.x - position2.x) < 1 && Math.abs(position1.y - position2.y) < 1 && Math.abs(position1.z - position2.z) < 1;
  }

  checkPlayerNearLastPainting() : boolean{
    // console.log(this.zones[this.zones.length - 1].endV.clone().sub(new THREE.Vector3(0, 0, 1)));
    return this.checkNearPosition(this.player.model.position, this.zones[this.zones.length - 1].endV.clone().add(new THREE.Vector3(0, 0, 2)));
  }

  onNearPainting(){
    this.paintingNearService.emitEvent();
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

    
    this.camera.add(this.listener);
    this.reloadAudio();
  }

  reloadAudio (){
    // 停止并释放之前的音频
    while(this.currentSounds.length > 0){
      const currentSound = this.currentSounds.pop();
      if (currentSound){
        currentSound.stop();
        currentSound.disconnect();
      }
    }

    // 加载音频文件
    if (this.audioPath != ''){
      const audioLoader = new THREE.AudioLoader();
      const sound = new THREE.Audio(this.listener);
      audioLoader.load(this.audioPath, (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
        console.log("new audio!");

        // 保存对当前音频的引用
        this.currentSounds.push(sound);
      });
    }
    
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

  getPlayerZ(): number{ //用于得到玩家位置，更新背景透明度
    return this.player.model.position.z;
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
    // console.log('@'+this.currentZonePassNumber);
    
    if (this.camera && this.currentSoundNumber != Math.min(this.currentZonePassNumber, 3)){ // 如果不是当前应该播放的音乐，就reload
      console.log("caonima");
      switch (Math.min(this.currentZonePassNumber, 3)){
        case 0:
          this.currentSoundNumber = 0;
          this.audioPath = './assets/audio/Canon_In_D.mp3';
          this.reloadAudio();
          break;
        case 1:
          this.currentSoundNumber = 1;
          this.audioPath = './assets/audio/Rhapsody_In_Blue.mp3';
          this.reloadAudio();
          break;
        case 2:
          this.currentSoundNumber = 2;
          this.audioPath = './assets/audio/Symphony_6_In_F.mp3';
          this.reloadAudio();
          break;
        case 3:
          this.currentSoundNumber = 3;
          this.audioPath = './assets/audio/Night_5.mp3';
          this.reloadAudio();
          break;
        default:
          break;
      }
    }

    if (this.camera && this.currentSounds.length > 1){ //如果当前播放的不止一首，就reload
      console.log(this.currentSounds.length);
      this.reloadAudio();
    }
    
    while (this.camera && this.isLatestRecord && this.currentZonePassNumber > this.preZonePassNumber){ //有区域应该解锁
      console.log(this.currentSoundNumber);
      this.zones[this.zones.length - 1].zonePass();
      switch (this.preZonePassNumber){
        case 0:
          this.initZone2();
          break;
        case 1:
          this.initZone3();
          break;
        case 2:
          this.initZone4();
          break;
        default:
          break;
      }
      this.preZonePassNumber ++;
    }


    this.requestID = requestAnimationFrame(() => {
      this.render();
    });

    if (this.player === undefined || this.player.model === undefined)return ;
    if (this.player) { //更新用户位置，并让相机跟随
      this.player.update();
      this.cameraFollow();
    }

    if (this.checkPlayerNearLastPainting()){ // 当靠近画时，发送靠近画信号
      this.onNearPainting();
      // console.log(this.currentZonePassNumber);
    }

    this.zones.forEach((zone) => {
      zone.update();
    });

    this.renderer.render(this.scene, this.camera);
  }

  // public resize(): void {
  //   console.log("resized");
  //   const width = window.innerWidth;
  //   const height = window.innerHeight;

  //   this.camera.left = -width / 2;
  //   this.camera.right = width / 2;
  //   this.camera.top = height / 2;
  //   this.camera.bottom = -height / 2;
  //   this.camera.updateProjectionMatrix();

  //   this.renderer.setSize(width, height);
  // }
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

}