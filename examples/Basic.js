import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Basic {
    static init = function () {
        let speScene = new BasicScene(75);
        let allIn = function (loaded) {
            Basic.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        let emitter;
        let particleGroup;
        // Setup the scene
        function init() {
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

            emitter = new SPE.Emitter({
                maxAge: {
                    value: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 0, -50),
                    spread: new THREE.Vector3(0, 0, 0),
                },

                acceleration: {
                    value: new THREE.Vector3(0, -10, 0),
                    spread: new THREE.Vector3(10, 0, 10),
                },

                velocity: {
                    value: new THREE.Vector3(0, 25, 0),
                    spread: new THREE.Vector3(10, 7.5, 10),
                },

                color: {
                    value: [new THREE.Color("white"), new THREE.Color("red")],
                },

                size: {
                    value: 1,
                },

                particleCount: 2000,
            });

            particleGroup.addEmitter(emitter);
            speScene.scene.add(particleGroup.mesh);

            document.querySelector(".numParticles").textContent = "Total particles: " + emitter.particleCount;
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
