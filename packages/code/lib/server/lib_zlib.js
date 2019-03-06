/*
 @author Zakai Hamilton
 @component LibZLib
 */

screens.lib.zlib = function LibZLib(me, packages) {
    const { core } = packages;
    me.init = function () {
        me.zlib = require("zlib");
        core.property.link("core.http.compress", "lib.zlib.compress", true);
    };
    me.compress = async function (info) {
        var encoding = info.headers["accept-encoding"];
        var compressMethod = null;
        if (encoding && info.body) {
            if (encoding.includes("gzip")) {
                encoding = "gzip";
                compressMethod = me.zlib.gzip;
            } else if (encoding.includes("deflate")) {
                encoding = "deflate";
                compressMethod = me.zlib.inflate;
            }
        }
        if (compressMethod) {
            return new Promise((resolve, reject) => {
                compressMethod(info.body, (err, buf) => {
                    if (err) {
                        me.log("compress encoding failed for encoding: " + encoding + " error: " + JSON.stringify(err));
                    } else {
                        info.responseHeaders["Content-Encoding"] = encoding;
                        info.body = buf;
                    }
                    resolve();
                });
            });
        }
    };
    return "server";
};
