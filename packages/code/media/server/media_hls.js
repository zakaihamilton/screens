/*
 @author Zakai Hamilton
 @component MediaHls
 */

screens.media.hls = function MediaHLS(me) {
    me.download = async function (path, destination) {
        var name = me.core.path.fullName(path);
        var targetPlaylist = me.core.path.goto(destination, name);
        var sourceFile = path;
        var targetFile = null;
        var errors = [];
        await me.core.file.download(sourceFile, targetPlaylist);
        me.log("opening " + targetPlaylist);
        var data = await me.core.file.readFile(targetPlaylist);
        if (!data) {
            return;
        }
        var lines = String(data).split("\n");
        if (lines.length) {
            for (var line of lines) {
                line = line.trim();
                var search = "URI=\"";
                if (line.includes(search)) {
                    var start = line.indexOf(search);
                    var len = line.substring(start + search.length).indexOf("\"");
                    if (start !== -1 && len !== -1) {
                        line = line.substring(start + search.length, start + search.length + len);
                    }
                }
                if (line.endsWith(".m3u8")) {
                    sourceFile = me.core.path.goto(path, "../" + line);
                    targetFile = me.core.path.goto(destination, line + "/..");
                    await me.download(sourceFile, targetFile);
                }
                if (line.endsWith(".ts")) {
                    sourceFile = me.core.path.goto(path, "../" + line);
                    targetFile = me.core.path.goto(destination, line);
                    await me.download(sourceFile, targetFile);
                }
            }
        }
    };
    return "server";
};