import { ElementRef, Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { World } from './world.service';
import { PI } from 'three/examples/jsm/nodes/Nodes.js';


@Injectable()
export class Zone {

    public corridorModelPath : string = '';
    public endV : THREE.Vector3 = new THREE.Vector3();

    constructor(public world: World, public startV : THREE.Vector3) {
        this.endV = startV.clone();
        this.loadCorridorModel();
        this.loadDecorationModel();
    }

    loadCorridorModel(): void{
        
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

    private balloons: THREE.Group[] = [];
    private balloon_base_pos : THREE.Vector3[] = [];
    private balloon_time_bias : number[] = [3.14 * 0.5, 0, - 3.14 * 0.5];
    private clock: THREE.Clock = new THREE.Clock();

    constructor(world: World, startV : THREE.Vector3) {
        super(world, startV);
    }

    override loadCorridorModel(): void {
        this.endV.add(new THREE.Vector3(0, 0, -44));

        this.corridorModelPath = 'assets/models/corridor_2.glb';
        const loader = new GLTFLoader();
        loader.load(this.corridorModelPath, (gltf) => {
            this.world.scene.add(gltf.scene);
            gltf.scene.position.set(this.startV.x, this.startV.y, this.startV.z);
        });
    }

    override loadDecorationModel(): void {
        // const loader = new GLTFLoader();

        // loader.load('assets/models/balloon_1.glb', (gltf) => {
        //     this.world.scene.add(gltf.scene);
        //     const pos = this.startV.clone().add(new THREE.Vector3(-9, 9, 1));
        //     gltf.scene.position.set(pos.x, pos.y, pos.z);
        //     this.balloons.push(gltf.scene);
        //     this.balloon_base_pos.push(pos);
        // });

        // loader.load('assets/models/balloon_2.glb', (gltf) => {
        //     this.world.scene.add(gltf.scene);
        //     const pos = this.startV.clone().add(new THREE.Vector3(15, 5, -3));
        //     gltf.scene.position.set(pos.x, pos.y, pos.z);
        //     this.balloons.push(gltf.scene);
        //     this.balloon_base_pos.push(pos);
        // });

        // loader.load('assets/models/balloon_3.glb', (gltf) => {
        //     this.world.scene.add(gltf.scene);
        //     const pos = this.startV.clone().add(new THREE.Vector3(-5, 9, -9));
        //     gltf.scene.position.set(pos.x, pos.y, pos.z);
        //     this.balloons.push(gltf.scene);
        //     this.balloon_base_pos.push(pos);
        // });
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