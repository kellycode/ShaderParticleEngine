import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class MultipleEmitters {
    static init = function () {
        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            MultipleEmitters.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };


    static initExample(textures, speScene) {
        let emitter;
        let particleGroup;
        let numEmitters = 120;

        // Setup the scene
        function init() {
            speScene.camera.position.z = 200;
            speScene.camera.lookAt(speScene.scene.position);

            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(0x000000);
        }

        function getRandomNumber(base) {
            return Math.random() * base - base / 2;
        }

        function getRandomColor() {
            let c = new THREE.Color();
            c.setRGB(Math.random(), Math.random(), Math.random());
            return c;
        }

        // Create particle group and emitter
        function initParticles() {
            particleGroup = new SPE.Group({
                texture: {
                    value: textures["./img/smokeparticle.png"],
                },
                maxParticleCount: 20000,
            });

            for (let i = 0; i < numEmitters; ++i) {
                emitter = new SPE.Emitter({
                    maxAge: 5,
                    type: (Math.random() * 4) | 0,
                    position: {
                        value: new THREE.Vector3(getRandomNumber(200), getRandomNumber(200), getRandomNumber(200)),
                    },

                    acceleration: {
                        value: new THREE.Vector3(getRandomNumber(-2), getRandomNumber(-2), getRandomNumber(-2)),
                    },

                    velocity: {
                        value: new THREE.Vector3(getRandomNumber(5), getRandomNumber(5), getRandomNumber(5)),
                    },

                    rotation: {
                        axis: new THREE.Vector3(getRandomNumber(1), getRandomNumber(1), getRandomNumber(1)),
                        angle: Math.random() * Math.PI,
                        center: new THREE.Vector3(getRandomNumber(100), getRandomNumber(100), getRandomNumber(100)),
                    },

                    wiggle: {
                        value: Math.random() * 20,
                    },

                    drag: {
                        value: Math.random(),
                    },

                    color: {
                        value: [getRandomColor(), getRandomColor()],
                    },
                    size: {
                        value: [0, 2 + Math.random() * 10, 0],
                    },

                    particleCount: 100,

                    opacity: [0, 1, 0],
                });

                particleGroup.addEmitter(emitter);
            }

            speScene.scene.add(particleGroup.mesh);

            document.querySelector(".numParticles").textContent = "Total particles: " + particleGroup.particleCount;
        }

        function animate() {
            requestAnimationFrame(animate);

            // Using a fixed time-step here to avoid pauses
            render(speScene.clock.getDelta());
            speScene.stats.update();
        }

        function updateCamera() {
            let now = Date.now() * 0.0005;
            speScene.camera.position.x = Math.sin(now) * 500;
            speScene.camera.position.z = Math.cos(now) * 500;
            speScene.camera.lookAt(speScene.scene.position);
        }

        function render(dt) {
            particleGroup.tick(dt);
            updateCamera();
            speScene.render();
        }

        init();
        initParticles();

        animate();
        //setTimeout(animate, 0);
    }
}
