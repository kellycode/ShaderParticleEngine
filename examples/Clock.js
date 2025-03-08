import * as THREE from "three";
import SPE from "../build/SPE.js";
import { BasicScene } from "./js/BasicScene.js";

export class Clock {
    static init = function () {
        let speScene = new BasicScene(75);
        let allIn = function (loaded) {
            Clock.initExample(loaded, speScene);
        };
        speScene.textureLoad(["./img/smokeparticle.png"], allIn);
    };

    static initExample(textures, speScene) {
        let group;
        let fixedTimeStep = false;
        let secondHand;
        let minuteHand;
        let hourHand;

        (group = new SPE.Group({
            texture: {
                value: textures["./img/smokeparticle.png"],
            },
            maxParticleCount: 2000,
        })),
            (secondHand = new SPE.Emitter({
                particleCount: 500,
                maxAge: {
                    value: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 5, 0),
                },
                size: {
                    value: [0, 1],
                },
                color: {
                    value: [new THREE.Color(0, 0, 1), new THREE.Color(1, 1, 0), new THREE.Color(1, 0, 0)],
                },
                opacity: {
                    value: 1,
                },
                rotation: {
                    axis: new THREE.Vector3(0, 0, 1),
                    angle: 0,
                    static: false,
                    center: new THREE.Vector3(),
                },
                direction: -1,
            })),
            (minuteHand = new SPE.Emitter({
                particleCount: 500,
                maxAge: {
                    value: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 7.5, 0),
                },
                size: {
                    value: [0, 2],
                },
                color: {
                    value: [new THREE.Color(0, 0, 1), new THREE.Color(0, 1, 0), new THREE.Color(0, 1, 1)],
                },
                opacity: {
                    value: 1,
                },
                rotation: {
                    axis: new THREE.Vector3(0, 0, 1),
                    angle: 0,
                    static: false,
                    center: new THREE.Vector3(),
                },
                direction: -1,
            })),
            (hourHand = new SPE.Emitter({
                particleCount: 500,
                maxAge: {
                    value: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 10, 0),
                },
                size: {
                    value: [0, 4],
                },
                color: {
                    value: new THREE.Color(0.5, 0.25, 0.9),
                },
                opacity: {
                    value: 1,
                },
                rotation: {
                    axis: new THREE.Vector3(0, 0, 1),
                    angle: 0,
                    static: false,
                    center: new THREE.Vector3(),
                },
                direction: -1,
            }));

        group.addEmitter(secondHand);
        group.addEmitter(minuteHand);
        group.addEmitter(hourHand);

        speScene.scene.add(group.mesh);
        speScene.camera.position.z = 40;
        speScene.camera.lookAt(speScene.scene.position);
        speScene.renderer.setSize(window.innerWidth, window.innerHeight);

        var date = new Date(Date.now());

        function preRender() {
            var catchUpSeconds = date.getSeconds(),
                catchUpMinutes = date.getMinutes(),
                catchUpHours = date.getHours() % 12;

            secondHand.rotation.angle = (catchUpSeconds / 60) * Math.PI * 2;
            minuteHand.rotation.angle = (catchUpMinutes / 60) * Math.PI * 2;
            hourHand.rotation.angle = (catchUpHours / 12) * Math.PI * 2;
        }

        function onAnimate() {
            group.tick(!fixedTimeStep ? speScene.clock.getDelta() : undefined);

            date.setTime(Date.now());

            var seconds = date.getSeconds(),
                minutes = date.getMinutes(),
                hours = date.getHours() % 12,
                fullRotation = Math.PI * 2,
                secondAngle = (seconds / 60) * fullRotation,
                minuteAngle = (minutes / 60) * fullRotation,
                hourAngle = (hours / 12) * fullRotation;

            if (secondAngle !== secondHand.rotation.angle) {
                secondHand.rotation.angle = secondAngle;
            }

            if (minuteAngle !== minuteHand.rotation.angle) {
                minuteHand.rotation.angle = minuteAngle;
            }

            if (hourAngle !== hourHand.rotation.angle) {
                hourHand.rotation.angle = hourAngle;
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            speScene.stats.update();

            if (typeof onAnimate === "function") {
                onAnimate();
            }
            speScene.render();
        }

        fixedTimeStep = true;

        preRender();
        animate();
        //setTimeout(animate, 0);
    }
}
