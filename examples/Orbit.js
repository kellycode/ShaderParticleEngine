import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Orbit {
    static init = function () {
        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            Orbit.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        let particleGroup;

        // Setup the scene
        function init() {
            speScene.camera.position.z = 50;
            speScene.camera.lookAt(speScene.scene.position);

            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(0x000000);
        }

        // Create particle group and emitter
        function initParticles() {
            particleGroup = new SPE.Group({
                texture: {
                    value: textures["./img/smokeparticle.png"],
                },
                maxParticleCount: 3000,
            });

            // General distributions.
            let emitter = new SPE.Emitter({
                maxAge: {
                    value: 5,
                },
                position: {
                    value: new THREE.Vector3(5, -20, 0),
                },

                velocity: {
                    value: new THREE.Vector3(0, 5, 0),
                },

                acceleration: {
                    spread: new THREE.Vector3(1, 0, 0),
                },

                color: {
                    value: [new THREE.Color("white"), new THREE.Color("red")],
                },

                size: {
                    value: 1,
                },

                rotation: {
                    axis: new THREE.Vector3(0, 1, 0),
                    angle: Math.PI * 10,
                    center: new THREE.Vector3(0, 0, 0),
                },
                particleCount: 1000,
                direction: -1,
            });

            particleGroup.addEmitter(emitter);

            speScene.scene.add(particleGroup.mesh);
        }

        function animate() {
            requestAnimationFrame(animate);

            render(speScene.clock.getDelta());
            speScene.stats.update();
        }

        function render(dt) {
            particleGroup.tick(dt);
            speScene.render();
        }

        init();
        initParticles();

        animate();
        //setTimeout(animate, 0);
    }
}
