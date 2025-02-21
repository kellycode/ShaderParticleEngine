let safeLoad = function (textureUrlArray, callback) {
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
};

/*
let safeLoad = function (textureUrlArray, callback) {
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0; //textureUrlArray.length;
    let loadedTextures = {};

    function checkAllLoaded() {
        loadedCount++;
        if (loadedCount === textureUrlArray.length) {
            callback(loadedTextures);
        }
    }

    try {
        textureUrlArray.forEach((url) => {
            loadedTextures[url] = textureLoader.load(
                url,
                checkAllLoaded,
                (xhr) => console.log(`Texture 1: ${(xhr.loaded / xhr.total) * 100}% loaded`),
                (error) => console.error("Error loading texture 1:", error)
            );
        });
    } catch (error) {
        console.error("Texture loading failed:", error);
    }
};
*/
