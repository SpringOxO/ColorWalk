import { ElementRef, Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { World } from './world.service';
import { PI } from 'three/examples/jsm/nodes/Nodes.js';


@Injectable()
export class Zone {

    public corridorModelPath : string = '';
    public airWallPath : string = '';
    public airWallName : string = '';
    public airWallUnitName : string = '';
    public endV : THREE.Vector3 = new THREE.Vector3();
    public passed : boolean = false;
    public blocked : boolean = true;

    
    public backgroundMaterials: THREE.MeshStandardMaterial[] = []; //进入区域和离开时的背景透明度变化

    constructor(public world: World, public startV : THREE.Vector3) {
        this.endV = startV.clone();
        this.loadCorridorModel();
        this.loadAirWall();
        this.loadPainting();
        this.loadSkyBox();
        this.loadDecorationModel();
    }

    loadCorridorModel(): void{}

    loadAirWall(): void{}

    loadPainting(): void{}

    loadSkyBox(): void {}

    zonePass(): void {this.passed = true;} //标记通过，在update时才会移除，这是有些复杂的异步带来的麻烦：有时还没有装载好空气墙就已经要调用zonepass了。

    loadDecorationModel(): void{}

    update(): void{
        if (this.passed && this.blocked){ //如果被标记为通过，但还是blocked，就移除空气墙
            console.log(this.world.airWalls.length);
            const airwallToRemove = this.world.airWalls.find(airwall => airwall.name === this.airWallUnitName);
            if (airwallToRemove) {
                console.log(airwallToRemove);
                this.world.scene.remove(airwallToRemove);
                const index = this.world.airWalls.indexOf(airwallToRemove);
                if (index !== -1) {
                    this.world.airWalls.splice(index, 1);
                }
                console.log(this.world.airWalls.length);
                this.blocked = false;
            }
        }

        const z = this.world.getPlayerZ();
        if (z < this.startV.z + 1 && z > this.endV.z + 1){ //+1为了限制在严格的区域内
            if (this.startV.z - z < 0){ //第一格中心渐变完全
                const opacity = (this.startV.z - z + 1) / 1;
                this.backgroundMaterials.forEach((material) => {
                    material.opacity = opacity;
                });
            
            } else {
                this.backgroundMaterials.forEach((material) => {
                    material.opacity = 1;
                });
            }
        }
        else {
            if (z < this.endV.z + 1 && z > this.endV.z){
                const opacity = (z - this.endV.z) / 1;
                this.backgroundMaterials.forEach((material) => {
                    material.opacity = opacity;
                });
            }
            else {
                this.backgroundMaterials.forEach((material) => {
                    material.opacity = 0;
                });
            }
        }
    }
}

@Injectable()
export class Zone1 extends Zone {

    private balloons: THREE.Group[] = [];
    private balloon_base_pos : THREE.Vector3[] = [];
    private balloon_time_bias : number[] = [3.14 * 0.5, 0, - 3.14 * 0.5];
    private clock: THREE.Clock = new THREE.Clock();

    constructor(world: World, startV : THREE.Vector3) {
        super(world, startV);
    }

    override loadCorridorModel(): void {
        this.endV.add(new THREE.Vector3(0, 0, -22));

        this.corridorModelPath = 'assets/models/corridor_1.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
        });
    }

    override loadAirWall(): void {
        // this.airWallName = 'airwall_1';
        this.corridorModelPath = 'assets/models/airwall_1.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
            gltf.scene.visible = false;
            // gltf.scene.name = this.airWallName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadPainting(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/painting_1.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone().add(new THREE.Vector3(0, 2, 0));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
        this.airWallUnitName = 'airwall_unit_1';
        loader.load('assets/models/airwall_unit.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            gltf.scene.visible = false;
            gltf.scene.name = this.airWallUnitName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadSkyBox(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/skybox_1.glb', (gltf) => {
            gltf.scene.traverse((child) => { //设置透明
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.backgroundMaterials.push(material);
                }
            });
            gltf.scene.scale.x = gltf.scene.scale.y = gltf.scene.scale.z = 0.99;
            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
    }


    override loadDecorationModel(): void {
        const loader = new GLTFLoader();

        loader.load('assets/models/balloon_1.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone().add(new THREE.Vector3(-9, 9, 1));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.balloons.push(gltf.scene);
            this.balloon_base_pos.push(pos);
        });

        loader.load('assets/models/balloon_2.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone().add(new THREE.Vector3(15, 5, -3));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.balloons.push(gltf.scene);
            this.balloon_base_pos.push(pos);
        });

        loader.load('assets/models/balloon_3.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone().add(new THREE.Vector3(-5, 9, -9));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.balloons.push(gltf.scene);
            this.balloon_base_pos.push(pos);
        });
    }

    override update(): void {
        super.update();
        const time = this.clock.getElapsedTime();
        const amplitude = 3;
        const frequency = 0.5;

        this.balloons.forEach((balloon) => {
            // console.log(Math.sin(time * frequency) * amplitude);
            balloon.position.y = this.balloon_base_pos[this.balloons.indexOf(balloon)].y 
                                + Math.sin(time * frequency - this.balloon_time_bias[this.balloons.indexOf(balloon)]) * amplitude;
        });
    }
}

