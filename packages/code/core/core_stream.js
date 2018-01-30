/*
 @author Zakai Hamilton
 @component CoreStream
 */

package.require("core.stream", "server");

package.core.stream = function CoreStream(me) {
    me.init = function () {
        me.fs = require("fs");
        me.faststart = require("faststart");
    };
    me.serve = function (headers, response, path, contentType) {
        var stat = me.fs.statSync(path);
        var range = headers.range;
        if (false && contentType && contentType.startsWith("audio") && range) {
            var total = stat.size;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total;
            var chunkSize = (end - start);
            var headers = {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": contentType
            };
            var partial = total !== chunkSize;
            var responseCode = 200;
            if(partial) {
                responseCode = 206;
            }
            response.writeHead(responseCode, headers);
            var stream = null;
            stream = me.faststart.createReadStream(path, {start: start, end: end});
            if(stream) {
                stream.pipe(response);
            }
            else {
                response.end();                
            }
            me.core.console.log("streaming:" + path + " with stream: " + stream + " with headers: " + JSON.stringify(headers) + " partial: " + (partial ? "yes" : "no") + " range:" + range);
        }
        else {
            var stream = me.faststart.createReadStream(path);
            var headers = {
                "Content-Length": stat.size,
                "Content-Type": contentType
            };
            response.writeHead(200, headers);
            if(stream) {
                me.core.console.log("serving: " + path + " with contentType:" + contentType);
                stream.pipe(response);
            }
            else {
                me.core.console.log("cannot serve: " + path + " with contentType:" + contentType);
                response.end();                
            }
        }
    };
};