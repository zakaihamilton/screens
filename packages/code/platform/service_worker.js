importScripts("/packages/code/screens.js?platform=service_worker");

screens.include({
    "core": [
        "*"
    ]
}).then(async () => {
    await screens.core.startup.run();
});

self.addEventListener('fetch', event => {
    screens.log("fetch " + JSON.stringify(event.request.url));
    // Prevent the default, and handle the request ourselves.
    event.respondWith(async function () {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        return fetch(event.request);
    }());
});