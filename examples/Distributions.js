import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Distributions {
    static init = function () {
        let speScene = new BasicScene(75);
        let allIn = function (loaded) {
            Distributions.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        let particleGroup;
        // Setup the scene
        function init() {
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
                maxParticleCount: 5000,
            });

            // General distributions.
            for (let i = 1; i < 4; ++i) {
                let emitter = new SPE.Emitter({
                    type: i,
                    maxAge: {
                        value: 1,
                    },
                    position: {
                        value: new THREE.Vector3(-50 + i * 25, 40, 0),
                        radius: 5,
                        spread: new THREE.Vector3(3, 3, 3),
                    },

                    color: {
                        value: [new THREE.Color("white"), new THREE.Color("red")],
                    },

                    size: {
                        value: 1,
                    },
                    isStatic: true,
                    particleCount: 250,
                });

                particleGroup.addEmitter(emitter);
            }

            // Spread clamping.
            for (let i = 1; i < 4; ++i) {
                let emitter = new SPE.Emitter({
                    type: i,
                    maxAge: {
                        value: 1,
                    },
                    position: {
                        value: new THREE.Vector3(-50 + i * 25, 20, 0),
                        radius: 4,
                        spread: new THREE.Vector3(5, 5, 5),
                        spreadClamp: new THREE.Vector3(2, 2, 2),
                    },

                    color: {
                        value: [new THREE.Color("white"), new THREE.Color("red")],
                    },

                    size: {
                        value: 1,
                    },
                    isStatic: true,

                    particleCount: 500,
                });

                particleGroup.addEmitter(emitter);
            }

            // Spherical velocity distributions.
            for (let i = 1; i < 4; ++i) {
                let emitter = new SPE.Emitter({
                    type: i,
                    maxAge: {
                        value: 1,
                    },
                    position: {
                        value: new THREE.Vector3(-50 + i * 25, 0, 0),
                        radius: 5,
                        spread: i === 1 ? new THREE.Vector3(3, 3, 3) : undefined,
                    },

                    velocity: {
                        value: new THREE.Vector3(3, 3, 3),
                        distribution: SPE.distributions.SPHERE,
                    },

                    color: {
                        value: [new THREE.Color("white"), new THREE.Color("red")],
                    },

                    size: {
                        value: 1,
                    },

                    particleCount: 250,
                });

                particleGroup.addEmitter(emitter);
            }

            // Disc velocity distributions.
            for (let i = 1; i < 4; ++i) {
                let emitter = new SPE.Emitter({
                    type: i,
                    maxAge: {
                        value: 1,
                    },
                    position: {
                        value: new THREE.Vector3(-50 + i * 25, -20, 0),
                        radius: 5,
                        spread: i === 1 ? new THREE.Vector3(3, 3, 3) : undefined,
                    },

                    velocity: {
                        value: new THREE.Vector3(3, 3, 3),
                        distribution: SPE.distributions.DISC,
                    },

                    color: {
                        value: [new THREE.Color("white"), new THREE.Color("red")],
                    },

                    size: {
                        value: 1,
                    },

                    particleCount: 250,
                });

                particleGroup.addEmitter(emitter);
            }

            // Box velocity distributions.
            for (let i = 1; i < 4; ++i) {
                let emitter = new SPE.Emitter({
                    type: i,
                    maxAge: {
                        value: 1,
                    },
                    position: {
                        value: new THREE.Vector3(-50 + i * 25, -40, 0),
                        radius: 5,
                        spread: i === 1 ? new THREE.Vector3(3, 3, 3) : undefined,
                    },

                    velocity: {
                        value: new THREE.Vector3(3, 3, 3),
                        distribution: SPE.distributions.BOX,
                    },

                    color: {
                        value: [new THREE.Color("white"), new THREE.Color("red")],
                    },

                    size: {
                        value: 1,
                    },

                    particleCount: 250,
                });

                particleGroup.addEmitter(emitter);
            }

            speScene.scene.add(particleGroup.mesh);
        }

        function animate() {
            requestAnimationFrame(animate);

            let now = Date.now() * 0.001;
            speScene.camera.position.x = Math.sin(now) * 75;
            speScene.camera.position.z = Math.cos(now) * 75;
            speScene.camera.lookAt(speScene.scene.position);

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
