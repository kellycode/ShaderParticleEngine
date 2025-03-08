import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class ActiveMultiplier {

    static init = function () {
        let speScene = new BasicScene(75);
        let allIn = function (loaded) {
            ActiveMultiplier.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample = function (textures, speScene) {
        // Setup the scene
        let emitter;
        let particleGroup;

        function init() {
            speScene.camera.position.z = 50;
            speScene.camera.lookAt(speScene.scene.position);

            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(0x000000);

            speScene.clock = new THREE.Clock();
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
                    value: new THREE.Vector3(0, 0, 0),
                    spread: new THREE.Vector3(0, 0, 0),
                },

                acceleration: {
                    value: new THREE.Vector3(0, -10, 0),
                    spread: new THREE.Vector3(10, 0, 10),
                },

                velocity: {
                    value: new THREE.Vector3(0, 15, 0),
                    spread: new THREE.Vector3(10, 7.5, 10),
                },

                color: {
                    value: [new THREE.Color("green"), new THREE.Color("red")],
                },

                size: {
                    value: 1,
                },

                particleCount: 2000,
                activeMultiplier: 1,
            });

            particleGroup.addEmitter(emitter);
            speScene.scene.add(particleGroup.mesh);

            document.querySelector(".numParticles").textContent = "Total particles: " + emitter.particleCount;

            document.querySelector(".alive-value").addEventListener(
                "change",
                function (e) {
                    emitter.activeMultiplier = +this.value;
                },
                false
            );
        }

        function animate() {
            requestAnimationFrame(animate);

            // Use a fixed time-step here to avoid gaps
            render(speScene.clock.getDelta());

            speScene.stats.update();
        }

        function render(dt) {
            particleGroup.tick(dt);
            speScene.render();
        }

        window.addEventListener(
            "resize",
            function () {
                let w = window.innerWidth,
                    h = window.innerHeight;

                camera.aspect = w / h;
                camera.updateProjectionMatrix();

                renderer.setSize(w, h);
            },
            false
        );

        init();
        initParticles();

        animate();
        //setTimeout(animate, 0);
    };
}
