importScripts("/packages/code/screens.js?platform=service_worker");
importScripts("/platform/service_worker.js?platform=service_worker");

var components = [];
for (var package of screens.packages) {
    for (var component in screens[package]) {
        components.push({ package, component });
    }
}
screens.require(components).then(() => screens.core.startup.run());
