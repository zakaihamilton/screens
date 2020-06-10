
importScripts("/packages/code/screens.js?platform=service_worker");

importScripts("/platform/service_worker.js?platform=service_worker");

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-sw.js");

var components = [];
for (var the_package of screens.packages) {
    for (var component in screens[the_package]) {
        components.push({ package: the_package, component });
    }
}
screens.require(components).then(() => screens.core.startup.run());

workbox.routing.registerRoute(
    ({ url }) => {
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
    ({ url }) => {
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
    /\.css$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: "css-cache"
    })
);

workbox.routing.registerRoute(
    /\.(?:woff2|ttf)$/,
    new workbox.strategies.CacheFirst({
        cacheName: "font-cache"
    })
);
workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
    new workbox.strategies.CacheFirst({
        cacheName: "image-cache"
    })
);
