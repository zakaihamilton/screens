/*
 @author Zakai Hamilton
 @component CoreModule
 */

screens.core.module = function CoreModule(me) {
    me.init = function () {
        me.core.property.link("core.http.receive", "core.module.receive", true);
        me.autoprefixer = require('autoprefixer');
        me.postcss = require('postcss');
    };
    me.path_file_to_component = function (filePath) {
        filePath = filePath.substring(filePath.lastIndexOf("/") + 1);
        if (filePath.indexOf("_") === -1) {
            return "";
        }
        var component_path = filePath.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.loadTextFile = async function (filePath) {
        try {
            var data = await me.core.file.readFile(filePath, 'utf8');
        }
        catch(err) {
            err = "Cannot load text file: " + filePath + " err: " + err;
            me.error(err);
            throw err;
        }
        return data;
    };
    me.loadBinaryFile = async function (filePath) {
        var data = await me.core.file.readFile(filePath);
        me.log("serving binary file: " + filePath);
        return data;
    };
    me.handleStylesheet = async function (filePath) {
        var data = await me.loadTextFile(filePath);
        var result = await me.postcss([me.autoprefixer]).process(data);
        result.warnings().forEach(function (warn) {
            me.warn(warn.toString());
        });
        return result.css;
    };
    me.handleCode = async function (filePath, params, info) {
        if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
        }
        var component_path = me.core.module.path_file_to_component(filePath);
        var target_platform = null;
        if (component_path) {
            try {
                var component = screens(component_path);
                target_platform = component.require;
            }
            catch (err) {

            }
        }
        var components = [component_path];
        var source_platform = info.query["platform"];
        if (target_platform && target_platform !== source_platform) {
            me.log("serving remote for:" + filePath + " source_platform: " + source_platform + " target_platform: " + target_platform);
            filePath = "packages/code/remote.js";
            components = me.components.map(function (component_name) {
                if(!(component_name.includes(component_path))) {
                    return null;
                }
                return component_name;
            });
            components = components.filter(Boolean);
        }
        var data = await me.loadTextFile(filePath);
        var jsonData = "{}";
        var vars = { "platform": target_platform};
        if (data && data.includes("__json__") && !data.includes("global" + ".__json__")) {
            me.log("including json data in javascript file");
            var jsonFilePath = filePath.replace(".js", ".json");
            jsonData = await me.loadTextFile(jsonFilePath);
            me.log("jsonData path: " + jsonFilePath + " length: " + jsonData.length);
            vars.json = jsonData;
        }
        var originalData = data;
        for(var componentIndex = 0; componentIndex < components.length; componentIndex++) {
            vars.component = components[componentIndex];
            /* Apply variables */
            if (data) {
                for (var key in vars) {
                    data = data.split("__" + key + "__").join(vars[key]);
                }
            }
            if(componentIndex < components.length - 2) {
                data += originalData;
            }
        }
        return data;
    };
    me.handleMultiFiles = async function (filePath, params, info) {
        var files = filePath.split(",");
        info.body = "";
        if(params.contentType) {
            info["content-type"] = params.contentType;
        }
        var file = files[0];
        var folder = me.core.path.folderPath(file);
        var name = me.core.path.fileName(file);
        if (name.includes("*")) {
            var items = await me.core.file.readDir(folder);
            files = items.map((filePath) => {
                return folder + "/" + filePath;
            });
            files = files.filter((filePath) => {
                return filePath.endsWith(params.extension);
            });
        }
        else if (files.length > 1) {
            files = files.slice(1).map((filePath) => {
                return folder + "/" + filePath;
            });
            files.unshift(file);
        }
        data = "";
        for(var filePath of files) {
            data += await params.method(filePath, params, info);
        }
        info.body = data;
    };
    me.handleFile = async function (filePath, params, info) {
        if (filePath.endsWith(".js")) {
            params = Object.assign({}, params);
            params.method = me.handleCode;
            params.extension = ".js";
            params.contentType = "application/javascript";
            await me.handleMultiFiles(filePath, params, info);
        } else if (filePath.endsWith(".css")) {
            params = Object.assign({}, params);
            params.method = me.handleStylesheet;
            params.contentType = "text/css";
            params.extension = ".css";
            await me.handleMultiFiles(filePath, params, info);
        } else if (filePath.endsWith(".html")) {
            info["content-type"] = "text/html";
            var data = await me.loadTextFile(filePath);
            var startupArgs = info.query["args"];
            if (!startupArgs) {
                startupArgs = "";
            }
            if (!startupArgs.startsWith("[")) {
                startupArgs = "[" + startupArgs;
            }
            if (!startupArgs.endsWith("]")) {
                startupArgs = startupArgs + "]";
            }
            startupArgs = startupArgs.replace(/[/"]/g, "'");
            data = data.replace("__startup_app__", "'" + params.startupApp + "'");
            data = data.replace("__startup_args__", startupArgs);
            info.body = data;
        } else if (filePath.endsWith(".png")) {
            info["content-type"] = "image/png";
            info.body = await me.loadBinaryFile(filePath);
        } else if (filePath.endsWith(".svg")) {
            info["content-type"] = "image/svg+xml";
            info.body = await me.loadBinaryFile(filePath);
        } else if (filePath.endsWith(".json")) {
            info["content-type"] = "application/json";
            info.body = await me.loadTextFile(filePath);
        } else if (filePath.endsWith(".txt")) {
            info["content-type"] = "text/plain";
            info.body = await me.loadTextFile(filePath);
        } else if (filePath.endsWith(".m4a")) {
            var mimeType = "audio/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp4")) {
            var mimeType = "video/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp3")) {
            var mimeType = "audio/mpeg";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        }
    };
    me.receive = {
        set: async function (info) {
            if (me.platform === "server") {
                if (info.method === "GET") {
                    var params = {};
                    if (info.url.startsWith("/") && !info.url.includes(".")) {
                        params.startupApp = info.url.substring(1);
                        info.url = "/main.html";
                    }
                    var filePath = info.url.substring(1);
                    await me.handleFile(filePath, params, info);
                }
            }
        }
    };
    return "server";
};
