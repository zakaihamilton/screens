self.exports = {};
importScripts("/node_modules/promise-worker-bi/dist/commonjs.js");
importScripts("/packages/code/screens.js?platform=client");
importScripts("/platform/client.js?platform=client");

var components = [];
for (var the_package of screens.packages) {
    for (var component in screens[the_package]) {
        components.push({ package: the_package, component });
    }
}
screens.require(components).then(() => screens.core.startup.run());
