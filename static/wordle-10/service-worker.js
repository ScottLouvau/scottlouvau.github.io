const CACHE_VERSION = "v2";
const CACHE_PREFIX = "wordle-10";

const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const CACHE_URLS = [
    "./",
    "./app.webmanifest",
    "./icon.svg",
];

async function install() {
    // Delete older caches for this app
    for (const name of await caches.keys()) {
        if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) {
            await caches.delete(name);
        }
    }

    // Pre-cache specified resources in the current cache name
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
    event.waitUntil(install());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request));
});