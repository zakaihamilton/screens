/*
 @author Zakai Hamilton
 @component CoreModule
 */

screens.core.module = function CoreModule(me) {
    me.init = function () {
        me.core.property.link("core.http.receive", "core.module.receive", true);
        me.autoprefixer = require("autoprefixer");
        me.postcss = require("postcss");
        me.mime = require("mime");
    };
    me.path_file_to_component = function (filePath) {
        filePath = filePath.substring(filePath.lastIndexOf("/") + 1);
        if (filePath.indexOf("_") === -1) {
            return "";
        }
        var component_path = filePath.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.loadTextFile = async function (filePath, optional) {
        try {
            var data = await me.core.file.readFile(filePath, "utf8", optional);
        }
        catch (err) {
            var error = "Cannot load text file: " + filePath + " err: " + err;
            me.log_error(error);
            throw error;
        }
        return data;
    };
    me.loadBinaryFile = async function (filePath) {
        var data = await me.core.file.readFile(filePath);
        return data;
    };
    me.handleStylesheet = async function (filePath, params) {
        if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
        }
        if (filePath === "screens.css") {
            return await me.core.pack.collect("packages/code", "browser", ["platform"], ["css"]);
        }
        var data = await me.loadTextFile(filePath, params.optional);
        if (!data && params.optional) {
            data = "";
        }
        var result = await me.postcss([me.autoprefixer]).process(data);
        result.warnings().forEach(function (warn) {
            me.log_warn(warn.toString());
        });
        return result.css;
    };
    me.handleCode = async function (filePath, params, info) {
        if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
        }
        if (filePath.startsWith("platform/")) {
            var platform = filePath.split("/").pop().split(".")[0];
            return await me.core.pack.collect("packages/code", platform, ["platform"], ["js", "json", "html"]);
        }
        var component_path = me.core.module.path_file_to_component(filePath);
        var target_platform = null;
        if (component_path) {
            try {
                var component = screens.browse(component_path);
                if (component) {
                    target_platform = component.require;
                }
            }
            catch (err) {
                return;
            }
        }
        var components = [component_path];
        var source_platform = info.query["platform"];
        if (target_platform && target_platform !== source_platform) {
            filePath = "packages/code/remote.js";
            components = me.components.map(function (component_name) {
                if (!(component_name.includes(component_path))) {
                    return null;
                }
                return component_name;
            });
            components = components.filter(Boolean);
        }
        var data = await me.loadTextFile(filePath);
        var vars = {
            "target_platform": target_platform || "",
            "source_platform": source_platform || ""
        };
        var originalData = data;
        for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
            vars.component = components[componentIndex];
            /* Apply variables */
            if (data) {
                for (var key in vars) {
                    data = data.split("__" + key + "__").join(vars[key]);
                }
            }
            if (componentIndex < components.length - 1) {
                data += originalData;
            }
        }
        return data;
    };
    me.handleMultiFiles = async function (filePath, params, info) {
        var files = filePath.split(",");
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
        var data = "";
        for (var fileItem of files) {
            data += await params.method(fileItem, params, info);
        }
        return data;
    };
    me.buildHtml = async function (html, params, info) {
        var ignoreNextLine = false;
        var lines = html.split("\n");
        try {
            lines = lines.map(async (line) => {
                if (ignoreNextLine) {
                    ignoreNextLine = false;
                    return "";
                }
                /* Check if to inject file */
                var result = line.match(/\s<script\ssrc="([^"]*)"><\/script>/);
                if (result && result.length > 1) {
                    var filePath = me.core.string.trimEnd(result[1], "?");
                    if (filePath.startsWith("http")) {
                        return line;
                    }
                    let codeParams = Object.assign({}, params, { method: me.handleCode, extension: ".js" });
                    let styleParams = Object.assign({}, params, { method: me.handleStylesheet, extension: ".css", optional: true });
                    let codeContent = await me.core.module.handleMultiFiles(filePath, codeParams, info);
                    line = "<script id=\"" + filePath + "\">\n" + codeContent + "\n</" + "script>\n";
                    let cssFilePath = filePath.replace(".js", ".css");
                    let styleContent = await me.core.module.handleMultiFiles(cssFilePath, styleParams, info);
                    line += "<style id=\"" + cssFilePath + "\">\n" + styleContent + "\n</" + "style>\n";
                    return line;
                }
                result = line.match(/\s<link\srel="stylesheet"\shref="([^"]*)">/);
                if (result && result.length > 1) {
                    ignoreNextLine = true;
                    let filePath = me.core.string.trimEnd(result[1], "?");
                    if (filePath.startsWith("http")) {
                        return line;
                    }
                    let styleParams = Object.assign({}, params, { method: me.handleStylesheet, extension: ".css" });
                    let styleContent = await me.core.module.handleMultiFiles(filePath, styleParams, info);
                    line = "<style id=\"" + filePath + "\">\n" + styleContent + "\n</style>\n";
                    return line;
                }
                return line;
            });
            lines = await Promise.all(lines);
            html = lines.join("\n");
        }
        catch (err) {
            me.log_error("Cannot parse html: " + err);
        }
        return html;
    };
    me.handleFile = async function (filePath, params, info) {
        if (filePath.endsWith(".js")) {
            params = Object.assign({}, params);
            params.method = me.handleCode;
            params.extension = ".js";
            info["content-type"] = "application/javascript";
            info.body = await me.core.module.handleMultiFiles(filePath, params, info);
        } else if (filePath.endsWith(".css")) {
            params = Object.assign({}, params);
            params.method = me.handleStylesheet;
            params.extension = ".css";
            info["content-type"] = "text/css";
            info.body = await me.core.module.handleMultiFiles(filePath, params, info);
        } else if (filePath.endsWith(".html")) {
            info["content-type"] = "text/html";
            var useCache = true; //me.core.util.isSecure();
            var data = null;
            if (useCache) {
                var item = await me.db.cache.data.find({ component: me.id, path: filePath });
                if (item) {
                    data = item.body;
                }
            }
            if (!data) {
                me.log("building html, useCache: " + useCache + " filePath: " + filePath);
                data = await me.loadTextFile(filePath);
                data = await me.buildHtml(data, params, info);
                if (useCache) {
                    me.db.cache.data.use({ component: me.id, path: filePath }, { body: data });
                }
            }
            var startupArgs = info.query["args"];
            if (!startupArgs) {
                startupArgs = "";
            }
            data = data.replace(/__startup_app__/g, "'" + params.startupApp + "'");
            data = data.replace(/__startup_args__/g, "'" + startupArgs + "'");
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
            let mimeType = "audio/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp4")) {
            let mimeType = "video/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp3")) {
            let mimeType = "audio/mpeg";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else {
            var extension = me.core.path.extension(filePath);
            let mimeType = me.mime.getType(extension);
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        }
    };
    me.handleMeta = function (info) {
        info["content-type"] = "text/html";
        var metaTags = "";
        for (var key in info.query) {
            if (key === "redirect") {
                metaTags += "<meta http-equiv=\"refresh\" content=\"0; URL=" + info.query[key] + "\"></meta>";
            }
            else {
                if (key.startsWith("og:")) {
                    metaTags += "<meta property=\"" + key + "\" content=\"" + info.query[key] + "\"></meta>";
                }
                else {
                    metaTags += "<meta name=\"" + key + "\" content=\"" + info.query[key] + "\"></meta>";
                }
            }
        }
        var html = "<!DOCTYPE html>\
        <html>\
        <head>" + metaTags + "\
        </head>\
        <body></body>\
        </html>";
        info.body = html;
    };
    me.receive = async function (info) {
        if (me.platform === "server") {
            if (info.method === "GET") {
                var params = {};
                if (info.url == "/meta") {
                    me.handleMeta(info);
                    return;
                }
                if (info.url.startsWith("/custom/")) {
                    return;
                }
                if (info.url.startsWith("/api")) {
                    return;
                }
                if (info.url.startsWith("/upgrade")) {
                    await me.db.cache.data.remove({ component: me.id }, false);
                    info.body = "Upgrade complete";
                    return;
                }
                if (info.url.startsWith("/") && !info.url.includes(".")) {
                    params.startupApp = info.url.substring(1);
                    info.url = "/main.html";
                }
                var filePath = info.url.substring(1);
                await me.handleFile(filePath, params, info);
            }
        }
    };
    return "server";
};
