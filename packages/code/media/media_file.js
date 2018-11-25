/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me) {
    me.cachePath = "cache";
    me.init = function () {
        me.metadata = require("music-metadata");
    };
    me._listing = {};
    me.info = async function (path) {
        var metadata = null;
        try {
            metadata = await me.metadata.parseFile(path, { duration: true });
        }
        catch (err) {
            metadata = { path: path, error: err };
        }
        return metadata;
    };
    me.listing = async function (path) {
        var files = await me.storage.file.getChildren(path);
        for (var file of files) {
            var item = me._listing[file.name];
            if(item) {
                file.duration = item.duration;
            }
            else {
                var metadata = await me.info(me.cachePath + "/" + file.name);
                if (metadata) {
                    if (metadata.format) {
                        file.duration = metadata.format.duration;
                    }
                }
                me._listing[file.name] = {duration:file.duration};
            }
        }
        return files;
    };
    return "server";
};
