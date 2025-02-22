class BasicScene {
    constructor(fov) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.onShaderError = this.shaderErrorLog;
        this.renderer.debug.checkShaderErrors = false;

        this.stats = new Stats();
        this.clock = new THREE.Clock();

        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.stats.domElement);

        this.stats.domElement.style.position = "absolute";
        this.stats.domElement.style.top = "0";

        window.addEventListener(
            "resize",
            function () {
                let w = window.innerWidth,
                    h = window.innerHeight;

                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(w, h);
            }.bind(this),
            false
        );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    safeLoad(textureUrlArray, callback) {
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;
        let loadedTextures = {};
        let hasError = false;

        function checkAllLoaded() {
            loadedCount++;
            if (loadedCount === textureUrlArray.length && !hasError) {
                callback(loadedTextures);
            }
        }

        try {
            textureUrlArray.forEach((url) => {
                loadedTextures[url] = textureLoader.load(
                    url,
                    checkAllLoaded,
                    (xhr) => console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
                    (error) => {
                        hasError = true;
                        console.error(`Error loading texture ${url}:`, error);
                    }
                );
            });
        } catch (error) {
            hasError = true;
            console.error("Texture loading failed:", error);
        }
    }

    shaderErrorLog(gl, program, glVertexShader, glFragmentShader) {
        console.log("gl");
        console.log(gl);
        console.log("program");
        console.log(program);
        console.log("glVertexShader");
        console.log(glVertexShader);
        console.log("glFragmentShader");
        console.log(glFragmentShader);
    }
}