@Injectable()
export class Zone2 extends Zone {
    private corridorMaterials: THREE.MeshStandardMaterial[] = [];//用来做模型透明度变化，虽然那些material不是MeshStandardMaterial，但不知道为什么这数组能用
    private fadeDuration: number = 2; // 渐变持续时间(秒)

    private lines_y: THREE.Group[] = [];
    private lines_y_base_pos : THREE.Vector3[] = [];
    private lines_y_time_bias : number[] = [3.14 * 0.5, 0, - 3.14 * 0.5];

    private lines_z: THREE.Group[] = [];
    private lines_z_base_pos : THREE.Vector3[] = [];
    private lines_z_time_bias : number[] = [3.14 * 0.5, 0, - 3.14 * 0.5];

    private clock: THREE.Clock = new THREE.Clock();

    constructor(world: World, startV : THREE.Vector3) {
        super(world, startV);
    }

    override loadCorridorModel(): void {
        this.endV.add(new THREE.Vector3(0, 0, -44));

        this.corridorModelPath = 'assets/models/corridor_2.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    // console.log("yes");
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
        });
    }

    override loadAirWall(): void {
        this.corridorModelPath = 'assets/models/airwall_2.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
            gltf.scene.visible = false;
            // gltf.scene.name = this.airWallName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadPainting(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/painting_2.glb', (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone().add(new THREE.Vector3(0, 2, 0));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
        
        this.airWallUnitName = 'airwall_unit_2';
        loader.load('assets/models/airwall_unit.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            gltf.scene.visible = false;
            gltf.scene.name = this.airWallUnitName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadSkyBox(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/skybox_2.glb', (gltf) => {
            gltf.scene.traverse((child) => { //设置透明
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.backgroundMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
    }

    loadLineYModel(modelPath: string, v: THREE.Vector3){
        v.x += 1.2;
        v.z -= 0.9;
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            gltf.scene.traverse((child) => { //设置透明
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone().add(v);
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.lines_y.push(gltf.scene);
            this.lines_y_base_pos.push(pos);
        });
    }

    loadLineZModel(modelPath: string, v: THREE.Vector3){
        v.x += 1.2;
        v.y += 1.2;
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            gltf.scene.rotateX(Math.PI / 2);
            const pos = this.startV.clone().add(v);
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.lines_z.push(gltf.scene);
            this.lines_z_base_pos.push(pos);
        });
    }

    override loadDecorationModel(): void {
        const loader = new GLTFLoader();

        this.loadLineYModel('assets/models/line_1.glb', new THREE.Vector3(0,-9,-12));
        this.loadLineYModel('assets/models/line_1.glb', new THREE.Vector3(2,-7,-30));
        this.loadLineYModel('assets/models/line_4.glb', new THREE.Vector3(-8,7,-18));
        this.loadLineYModel('assets/models/line_4.glb', new THREE.Vector3(-8,9,-20));
        this.loadLineYModel('assets/models/line_4.glb', new THREE.Vector3(2,-11,-28));
        this.loadLineYModel('assets/models/line_1.glb', new THREE.Vector3(-10,-5,-14));
        this.loadLineYModel('assets/models/line_2.glb', new THREE.Vector3(0,1,-21.9));

        this.loadLineZModel('assets/models/line_2.glb', new THREE.Vector3(0, -12, -14));
        this.loadLineZModel('assets/models/line_3.glb', new THREE.Vector3(-6, -2, -20));
        this.loadLineZModel('assets/models/line_3.glb', new THREE.Vector3(-4, -2, -22));
        this.loadLineZModel('assets/models/line_5.glb', new THREE.Vector3(-14, -2, -16));
        this.loadLineZModel('assets/models/line_3.glb', new THREE.Vector3(-4, -2, -40));
        this.loadLineZModel('assets/models/line_6.glb', new THREE.Vector3(-2, -2, -40));
    }

    override update(): void {
        super.update();
        const time = this.clock.getElapsedTime();

        //随时间让材质变不透明
        if (time <= this.fadeDuration) {
            const opacity = time / this.fadeDuration;
            this.corridorMaterials.forEach((material) => {
              material.opacity = opacity;
            });
        } else {
            this.corridorMaterials.forEach((material) => {
              material.opacity = 1;
            });
        }

        

        const amplitude = 1;
        const frequency = 1.5;

        this.lines_y.forEach((line) => {
            // console.log(Math.sin(time * frequency) * amplitude);
            line.position.y = this.lines_y_base_pos[this.lines_y.indexOf(line)].y 
                                + Math.sin(time * frequency + this.lines_y_time_bias[this.lines_y.indexOf(line) % 3]) * amplitude;
        });

        this.lines_z.forEach((line) => {
            // console.log(Math.sin(time * frequency) * amplitude);
            line.position.z = this.lines_z_base_pos[this.lines_z.indexOf(line)].z 
                                + Math.sin(time * frequency + this.lines_z_time_bias[this.lines_z.indexOf(line) % 3]) * amplitude;
        });
    }
}

@Injectable()
export class Zone3 extends Zone {
    private corridorMaterials: THREE.MeshStandardMaterial[] = [];//用来做模型透明度变化，虽然那些material不是MeshStandardMaterial，但不知道为什么这数组能用
    private fadeDuration: number = 2; // 渐变持续时间(秒)

    private waves_z: THREE.Group[] = [];
    private waves_z_base_pos : THREE.Vector3[] = [];
    private waves_z_time_bias : number[] = [3.14 * 0.5, 0, - 3.14 * 0.5];

    private clock: THREE.Clock = new THREE.Clock();

    constructor(world: World, startV : THREE.Vector3) {
        super(world, startV);
    }

    override loadCorridorModel(): void {
        this.endV.add(new THREE.Vector3(0, 0, -44));

        this.corridorModelPath = 'assets/models/corridor_3.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    // console.log("yes");
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
        });
    }

    override loadAirWall(): void {
        this.corridorModelPath = 'assets/models/airwall_3.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
            gltf.scene.visible = false;
            // gltf.scene.name = this.airWallName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadPainting(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/painting_3.glb', (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone().add(new THREE.Vector3(0, 2, 0));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
        
        this.airWallUnitName = 'airwall_unit_3';
        loader.load('assets/models/airwall_unit.glb', (gltf) => {
            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            gltf.scene.visible = false;
            gltf.scene.name = this.airWallUnitName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadSkyBox(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/skybox_3.glb', (gltf) => {
            gltf.scene.traverse((child) => { //设置透明
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.backgroundMaterials.push(material);
                }
            }); 
            gltf.scene.scale.x = gltf.scene.scale.y = gltf.scene.scale.z = 1.01;

            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
    }


    loadWaveZModel(modelPath: string, v: THREE.Vector3){
        v.x += 1.2;
        v.y += 1.2;
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone().add(v);
            gltf.scene.position.set(pos.x, pos.y, pos.z);
            this.waves_z.push(gltf.scene);
            this.waves_z_base_pos.push(pos);
        });
    }

    override loadDecorationModel(): void {
        this.loadWaveZModel('assets/models/wave_1.glb', new THREE.Vector3(2, -10, -14));
        this.loadWaveZModel('assets/models/wave_1.glb', new THREE.Vector3(2, -9, -10));
        this.loadWaveZModel('assets/models/wave_1.glb', new THREE.Vector3(2, -8, -30));
        this.loadWaveZModel('assets/models/wave_2.glb', new THREE.Vector3(2, -9.5, -16));
        this.loadWaveZModel('assets/models/wave_2.glb', new THREE.Vector3(2, -15, -28));
        this.loadWaveZModel('assets/models/wave_2.glb', new THREE.Vector3(2, -13, -30));
        this.loadWaveZModel('assets/models/wave_3.glb', new THREE.Vector3(2, -12, -12));
        this.loadWaveZModel('assets/models/wave_3.glb', new THREE.Vector3(2, -11, -26));

        this.loadWaveZModel('assets/models/wave_1.glb', new THREE.Vector3(11, -10, -14));
        this.loadWaveZModel('assets/models/wave_1.glb', new THREE.Vector3(14, -10, -18));
        this.loadWaveZModel('assets/models/wave_2.glb', new THREE.Vector3(14, -13, -30));
        
    }

    override update(): void {
        super.update();
        const time = this.clock.getElapsedTime();

        //随时间让材质变不透明
        if (time <= this.fadeDuration) {
            const opacity = time / this.fadeDuration;
            this.corridorMaterials.forEach((material) => {
              material.opacity = opacity;
            });
          } else {
            this.corridorMaterials.forEach((material) => {
              material.opacity = 1;
            });
        }

        const amplitude = 1;
        const frequency = 1.5;

        // this.lines_y.forEach((line) => {
        //     // console.log(Math.sin(time * frequency) * amplitude);
        //     line.position.y = this.lines_y_base_pos[this.lines_y.indexOf(line)].y 
        //                         + Math.sin(time * frequency + this.lines_y_time_bias[this.lines_y.indexOf(line) % 3]) * amplitude;
        // });

        this.waves_z.forEach((wave) => {
            // console.log(Math.sin(time * frequency) * amplitude);
            wave.position.z = this.waves_z_base_pos[this.waves_z.indexOf(wave)].z 
                                + Math.sin(time * frequency + this.waves_z_time_bias[this.waves_z.indexOf(wave) % 3]) * amplitude;
        });
    }
}

