import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Explosion {
    static init = function () {
        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            Explosion.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/sprite-explosion2.png", "./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        function animate() {
            requestAnimationFrame(animate);
            speScene.stats.update();
            if (typeof onAnimate === "function") {
                onAnimate();
            }
            render();
        }

        function render() {
            var dt = speScene.clock.getDelta();
            group.tick();
            shockwaveGroup.tick();
            speScene.render();
        }

        speScene.clock.getDelta();
        
        var group = new SPE.Group({
                texture: {
                    value: textures["./img/sprite-explosion2.png"],
                    frames: new THREE.Vector2(5, 5),
                    loop: 1,
                },
                depthTest: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                scale: 600,
                maxParticleCount: 5000,
            }),
            shockwaveGroup = new SPE.Group({
                texture: {
                    value: textures["./img/smokeparticle.png"],
                },
                depthTest: false,
                depthWrite: true,
                blending: THREE.NormalBlending,
                maxParticleCount: 5000,
            }),
            shockwave = new SPE.Emitter({
                particleCount: 200,
                type: SPE.distributions.DISC,
                position: {
                    radius: 5,
                    spread: new THREE.Vector3(5),
                },
                maxAge: {
                    value: 2,
                    spread: 0,
                },
                // duration: 1,
                activeMultiplier: 2000,

                velocity: {
                    value: new THREE.Vector3(40),
                },
                rotation: {
                    axis: new THREE.Vector3(1, 0, 0),
                    angle: Math.PI * 0.5,
                    static: true,
                },
                size: { value: 2 },
                color: {
                    value: [new THREE.Color(0.4, 0.2, 0.1), new THREE.Color(0.2, 0.2, 0.2)],
                },
                opacity: { value: [0.5, 0.2, 0] },
            }),
            debris = new SPE.Emitter({
                particleCount: 100,
                type: SPE.distributions.SPHERE,
                position: {
                    radius: 0.1,
                },
                maxAge: {
                    value: 2,
                },
                // duration: 2,
                activeMultiplier: 40,

                velocity: {
                    value: new THREE.Vector3(100),
                },
                acceleration: {
                    value: new THREE.Vector3(0, -20, 0),
                    distribution: SPE.distributions.BOX,
                },
                size: { value: 2 },
                drag: {
                    value: 1,
                },
                color: {
                    value: [
                        new THREE.Color(1, 1, 1),
                        new THREE.Color(1, 1, 0),
                        new THREE.Color(1, 0, 0),
                        new THREE.Color(0.4, 0.2, 0.1),
                    ],
                },
                opacity: { value: [0.4, 0] },
            }),
            fireball = new SPE.Emitter({
                particleCount: 20,
                type: SPE.distributions.SPHERE,
                position: {
                    radius: 1,
                },
                maxAge: { value: 2 },
                // duration: 1,
                activeMultiplier: 20,
                velocity: {
                    value: new THREE.Vector3(10),
                },
                size: { value: [20, 100] },
                color: {
                    value: [new THREE.Color(0.5, 0.1, 0.05), new THREE.Color(0.2, 0.2, 0.2)],
                },
                opacity: { value: [0.5, 0.35, 0.1, 0] },
            }),
            mist = new SPE.Emitter({
                particleCount: 50,
                position: {
                    spread: new THREE.Vector3(10, 10, 10),
                    distribution: SPE.distributions.SPHERE,
                },
                maxAge: { value: 2 },
                // duration: 1,
                activeMultiplier: 2000,
                velocity: {
                    value: new THREE.Vector3(8, 3, 10),
                    distribution: SPE.distributions.SPHERE,
                },
                size: { value: 40 },
                color: {
                    value: new THREE.Color(0.2, 0.2, 0.2),
                },
                opacity: { value: [0, 0, 0.2, 0] },
            }),
            flash = new SPE.Emitter({
                particleCount: 50,
                position: { spread: new THREE.Vector3(5, 5, 5) },
                velocity: {
                    spread: new THREE.Vector3(30),
                    distribution: SPE.distributions.SPHERE,
                },
                size: { value: [2, 20, 20, 20] },
                maxAge: { value: 2 },
                activeMultiplier: 2000,
                opacity: { value: [0.5, 0.25, 0, 0] },
            });

        group.addEmitter(fireball).addEmitter(flash);
        shockwaveGroup.addEmitter(debris).addEmitter(mist);

        speScene.scene.add(shockwaveGroup.mesh);
        speScene.scene.add(group.mesh);

        speScene.camera.position.y = 40;
        speScene.camera.position.z = 100;
        speScene.camera.lookAt(speScene.scene.position);

        var floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 1, 1),
            new THREE.MeshPhongMaterial({
                color: 0x555555,
            })
        );

        floor.position.y = -10;
        floor.rotation.x = Math.PI * -0.5;
        speScene.scene.add(floor);

        var light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 20, 0);
        speScene.scene.add(light);

        // renderer.setClearColor( 0x333333, 1 );

        function onAnimate() {
            var now = Date.now() * 0.001;
            speScene.camera.position.x = Math.sin(now) * 100;
            speScene.camera.position.z = Math.cos(now) * 100;
            speScene.camera.lookAt(speScene.scene.position);
        }

        speScene.renderer.setSize(window.innerWidth, window.innerHeight);

        animate();
        //setTimeout(animate, 0);
    }
}
