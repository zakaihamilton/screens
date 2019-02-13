/*
    @author Zakai Hamilton
    @component CorePack
*/

screens.core.pack = function CorePack(me) {
    me.init = function () {
        me.postcss = require("postcss");
        me.autoprefixer = require("autoprefixer");
        me.uglify = require("uglify-es");
        me.cleanCSS = require("clean-css");
        me.cachePath = "cache/hash";
    };
    me.collect = async function (rootPath, target, folderExclude, extInclude, componentHeaders) {
        var body = "";
        var list = [];
        var packages = {};
        for (let ext of extInclude) {
            await me.core.file.iterate(rootPath, true, async (path) => {
                let fileExt = me.core.path.extension(path);
                let fileName = me.core.path.fileName(path);
                let folderName = path.split("/").slice(-2, -1)[0];
                if (fileExt !== ext) {
                    return;
                }
                if (folderExclude && folderExclude.includes(folderName)) {
                    return;
                }
                let [package, component, platform] = fileName.split("_");
                if (!package || !component) {
                    return;
                }
                let info = {
                    folder: folderName,
                    path,
                    package,
                    component,
                    platform,
                    target,
                    ext
                };
                if (!packages[package]) {
                    packages[package] = [];
                }
                if (!packages[package].includes(component)) {
                    packages[package].push(component);
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
            var data = await me.core.file.readFile(info.path, "utf8");
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
    me.minify = function (path, data) {
        if (!me.core.util.isSecure()) {
            return data;
        }
        var hash = me.core.string.hash(data);
        var cachePath = me.cachePath + "/hash_" + path.replace(/[/.]/g, "_") + "_" + hash + ".txt";
        var cacheBuffer = me.core.file.buffer.read(cachePath, "utf8");
        if (cacheBuffer) {
            return cacheBuffer;
        }
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
        me.core.file.buffer.write(cachePath, data, "utf8");
        return data;
    };
    me.js = function (info, data) {
        var body = "";
        if (info.folder === "server" || info.folder === "service") {
            body += `screens.${info.package}.${info.component} = function (me) { return "${info.folder}"; };\n`;
        }
        else if (info.platform && info.platform !== info.target) {
            body += `screens.${info.package}.${info.component} = function (me) { return "${info.platform}"; };\n`;
        }
        else {
            body += me.minify(info.path, data) + "\n";
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
        var result = await me.postcss([me.autoprefixer]).process(data);
        result.warnings().forEach(function (warn) {
            me.log_warn(warn.toString());
        });
        return me.minify(info.path, result.css);
    };
    return "server";
};