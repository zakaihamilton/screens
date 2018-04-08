/*
 @author Zakai Hamilton
 @component HttpServer
 */

screens.service.httpserver = function HttpServer(me) {
    me.init = function () {
        me.fs = require("fs");
        me.mime = require('mime');
    };
    me.setup = async function (ref) {
        var config = await me.core.service.config(me.id);
        if (config) {
            var path = config.path;
            if (path) {
                me.log("serving files from: " + path);
                me.core.property.link("core.http.receive", "service.httpserver.receive", true);
                me.filePrefix = path;
            }
            var newStreamMatch = config.newStreamMatch;
            if(newStreamMatch) {
                me.log("newStreamMatch: " + newStreamMatch);
                me.newStreamMatch = newStreamMatch;
            }
        }
    };
    me.receive = {
        set: function (info) {
            if (info.method === "GET") {
                var filePath = me.filePrefix + info.url.substring(1);
                var extension = me.core.path.extension(filePath);
                if(me.newStreamMatch && me.newStreamMatch.length) {
                    var match = true;
                    me.newStreamMatch.map((streamMatch) => {
                        if(!filePath.toLowerCase().includes(streamMatch.toLowerCase())) {
                            match = false;
                        }
                    });
                    if(match) {
                        me.log("found match in " + filePath + ", sending newStream message");
                        me.log("newStream");
                        me.core.service.sendAll("newStream");
                    }
                }
                if (extension === "mp4") {
                    var mimeType = "video/mp4";
                    info.custom = true;
                    var partial = me.core.stream.serve(info.headers, info.response, filePath, mimeType);
                    if(!partial) {
                        me.log("newStream");
                        me.core.service.sendAll("newStream");
                    }
                }
                else if(extension === "ts") {
                    var mimeType = "video/mp2t";
                    info.custom = true;
                    me.core.stream.serve(info.headers, info.response, filePath, mimeType);
                }
                else {
                    if (extension === "m3u8") {
                        info["content-type"] = "application/x-mpegURL";
                        info.responseHeaders["Accept-Ranges"] = "bytes";
                    }
                    var mimeType = me.mime.getType(extension);
                    info.custom = true;
                    me.core.stream.serve(info.headers, info.response, filePath, mimeType);
                }
            }
        }
    };
};
