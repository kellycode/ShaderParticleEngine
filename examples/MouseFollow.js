import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class MouseFollow {
    static init = function () {
        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            MouseFollow.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        // Setup the scene
        let emitter;
        let particleGroup;
        let mouseVector = new THREE.Vector3();
        
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

            emitter = new SPE.Emitter({
                maxAge: 3,
                position: {
                    value: new THREE.Vector3(0, 0, 0),
                },

                acceleration: {
                    value: new THREE.Vector3(0, -5, 0),
                    spread: new THREE.Vector3(5, 0, 5),
                },

                velocity: {
                    value: new THREE.Vector3(0, 10, 0),
                },

                color: {
                    value: [new THREE.Color(0.5, 0.5, 0.5), new THREE.Color()],
                    spread: new THREE.Vector3(1, 1, 1),
                },
                size: {
                    value: [5, 0],
                },

                particleCount: 1500,
            });

            particleGroup.addEmitter(emitter);
            speScene.scene.add(particleGroup.mesh);

            document.querySelector(".numParticles").textContent = "Total particles: " + emitter.particleCount;
        }

        function animate() {
            requestAnimationFrame(animate);

            // Using a fixed time-step here to avoid pauses
            render(0.016);
            speScene.stats.update();
        }

        function render(dt) {
            particleGroup.tick(dt);
            speScene.render();
        }

        // Add mousemove listener to move the `emitter`.
        document.addEventListener(
            "mousemove",
            function (e) {
                mouseVector.set(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1,
                    0.5
                );

                mouseVector.unproject(speScene.camera);
                emitter.position.value = emitter.position.value.set(
                    mouseVector.x * speScene.camera.fov,
                    mouseVector.y * speScene.camera.fov,
                    0
                );
            },
            false
        );

        init();
        initParticles();

        animate();
        //setTimeout(animate, 0);
    }
}
