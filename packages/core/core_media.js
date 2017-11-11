/*
 @author Zakai Hamilton
 @component CoreMedia
 */

package.require("core.media", "server");

package.core.media = function CoreMedia(me) {
    me.init = function () {
        me.fs = require("fs");
    };
    me.serve = function (headers, response, path, contentType) {
        var stat = me.fs.statSync(path);
        var range = headers.range;
        if (range) {
            var total = stat.size;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total;
            var chunksize = (end - start);
            var headers = {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": contentType
            };
            response.writeHead(200, headers);
            var stream = me.fs.createReadStream(path, {start: start, end: end});
            if(stream) {
                stream.pipe(response);
            }
            else {
                response.end();                
            }
            me.package.core.console.log("serving:" + JSON.stringify(headers) + " with stream: " + stream);
        }
    };
};