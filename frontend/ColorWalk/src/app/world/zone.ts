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
    public endV : THREE.Vector3 = new THREE.Vector3();

    constructor(public world: World, public startV : THREE.Vector3) {
        this.endV = startV.clone();
        this.loadCorridorModel();
        this.loadAirWall();
        this.loadDecorationModel();
    }

    loadCorridorModel(): void{
        
    }

    loadAirWall(): void{
    }

    loadDecorationModel(): void{
    }

    update(): void{
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
        this.corridorModelPath = 'assets/models/airwall_1.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
            gltf.scene.visible = false;
            this.world.airWalls.push(gltf.scene);
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
            this.world.airWalls.push(gltf.scene);
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
            this.world.airWalls.push(gltf.scene);
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