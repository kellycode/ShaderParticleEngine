import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Pool {
    static init = function () {
        document.querySelector(".numParticles").textContent = "Click mouse or press any key to trigger an explosion.";

        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            Pool.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        // Used in initParticles()
        let emitter;
        let particleGroup;
        let pool;
        let pos = new THREE.Vector3();

        let emitterSettings = {
            type: SPE.distributions.SPHERE,
            position: {
                spread: new THREE.Vector3(10),
                radius: 1,
            },
            velocity: {
                value: new THREE.Vector3(100),
            },
            size: {
                value: [30, 0],
            },
            opacity: {
                value: [1, 0],
            },
            color: {
                value: [new THREE.Color("yellow"), new THREE.Color("red")],
            },
            particleCount: 100,
            alive: true,
            duration: 0.05,
            maxAge: {
                value: 0.5,
            },
        };

        // Setup the scene
        function init() {
            speScene.camera.position.z = 200;
            speScene.camera.lookAt(speScene.scene.position);

            let referenceCube = new THREE.Mesh(
                new THREE.BoxGeometry(300, 300, 300),
                new THREE.MeshBasicMaterial({
                    wireframe: true,
                    opacity: 0.1,
                    transparent: true,
                    color: 0xffffff,
                })
            );
            speScene.scene.add(referenceCube);

            speScene.renderer.setSize(window.innerWidth, window.innerHeight);
            speScene.renderer.setClearColor(0x000000);
        }

        // Create particle group and emitter
        function initParticles() {
            particleGroup = new SPE.Group({
                texture: {
                    value: textures["./img/smokeparticle.png"],
                },
                blending: THREE.AdditiveBlending,
                maxParticleCount: 3000,
            });

            particleGroup.addPool(10, emitterSettings, false);

            // Add particle group to scene.
            speScene.scene.add(particleGroup.mesh);
        }

        // Generate a random number between -size/2 and +size/2
        function rand(size) {
            return size * Math.random() - size / 2;
        }

        // Trigger an explosion and random co-ords.
        function createExplosion() {
            let num = 150;
            particleGroup.triggerPoolEmitter(1, pos.set(rand(num), rand(num), rand(num)));
        }

        function animate() {
            requestAnimationFrame(animate);
            render(speScene.clock.getDelta());
            speScene.stats.update();
        }

        function updateCamera() {
            let now = Date.now() * 0.0007;

            speScene.camera.position.set(Math.sin(now) * 500, 0, Math.cos(now) * 500);
            speScene.camera.lookAt(speScene.scene.position);
        }

        function render(dt) {
            particleGroup.tick(dt);
            updateCamera();
            speScene.render();
        }

        // Add a mousedown listener. When mouse is clicked, a new explosion will be created.
        document.addEventListener("mousedown", createExplosion, false);

        // Do the same for a keydown event
        document.addEventListener("keydown", createExplosion, false);

        // Kick it all off.
        init();
        initParticles();

        animate();
        //setTimeout(animate, 0);
    }
}
