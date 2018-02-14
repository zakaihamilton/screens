/*
 @author Zakai Hamilton
 @component HttpServer
 */

package.service.httpserver = function HttpServer(me) {
    me.init = function () {
        me.fs = require("fs");
        me.mime = require('mime');
    };
    me.setup = function (callback, ref) {
        me.core.service.config(config => {
            if (config) {
                var path = config.path;
                if (path) {
                    me.core.console.log("serving files from: " + path);
                    me.core.property.link("core.http.receive", "service.httpserver.receive", true);
                    me.filePrefix = path;
                }
                callback();
            }
        }, me.__component);
    };
    me.receive = {
        set: function (info) {
            if (info.method === "GET") {
                var filePath = me.filePrefix + info.url.substring(1);
                var extension = me.core.path.extension(filePath);
                info["content-type"] = me.mime.getType(extension);
                if (extension === "mp4") {
                    var mimeType = "video/mp4";
                    info.custom = true;
                    me.core.stream.serve(info.headers, info.response, filePath, mimeType);
                    me.manager.packet.signal(null, filePath);
                }
                else {
                    me.lock(info.task, task => {
                        me.fs.readFile(filePath, null, function (err, data) {
                            me.core.console.log("serving file: " + filePath + " with content type: " + info["content-type"]);
                            if (err) {
                                info.body = err.message;
                            }
                            else {
                                info.body = data;
                            }
                            me.unlock(task);
                        });
                    });
                }
            }
        }
    };
};
