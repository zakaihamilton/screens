/*
 @author Zakai Hamilton
 @component MediaMpd
 */

screens.media.mpd = function MediaMPD(me, packages) {
    const { core } = packages;
    core.property.link("core.http.receive", "media.mpd.receive", true);
    me.receive = async function (info) {
        let { url } = info;
        if (me.platform !== "server" || info.method !== "GET") {
            return;
        }
        if (url.endsWith(".mpd")) {
            if (url.startsWith("/api/mpd/")) {
                let minBufferTime = "1.5";
                let duration = "30";
                let baseUrl = "";
                let mimeType = "video/mp2t";
                let resolution = "720p";
                let bandwidth = "3200000";
                let width = "1280";
                let height = "720";
                let body = "<?xml version=\"1.0\"?>";
                body += `<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" profiles="urn:mpeg:dash:profile:full:2011" minBufferTime="PT${minBufferTime}S">`;
                body += `<Period duration="PT${duration}S">`;
                body += `<BaseURL>${baseUrl}</BaseURL>`;
                body += `<AdaptationSet mimeType="${mimeType}">`;
                body += `<Representation id="${resolution}" bandwidth="${bandwidth}" width="${width}" height="${height}">`;
                body += `<SegmentList timescale="90000" duration="5400000">`;
                body += `<RepresentationIndex sourceURL="representation-index.sidx" />`;
                body += `<SegmentURL media="segment-1.ts" />`;
                body += `</SegmentList >`;
                body += `</Representation >`;
                body += `</AdaptationSet>`;
                body += `</Period>`;
                body += `</MPD>`;




                info["content-type"] = " application/dash+xml";
                info.body = body;
            }
        }
        if (info.url.startsWith("/api/mpd/stream/")) {
            let path = info.url.match(/api\/mpd\/stream\/(.*)/)[1];
            let extension = core.path.extension(path);
            let sourceFile = core.path.folderPath(path) + "." + extension;
            let offset = parseInt(core.path.fileName(path));
            let size = parseInt(info.query["size"]) | 0;
            let headers = Object.assign({}, info.headers);
            if (!headers.range || headers.range === "bytes=0-") {
                headers.range = "bytes=" + offset + "-" + (offset + size);
                headers.total = size;
            }
            info.custom = true;
            var mimeType = me.mime.getType(extension);
            core.stream.serve(headers, info.response, sourceFile, mimeType);
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