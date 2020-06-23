/*
    @author Zakai Hamilton
    @component CorePack
*/

screens.core.pack = function CorePack(me, { core }) {
    me.init = function () {
        me.postcss = require("postcss");
        me.autoprefixer = require("autoprefixer");
        me.uglify = require("uglify-es");
        me.cleanCSS = require("clean-css");
        me.cachePath = "hash";
        core.file.makeDir(me.cachePath);
    };
    me.collect = async function (root, target, folderExclude, extInclude, componentHeaders, format, defaultPackage, defaultComponent) {
        var body = "";
        var list = [];
        var packages = {};
        for (let ext of extInclude) {
            await core.file.iterate(root, true, async (path) => {
                let fileExt = core.path.extension(path);
                let fileName = core.path.fileName(path);
                let folderNames = path.split("/").slice(0, -1);
                if (fileExt !== ext) {
                    return;
                }
                if (folderExclude && folderExclude.some(name => folderNames.includes(name))) {
                    return;
                }
                let [packageName, componentName, platform] = fileName.split("_");
                if (!packageName || !componentName) {
                    if (!defaultPackage || !defaultComponent) {
                        return;
                    }
                    if (!componentName) {
                        componentName = packageName;
                        packageName = defaultPackage;
                    }
                }
                let info = {
                    folder: folderNames,
                    file: fileName,
                    path,
                    package: packageName,
                    component: componentName,
                    platform,
                    target,
                    ext,
                    root
                };
                if (!packages[packageName]) {
                    packages[packageName] = [];
                }
                if (!packages[packageName].includes(componentName)) {
                    packages[packageName].push(componentName);
                }
                list.push(info);
            });
        }
        if (componentHeaders) {
            body += "screens.packages = [";
            body += Object.keys(packages).map(package => "\"" + package + "\"").join(",");
            body += "];\n";
            for (let package in packages) {
                body += `screens.${package} = {`;
                let components = packages[package];
                for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
                    let component = components[componentIndex];
                    body += `${component}: {}`;
                    if (componentIndex < components.length - 1) {
                        body += ",";
                    }
                }
                body += "};\n";
            }
        }
        for (let info of list) {
            var data = await core.file.readFile(info.path, format);
            var handler = me[info.ext];
            if (handler) {
                var result = await handler(info, data);
                if (result) {
                    body += result;
                }
            }
            else {
                body += data;
            }
        }
        return body;
    };
    me.cache = async function (path, data, callback) {
        var hash = core.string.hash(data);
        var cachePath = me.cachePath + "/hash_" + path.replace(/[/.]/g, "_") + "_" + hash + ".txt";
        var cacheBuffer = core.file.buffer.read(cachePath, "utf8");
        if (cacheBuffer) {
            return cacheBuffer;
        }
        cacheBuffer = await callback(path, data);
        if (cacheBuffer) {
            core.file.buffer.write(cachePath, cacheBuffer, "utf8");
        }
        return cacheBuffer;
    };
    me.minify = function (path, data) {
        if (!core.util.isSecure()) {
            return data;
        }
        return me.cache(path, data, () => {
            if (path.endsWith(".css")) {
                var output = new me.cleanCSS({}).minify(data);
                if (output && output.styles) {
                    data = output.styles;
                }
            }
            else {
                var minify = me.uglify.minify(data, {
                    mangle: {
                        reserved: ["me"]
                    }
                });
                if (minify.code) {
                    data = minify.code;
                }
                else {
                    me.log_error("minify path: " + path + " error: " + minify.error);
                }
            }
            return data;
        });
    };
    me.js = async function (info, data) {
        var body = "";
        var platforms = ["server", "browser", "client", "service_worker"];
        if (platforms.includes(info.folder) && info.folder !== info.target) {
            body += `screens.${info.package}.${info.component} = function (me, ) { return "${info.folder}"; };\n`;
        }
        else if (info.platform && info.platform !== info.target) {
            body += `screens.${info.package}.${info.component} = function (me, ) { return "${info.platform}"; };\n`;
        }
        else {
            data = core.react.parse(info.path, data);
            body += await me.minify(info.path, data) + "\n";
        }
        return body;
    };
    me.json = function (info, data) {
        var body = `\nscreens.${info.package}.${info.component}.${info.ext} = `;
        body += data + ";\n";
        return me.minify(info.path, body);
    };
    me.html = function (info, data) {
        var body = `\nscreens.${info.package}.${info.component}.${info.ext} = \``;
        body += data + "`;\n";
        return me.minify(info.path, body);
    };
    me.css = async function (info, data) {
        var result = await me.postcss([me.autoprefixer]).process(data, {
            from: undefined
        });
        result.warnings().forEach(function (warn) {
            me.log_warn(warn.toString());
        });
        return me.minify(info.path, result.css);
    };
    me.png = async function (info, data) {
        var body = `\nscreens.ui.image.${info.file} = \``;
        body += "data:image/png;base64," + data.toString("base64");
        body += "`;\n";
        return body;
    };
    me.svg = async function (info, data) {
        var body = `\nscreens.ui.image.${info.file} = \``;
        body += "data:image/svg+xml;base64," + data.toString("base64");
        body += "`;\n";
        return body;
    };
    return "server";
};