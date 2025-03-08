import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Clouds {
    static init = function () {
        let speScene = new BasicScene(75);
        let allIn = function (loaded) {
            Clouds.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/cloud.png"], allIn);
    };

    static initExample(textures, speScene) {
        let emitter;
        let particleGroup;
        // Setup the scene
        function init() {
            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(0x42c7ff);

            let color = new THREE.Color();
            speScene.scene.fog = new THREE.Fog(speScene.renderer.getClearColor(color), 20, 0);
        }

        // Create particle group and emitter
        function initParticles() {
            particleGroup = new SPE.Group({
                texture: {
                    value: textures["./img/cloud.png"],
                },
                maxParticleCount: 3000,
                blending: THREE.NormalBlending,
                fog: true,
            });

            emitter = new SPE.Emitter({
                particleCount: 750,
                maxAge: {
                    value: 3,
                },
                position: {
                    value: new THREE.Vector3(0, -15, -50),
                    spread: new THREE.Vector3(100, 30, 100),
                },
                velocity: {
                    value: new THREE.Vector3(0, 0, 30),
                },
                wiggle: {
                    spread: 10,
                },
                size: {
                    value: 75,
                    spread: 50,
                },
                opacity: {
                    value: [0, 1, 0],
                },
                color: {
                    value: new THREE.Color(1, 1, 1),
                    spread: new THREE.Color(0.1, 0.1, 0.1),
                },
                angle: {
                    value: [0, Math.PI * 0.125],
                },
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
