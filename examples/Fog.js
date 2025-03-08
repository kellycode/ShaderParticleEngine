import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Fog {
    static init = function () {
        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            Fog.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        let emitter;
        let particleGroup;

        // Setup the scene
        function init() {
            speScene.scene.fog = new THREE.Fog(0x000000, 40, 70);
            // scene.fog = new THREE.FogExp2( 0x000000, 0.025 );

            speScene.camera.position.z = 50;
            speScene.camera.lookAt(speScene.scene.position);

            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(speScene.scene.fog.color);

            let box = new THREE.Mesh(
                new THREE.BoxGeometry(20, 20, 20),
                new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff })
            );
            speScene.scene.add(box);
        }

        // Create particle group and emitter
        function initParticles() {
            particleGroup = new SPE.Group({
                texture: {
                    value: textures["./img/smokeparticle.png"],
                },
                fog: true,
                maxParticleCount: 25000,
            });

            emitter = new SPE.Emitter({
                type: SPE.distributions.BOX,
                maxAge: 2,
                position: {
                    value: new THREE.Vector3(0, 0, 0),
                    spread: new THREE.Vector3(20, 20, 20),
                },
                particleCount: 20000,
                isStatic: true,
            });

            particleGroup.addEmitter(emitter);
            speScene.scene.add(particleGroup.mesh);

            document.querySelector(".numParticles").textContent = "Total particles: " + emitter.particleCount;
        }

        function animate() {
            let now = Date.now() * 0.0005;
            requestAnimationFrame(animate);

            speScene.camera.position.x = Math.cos(now) * 50;
            speScene.camera.position.y = Math.sin(now) * 45;
            speScene.camera.position.z = Math.sin(now) * 50;
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
