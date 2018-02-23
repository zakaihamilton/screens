/*
 @author Zakai Hamilton
 @component LibZLib
 */

package.require("lib.zlib", "server");

package.lib.zlib = function LibZLib(me) {
    me.init = function () {
        me.zlib = require('zlib');
        me.core.property.link("core.http.compress", "lib.zlib.compress", true);
    };
    me.compress = {
        set: function (info) {
            var encoding = info.headers['accept-encoding'];
            var compressMethod = null;
            if(encoding && info.body) {
                if (encoding.includes('gzip')) {
                    encoding = "gzip";
                    compressMethod = me.zlib.gzip;
                } else if (encoding.includes('deflate')) {
                    encoding = "deflate";
                    compressMethod = me.zlib.inflate;
                }
            }
            if (compressMethod) {
                me.lock(info.task, task => {
                    compressMethod(info.body, (err, buf) => {
                        if (err) {
                            me.core.console.log("compress encoding failed for encoding: " + encoding + " error: " + JSON.stringify(err));
                        } else {
                            info.responseHeaders['Content-Encoding'] = encoding;
                            info.body = buf;
                        }
                        me.unlock(task);
                    });
                });
            }
        }
    };
};