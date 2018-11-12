/*
 @author Zakai Hamilton
 @component MediaMetadata
 */

screens.media.metadata = function MediaMetadata(me) {
    me.parseFile = async function (path) {
        console.log("metadata: " + path);
        const mm = require("music-metadata");
        const util = require("util");

        const metadata = mm.parseFile(path, { native: true });
        console.log(util.inspect(metadata, { showHidden: false, depth: null }));
        return metadata;
    };
    return "server";
};
