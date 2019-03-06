/*
 @author Zakai Hamilton
 @component MediaMpd
 */

screens.media.mpd = function MediaMPD(me, packages) {
    const { core } = packages;
    core.property.link("core.http.receive", "media.mpd.receive", true);
    me.receive = async function (info) {
        if (me.platform !== "server" || info.method !== "GET") {
            return;
        }
        if (info.url.endsWith(".mpd")) {
            if (info.url.startsWith("/api/mpd/")) {
                let body = "";
                info["content-type"] = " application/dash+xml";
                info.body = body;
            }
        }
        if (info.url.startsWith("/api/mpd/stream/") && info.url.endsWith(".ts")) {
            let path = info.url.match(/api\/mpd\/stream\/(.*)/)[1];
            let ts_file = core.path.folderPath(path) + ".ts";
            let offset = parseInt(core.path.fileName(path));
            let size = parseInt(info.query["size"]) | 0;
            let headers = Object.assign({}, info.headers);
            if (!headers.range || headers.range === "bytes=0-") {
                headers.range = "bytes=" + offset + "-" + (offset + size);
                headers.total = size;
            }
            info.custom = true;
            core.stream.serve(headers, info.response, ts_file, "video/MP2T");
        }
    };
    me.genParts = function (source, params) {
        var parts = [];
        var part = { duration: 0.0, offset: 0, size: 0 };
        for (let frame of source.frames) {
            if (part.duration >= params.duration) {
                part.url = me.genUrl(source, params, part);
                parts.push(part);
                part = { duration: 0.0, offset: 0, size: 0 };
            }
            if (!part.size) {
                part.offset = frame.offset;
                part.size = frame.size;
            }
            else {
                part.size += frame.size;
            }
            part.duration += frame.duration;
        }
        part.url = me.genUrl(source, params, part);
        parts.push(part);
        return parts;
    };
    me.genUrl = function (source, params, part) {
        return core.util.url() + "/api/mpd/stream/" + params.path + "/" + part.offset + ".ts?size=" + part.size;
    };
};