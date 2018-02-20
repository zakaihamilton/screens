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
                    me.lock((task) => {
                        for (var line of lines) {
                            if (line.endsWith(".m3u8")) {
                                sourceFile = me.core.path.goto(path, "../" + line);
                                me.lock(task, (task) => {
                                    me.download((error) => {
                                        if (error) {
                                            errors.push(new Error("Cannot download file: " + path + " error:" + error.message));
                                        }
                                        me.unlock(task);
                                    }, sourceFile, destination);
                                });
                            }
                            if (line.endsWith(".ts")) {
                                sourceFile = me.core.path.goto(path, "../" + line);
                                me.core.console.log("downloading: " + sourceFile);
                                me.lock(task, (task) => {
                                    me.core.file.download((err) => {
                                        if (err) {
                                            errors.push(new Error("Cannot open" + targetPlaylist + " err: " + err.message));
                                        }
                                        me.unlock(task);
                                    }, sourceFile, destination);
                                });
                            }
                        }
                        me.unlock(task, () => {
                            if (errors.length) {
                                var error = errors.map((error) => {
                                    return error.message;
                                }).join(", ");
                                callback(error);
                            } else {
                                callback(null);
                            }
                        });
                    });
                }
            }, targetPlaylist);
        }, sourceFile, targetPlaylist);
    };
};