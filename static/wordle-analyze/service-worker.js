const CACHE_NAME = "wordle-wasm-v1";
const CACHE_URLS = [
    ".",
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

self.addEventListener("install", (event) => {
    event.waitUntil(cacheResources());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});