/*
 @author Zakai Hamilton
 @component MediaHls
 */

package.require("media.hls", "server");
package.media.hls = function MediaHLS(me) {
    me.download = function (callback, path, destination) {
        var name = me.core.path.fullName(path);
        var targetPlaylist = me.core.path.goto(destination, name);
        me.core.console.log("downloading " + path + " to:" + targetPlaylist);
        var sourceFile = path;
        var targetFile = null;
        var errors = [];
        me.core.file.download((err) => {
            if (err) {
                callback(err);
                return;
            }
            me.core.console.log("opening " + targetPlaylist);
            me.core.file.readFile((err, data) => {
                if (err) {
                    callback(new Error("Cannot open" + targetPlaylist + " err: " + err.message));
                    return;
                }
                if (!data) {
                    callback(new Error("Playlist is empty"));
                    return;
                }
                var lines = String(data).split("\n");
                if (lines.length) {
                    me.flow(callback, (flow) => {
                        for(var line of lines) {
                            var search = "URI=\"";
                            if (line.includes(search)) {
                                var start = line.indexOf(search);
                                var len = line.substring(start+search.length).indexOf("\"");
                                if(start !== -1 && len !== -1) {
                                    line = line.substring(start+search.length, start+search.length+len);
                                }
                            }
                            if (line.endsWith(".m3u8")) {
                                sourceFile = me.core.path.goto(path, "../" + line);
                                targetFile = me.core.path.goto(destination, line + "/..");
                                flow.async(me.download, flow.callback, sourceFile, targetFile);
                            }
                            if (line.endsWith(".ts")) {
                                sourceFile = me.core.path.goto(path, "../" + line);
                                targetFile = me.core.path.goto(destination, line);
                                flow.async(me.core.file.download, flow.callback, sourceFile, targetFile);
                            }
                        }
                        flow.wait((err) => {
                            if(err) {
                                me.core.console.log("error: " + err.message);
                            }
                            flow.error(err, "failed to download in playlist: " + targetPlaylist);
                        }, () => {
                            flow.end();
                        }, 1);
                    });
                }
            }, targetPlaylist);
        }, sourceFile, targetPlaylist);
    };
};