import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class RuntimeChanging {
    static init = function () {
        document.querySelector(".numParticles").textContent = "Click mouse or press any key to trigger an explosion.";

        let speScene = new BasicScene(64);
        let allIn = function (loaded) {
            RuntimeChanging.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/sprite-flame2.jpg"], allIn);
    };

    static initExample(textures, speScene) {
        let group = new SPE.Group({
            // Possible API for animated textures...
            texture: {
                value: textures["./img/sprite-flame2.jpg"],
                frames: new THREE.Vector2(8, 4),
                // frameCount: 8,
                loop: 2,
            },
            maxParticleCount: 8000,
            depthTest: true,
            scale: window.innerHeight / 2.0,
        });
        let emitter = new SPE.Emitter({
            particleCount: 200,
            maxAge: {
                value: 2,
                spread: 0,
            },
            position: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3(10, 0, 0),
                spreadClamp: new THREE.Vector3(0, 0, 0),
                distribution: SPE.distributions.BOX,
                randomise: false,
            },
            radius: {
                value: 5,
                spread: 0,
                scale: new THREE.Vector3(1, 1, 1),
                spreadClamp: new THREE.Vector3(2, 2, 2),
            },
            velocity: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3(0, 0, 0),
                // distribution: SPE.distributions.BOX,
                randomise: false,
            },
            acceleration: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3(0, 0, 0),
                // distribution: SPE.distributions.BOX,
                randomise: false,
            },
            drag: {
                value: 0.5,
                spread: 0,
            },
            wiggle: {
                value: 0,
                spread: 0,
            },
            rotation: {
                axis: new THREE.Vector3(0, 1, 0),
                axisSpread: new THREE.Vector3(0, 0, 0),
                angle: 0, // radians
                angleSpread: 0, // radians
                static: false,
                center: new THREE.Vector3(0, 0, 0),
            },
            size: {
                value: 20,
                spread: 0,
            },
            opacity: {
                value: 0.02,
            },
            angle: {
                value: 0,
                spread: 0,
            },
        });

        group.addEmitter(emitter);
        speScene.scene.add(group.mesh);

        speScene.camera.position.z = 50;
        speScene.camera.position.y = 0;
        speScene.camera.lookAt(speScene.scene.position);

        // scene.fog = new THREE.Fog( 0x000000, 30, 50 );
        // renderer.setClearColor(0x222222, 0.1);
        speScene.renderer.setSize(window.innerWidth, window.innerHeight);

        function initDAT() {
            let gui = new dat.GUI();
            gui.domElement.id = "DAT_GUI"
            let keys = Object.keys(emitter);
            let vec3Components = ["x", "y", "z"];
            let updateMaterial = function () {
                    group.material.needsUpdate = true;
                };
            let i;

            let groupFolder = gui.addFolder("Group Settings");

            groupFolder
                .add(group, "textureLoop")
                .min(1)
                .max(10)
                .step(1)
                .onChange(function (value) {
                    group.uniforms.textureAnimation.value.w = value;
                    updateMaterial();
                });

            groupFolder
                .add(group, "blending")
                .min(0)
                .max(5)
                .step(1)
                .onChange(function (value) {
                    group.material.blending = value;
                    updateMaterial();
                });
            groupFolder.add(group, "colorize").onChange(function (value) {
                group.defines.COLORIZE = value;
                updateMaterial();
            });
            groupFolder.add(group, "hasPerspective").onChange(function (value) {
                group.defines.HAS_PERSPECTIVE = value;
                updateMaterial();
            });
            groupFolder.add(group, "transparent").onChange(function (value) {
                group.material.transparent = value;
                updateMaterial();
            });
            groupFolder
                .add(group, "alphaTest")
                .min(0)
                .max(1)
                .step(0.1)
                .onChange(function (value) {
                    group.material.alphaTest = value;
                    updateMaterial();
                });
            groupFolder.add(group, "depthWrite").onChange(function (value) {
                group.material.depthWrite = value;
                updateMaterial();
            });
            groupFolder.add(group, "depthTest").onChange(function (value) {
                group.material.depthTest = value;
                updateMaterial();
            });

            let positionFolder = gui.addFolder("Position");
            let positionValue = positionFolder.addFolder("Value");
            let positionSpread = positionFolder.addFolder("Spread");
            let positionSpreadClamp = positionFolder.addFolder("Spread Clamp");

            for (i = 0; i < vec3Components.length; ++i) {
                positionValue
                    .add(emitter.position.value, vec3Components[i], -100, 100)
                    .listen()
                    .onChange(function () {
                        emitter.position.value = emitter.position.value;
                    });
                positionSpread
                    .add(emitter.position.spread, vec3Components[i], -100, 100)
                    .listen()
                    .onChange(function () {
                        emitter.position.spread = emitter.position.spread;
                    });
                positionSpreadClamp
                    .add(emitter.position.spreadClamp, vec3Components[i], -50, 50)
                    .listen()
                    .onChange(function () {
                        emitter.position.spreadClamp = emitter.position.spreadClamp;
                    });
            }

            positionFolder.add(emitter.position, "radius", 0, 50).listen();
            positionFolder.add(emitter.position, "randomise").listen();

            let velocityFolder = gui.addFolder("Velocity");
            let velocityValue = velocityFolder.addFolder("Value");
            let velocitySpread = velocityFolder.addFolder("Spread");

            for (i = 0; i < vec3Components.length; ++i) {
                velocityValue
                    .add(emitter.velocity.value, vec3Components[i], -50, 50)
                    .listen()
                    .onChange(function () {
                        emitter.velocity.value = emitter.velocity.value;
                    });
                velocitySpread
                    .add(emitter.velocity.spread, vec3Components[i], -50, 50)
                    .listen()
                    .onChange(function () {
                        emitter.velocity.spread = emitter.velocity.spread;
                    });
            }
            velocityFolder.add(emitter.velocity, "randomise").listen();

            let accelerationFolder = gui.addFolder("Acceleration");
            let accelerationValue = accelerationFolder.addFolder("Value");
            let accelerationSpread = accelerationFolder.addFolder("Spread");

            for (i = 0; i < vec3Components.length; ++i) {
                accelerationValue
                    .add(emitter.acceleration.value, vec3Components[i], -50, 50)
                    .listen()
                    .onChange(function () {
                        emitter.acceleration.value = emitter.acceleration.value;
                    });
                accelerationSpread
                    .add(emitter.acceleration.spread, vec3Components[i], -50, 50)
                    .listen()
                    .onChange(function () {
                        emitter.acceleration.spread = emitter.acceleration.spread;
                    });
            }

            accelerationFolder.add(emitter.acceleration, "randomise").listen();

            let colors = {
                "Step 1": "#ffffff",
                "Step 2": "#ffffff",
                "Step 3": "#ffffff",
                "Step 4": "#ffffff",
            };

            let colorFolder = gui.addFolder("Color steps");
            colorFolder.addColor(colors, "Step 1").onChange(function (value) {
                emitter.color.value[0].setStyle(value);
                emitter.color.value = emitter.color.value;
            });
            colorFolder.addColor(colors, "Step 2").onChange(function (value) {
                emitter.color.value[1].setStyle(value);
                emitter.color.value = emitter.color.value;
            });
            colorFolder.addColor(colors, "Step 3").onChange(function (value) {
                emitter.color.value[2].setStyle(value);
                emitter.color.value = emitter.color.value;
            });
            colorFolder.addColor(colors, "Step 4").onChange(function (value) {
                emitter.color.value[3].setStyle(value);
                emitter.color.value = emitter.color.value;
            });

            let opacities = {
                "Step 1": emitter.opacity.value[0],
                "Step 2": emitter.opacity.value[1],
                "Step 3": emitter.opacity.value[2],
                "Step 4": emitter.opacity.value[3],
            };
            let opacityFolder = gui.addFolder("Opacity steps");
            opacityFolder
                .add(opacities, "Step 1")
                .min(0)
                .max(1)
                .step(0.01)
                .listen()
                .onChange(function (value) {
                    emitter.opacity.value[0] = value;
                    emitter.opacity.value = emitter.opacity.value;
                });
            opacityFolder
                .add(opacities, "Step 2")
                .min(0)
                .max(1)
                .step(0.01)
                .listen()
                .onChange(function (value) {
                    emitter.opacity.value[1] = value;
                    emitter.opacity.value = emitter.opacity.value;
                });
            opacityFolder
                .add(opacities, "Step 3")
                .min(0)
                .max(1)
                .step(0.01)
                .listen()
                .onChange(function (value) {
                    emitter.opacity.value[2] = value;
                    emitter.opacity.value = emitter.opacity.value;
                });
            opacityFolder
                .add(opacities, "Step 4")
                .min(0)
                .max(1)
                .step(0.01)
                .listen()
                .onChange(function (value) {
                    emitter.opacity.value[3] = value;
                    emitter.opacity.value = emitter.opacity.value;
                });
        }

        function animate() {
            requestAnimationFrame(animate);
            speScene.stats.update();
            render();
        }

        function render() {
            let dt = speScene.clock.getDelta();
            group.tick(dt);
            speScene.render();
        }

        console.log(group);
        console.log(emitter);

        initDAT();
        animate();
    }
}
