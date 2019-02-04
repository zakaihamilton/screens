/*
    @author Zakai Hamilton
    @component CorePack
*/

screens.core.pack = function CorePack(me) {
    me.init = function () {
        me.postcss = require("postcss");
        me.autoprefixer = require("autoprefixer");
    };
    me.collect = async function (rootPath, target, folderExclude, extInclude) {
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
        body += "screens.packages = [\n";
        body += Object.keys(packages).map(package => "    \"" + package + "\"").join(",\n");
        body += "\n];\n\n";
        for (let package in packages) {
            body += `screens.${package} = {`;
            let components = packages[package];
            for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
                let component = components[componentIndex];
                body += `\n    ${component}: {}`;
                if (componentIndex < components.length - 1) {
                    body += ",";
                }
            }
            body += "\n};\n\n";
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
    me.js = function (info, data) {
        var body = "";
        if (info.platform && info.platform !== info.target) {
            body += `screens.${info.package}.${info.component} = function (me) {
                return "${info.platform}";
            };`;
        }
        else {
            body += data + "\n";
        }
        return body;
    };
    me.json = function (info, data) {
        var body = `\nscreens.${info.package}.${info.component}.${info.ext} = `;
        body += data + ";\n";
        return body;
    };
    me.html = function (info, data) {
        var body = `\nscreens.${info.package}.${info.component}.${info.ext} = \``;
        body += data + "`;\n";
        return body;
    };
    me.css = async function (info, data) {
        var result = await me.postcss([me.autoprefixer]).process(data);
        result.warnings().forEach(function (warn) {
            me.log_warn(warn.toString());
        });
        return result.css;
    };
    return "server";
};