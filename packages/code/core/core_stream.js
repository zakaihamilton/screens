/*
 @author Zakai Hamilton
 @component CoreStream
 */

screens.core.stream = function CoreStream(me) {
    me.init = function () {
        if(screens.platform === "server" || screens.platform === "service") {
            me.fs = require("fs");
        }
    };
    me.serve = function (headers, response, path, contentType) {
        var stat = me.fs.statSync(path);
        var range = headers.range;
        var partial = false;
        if (range) {
            var total = stat.size;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunkSize = (end - start)+1;
            var headers = {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": contentType
            };
            partial = total !== chunkSize;
            var responseCode = 200;
            if(partial) {
                responseCode = 206;
            }
            response.writeHead(responseCode, headers);
            var stream = null;
            if(start > end) {
                start = end;
            }
            stream = me.fs.createReadStream(path, {start: start, end: end});
            if(stream) {
                me.log("streaming:" + path + " with stream: " + stream + " with headers: " + JSON.stringify(headers) + " partial: " + (partial ? "yes" : "no") + " range:" + range);
                stream.pipe(response);
            }
            else {
                me.log("cannot stream:" + path + " with stream: " + stream + " with headers: " + JSON.stringify(headers) + " partial: " + (partial ? "yes" : "no") + " range:" + range);
                response.end();
            }
        }
        else {
            var stream = me.fs.createReadStream(path);
            var headers = {
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Credentials":"false",
                "Access-Control-Allow-Headers":"*",
                "Access-Control-Allow-Methods":"GET,POST,HEAD",
                "Access-Control-Allow-Origin":"*",
                "Access-Control-Max-Age":86400,
                "Content-Length": stat.size,
                "Content-Type": contentType
            };
            response.writeHead(200, headers);
            if(stream) {
                me.log("serving: " + path + " with contentType:" + contentType);
                stream.pipe(response);
            }
            else {
                me.log("cannot serve: " + path + " with contentType:" + contentType);
                response.end();                
            }
        }
        return partial;
    };
};