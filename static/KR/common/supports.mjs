let webPSupportFound = null;

async function supportsWebP() {
    if (webPSupportFound === null) {
        const data = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAgVZQOCAiAAAAcAEAnQEqAQABAA/A/iWgAnQBQAAA/m8dWbtazgN3iAAAAA==";
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
                webPSupportFound = true;
                resolve();
            };
            img.onerror = () => {
                webPSupportFound = false;
                reject();
            }
        });

        img.src = data;
        await loadPromise;
    }

    return webPSupportFound;
}

export { supportsWebP };