importScripts("/packages/code/screens.js?platform=service_worker");
importScripts("/platform/service_worker.js?platform=service_worker");
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-sw.js");

var components = [];
for (var package of screens.packages) {
    for (var component in screens[package]) {
        components.push({ package, component });
    }
}
screens.require(components).then(() => screens.core.startup.run());

workbox.routing.registerRoute(
    ({ url, event }) => {
        if (url.pathname === "/") {
            return true;
        }
        if (url.host === "apis.google.com") {
            return true;
        }
        return false;
    },
    new workbox.strategies.NetworkFirst({
        cacheName: "dynamic-cache",
    })
);

workbox.routing.registerRoute(
    /\.(?:html)$/,
    new workbox.strategies.NetworkFirst({
        cacheName: "html-cache",
    })
);

workbox.routing.registerRoute(
    ({ url, event }) => {
        if (url.pathname.endsWith(".js")) {
            return true;
        }
        return false;
    },
    new workbox.strategies.NetworkFirst({
        cacheName: "js-cache",
    })
);

workbox.routing.registerRoute(
    /\.(?:json)$/,
    new workbox.strategies.NetworkFirst({
        cacheName: "json-cache",
    })
);

workbox.routing.registerRoute(
    // Cache CSS files.
    /\.css$/,
    // Use cache but update in the background.
    new workbox.strategies.StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: "css-cache",
    })
);

workbox.routing.registerRoute(
    // Cache image files.
    /\.(?:woff2|ttf)$/,
    // Use the cache if it's available.
    new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: "font-cache",
        plugins: [
            new workbox.expiration.Plugin({
                // Cache only 100 images.
                maxEntries: 100,
                // Cache for a maximum of a week.
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ],
    })
);
workbox.routing.registerRoute(
    // Cache image files.
    /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
    // Use the cache if it's available.
    new workbox.strategies.CacheFirst({
        // Use a custom cache name.
        cacheName: "image-cache",
        plugins: [
            new workbox.expiration.Plugin({
                // Cache only 100 images.
                maxEntries: 100,
                // Cache for a maximum of a week.
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ],
    })
);