@Injectable()
export class Zone4 extends Zone {
    private corridorMaterials: THREE.MeshStandardMaterial[] = [];//用来做模型透明度变化，虽然那些material不是MeshStandardMaterial，但不知道为什么这数组能用
    private fadeDuration: number = 2; // 渐变持续时间(秒)

    private clock: THREE.Clock = new THREE.Clock();

    constructor(world: World, startV : THREE.Vector3) {
        super(world, startV);
        this.blocked = false; //反正空气墙封死了，不要让它update了
    }

    override loadCorridorModel(): void {
        this.endV.add(new THREE.Vector3(0, 0, -6));

        this.corridorModelPath = 'assets/models/corridor_4.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    // console.log("yes");
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
        });
    }

    override loadAirWall(): void {
        this.corridorModelPath = 'assets/models/airwall_4.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
            gltf.scene.visible = false;
            // gltf.scene.name = this.airWallName;
            this.world.airWalls.push(gltf.scene);
        });
    }

    override loadPainting(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/painting_end.glb', (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) { //设置全透明
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.corridorMaterials.push(material);
                }
            });

            this.world.scene.add(gltf.scene);
            const pos = this.endV.clone().add(new THREE.Vector3(0, 2, 0));
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
    }

    override loadSkyBox(): void {
        const loader = new GLTFLoader();
        loader.load('assets/models/skybox_pink.glb', (gltf) => {
            gltf.scene.traverse((child) => { //设置透明
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    material.transparent = true;
                    material.opacity = 0;
                    this.backgroundMaterials.push(material);
                }
            }); 
            gltf.scene.scale.x = gltf.scene.scale.y = gltf.scene.scale.z = 1.02;

            this.world.scene.add(gltf.scene);
            const pos = this.startV.clone();
            gltf.scene.position.set(pos.x, pos.y, pos.z);
        });
    }

    override update(): void {
        super.update();
        const time = this.clock.getElapsedTime();

        //随时间让材质变不透明
        if (time <= this.fadeDuration) {
            const opacity = time / this.fadeDuration;
            this.corridorMaterials.forEach((material) => {
              material.opacity = opacity;
            });
          } else {
            this.corridorMaterials.forEach((material) => {
              material.opacity = 1;
            });
        }

        const amplitude = 1;
        const frequency = 1.5;
    }
}