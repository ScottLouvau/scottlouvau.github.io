const CACHE_NAME = "wordle-wasm-v1";
const CACHE_URLS = [
    "./",
    "./app.webmanifest",
    "./index.html",
    "./wordle-analyze-a.png",
    "./data/v12.txt",
    "./data/answers.txt",
    "./data/valid.txt",
    "./pkg/wordle_wasm_bg.wasm",
    "./pkg/wordle_wasm.js",
];

async function cacheResources() {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(CACHE_URLS);
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) { 
        return cachedResponse; 
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse
    } catch (error) {
        return Response.error();
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(cacheResources());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request));
});