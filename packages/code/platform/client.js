importScripts("/packages/code/screens.js?platform=client");
importScripts("/platform/client.js?platform=client");

var components = [];
for (var package of screens.packages) {
    for (var component in screens[package]) {
        components.push({ package, component });
    }
}
screens.require(components).then(() => screens.core.startup.run());
