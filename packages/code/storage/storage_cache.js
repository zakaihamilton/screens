/*
 @author Zakai Hamilton
 @component StorageCache
 */

screens.storage.cache = function StorageCache(me) {
    me.init = function() {
        me.core.event.register(null, self, "fetch", me.fetch);
    };
    me.fetch = function(object, event) {
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
    };
    return "service_worker";
};
