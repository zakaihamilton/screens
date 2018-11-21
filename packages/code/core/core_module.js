/*
 @author Zakai Hamilton
 @component CoreModule
 */

screens.core.module = function CoreModule(me) {
    me.init = function () {
        me.core.property.link("core.http.receive", "core.module.receive", true);
        me.autoprefixer = require('autoprefixer');
        me.postcss = require('postcss');
        me.mime = require('mime');
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
            var data = await me.core.file.readFile(filePath, 'utf8', optional);
        }
        catch (err) {
            err = "Cannot load text file: " + filePath + " err: " + err;
            me.log_error(err);
            throw err;
        }
        return data;
    };
    me.loadBinaryFile = async function (filePath) {
        var data = await me.core.file.readFile(filePath);
        me.log("serving binary file: " + filePath);
        return data;
    };
    me.handleStylesheet = async function (filePath, params) {
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
            "source_platform": source_platform || "",
            "date": new Date().toString()
        };
        var extensions = { json: false, html: true };
        var extFilePath = filePath;
        for (var extension in extensions) {
            var isString = extensions[extension];
            if (data && data.includes("__" + extension + "__") && !data.includes("global" + ".__" + extension + "__")) {
                extFilePath = filePath.replace(".js", "." + extension);
                var extData = await me.loadTextFile(extFilePath);
                if (isString) {
                    extData = JSON.stringify(extData)
                }
                vars[extension] = extData;
            }
        }
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
        data = "";
        for (var filePath of files) {
            data += await params.method(filePath, params, info);
        }
        return data;
    };
    me.buildHtml = async function (html, params, info) {
        var lines = html.split("\n");
        try {
            lines = lines.map(async (line) => {
                /* Check if to inject file */
                var result = line.match(/\s\<script\ssrc=\"([^"]*)"\>\<\/script\>/);
                if (result && result.length > 1) {
                    var filePath = me.core.string.trimEnd(result[1], "?");
                    if (filePath.startsWith("http")) {
                        return line;
                    }
                    var codeParams = Object.assign({}, params, { method: me.handleCode, extension: ".js" });
                    var styleParams = Object.assign({}, params, { method: me.handleStylesheet, extension: ".css", optional: true });
                    codeContent = await me.core.module.handleMultiFiles(filePath, codeParams, info);
                    line = "<script id=\"" + filePath + "\">\n" + codeContent + "\n</script>\n";
                    var cssFilePath = filePath.replace(".js", ".css");
                    styleContent = await me.core.module.handleMultiFiles(cssFilePath, styleParams, info);
                    line += "<style id=\"" + cssFilePath + "\">\n" + styleContent + "\n</style>\n";
                }
                result = line.match(/\s\<link\srel\=\"stylesheet\"\shref=\"([^"]*)"\>\<\/link\>/);
                if (result && result.length > 1) {
                    var filePath = me.core.string.trimEnd(result[1], "?");
                    if (filePath.startsWith("http")) {
                        return line;
                    }
                    var styleParams = Object.assign({}, params, { method: me.handleStylesheet, extension: ".css" });
                    styleContent = await me.core.module.handleMultiFiles(filePath, styleParams, info);
                    line = "<style id=\"" + filePath + "\">\n" + styleContent + "\n</style>\n";
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
            var data = await me.loadTextFile(filePath);
            var startupArgs = info.query["args"];
            if (!startupArgs) {
                startupArgs = "";
            }
            data = data.replace("__startup_app__", "'" + params.startupApp + "'");
            data = data.replace("__startup_args__", "'" + startupArgs + "'");
            data = await me.buildHtml(data, params, info);
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
        } else {
            var extension = me.core.path.extension(filePath);
            var mimeType = me.mime.getType(extension);
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
    me.receive = {
        set: async function (info) {
            if (me.platform === "server") {
                if (info.method === "GET") {
                    var params = {};
                    if (info.url == "/meta") {
                        me.handleMeta(info);
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
        }
    };
    return "server";
};
