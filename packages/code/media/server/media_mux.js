/*
 @author Zakai Hamilton
 @component MediaMux
 */

screens.media.mux = function MediaMux(me) {
    me.init = function () {
        me.muxjs = require("mux.js");
        me.videoLib = require("node-video-lib");
        me.fs = require("fs");
        me.core.property.link("core.http.receive", "media.mux.receive", true);
    };
    me.receive = async function (info) {
        if (me.platform !== "server" || info.method !== "GET") {
            return;
        }
        if (info.url.endsWith(".m3u8") || info.url.endsWith(".m3u")) {
            if (info.url.startsWith("/api/hls/master/")) {
                let body = "#EXTM3U\n";
                let source_dir = info.url.match(/api\/hls\/master\/(.*).m3u8/)[1];
                let duration = parseFloat(info.query["duration"]) || 2.0;
                if (source_dir) {
                    let source_files = await me.core.file.readDir(source_dir);
                    for (let source_file of source_files) {
                        if (!source_file.endsWith(".json")) {
                            continue;
                        }
                        let source_buffer = await me.core.file.readFile(source_dir + "/" + source_file, "utf8");
                        let source = JSON.parse(source_buffer);
                        let video_stream = source.info.streams.find(stream => stream.codec_type === "video");
                        if (video_stream.codec_name !== "h264") {
                            throw "Codec not supported: " + video_stream.codec_name;
                        }
                        let profile = {
                            "Baseline": "42E0",
                            "Main": "4D40",
                            "High": "6400"
                        };
                        let video_codec = "avc1." + profile[video_stream.profile] + video_stream.level;
                        let resolution = video_stream.width + "x" + video_stream.height;
                        body += `#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${source.info.format.bit_rate},RESOLUTION=${resolution},CODECS="${video_codec}, mp4a.40.2"\n`;
                        let m3u8_file = me.core.path.replaceExtension(source_dir + "/" + source_file, "m3u8");
                        body += me.core.util.url() + "/api/hls/vod/" + m3u8_file + "?duration=" + duration;
                        body += "\n";
                    }
                }
                info["content-type"] = "application/vnd.apple.mpegurl";
                info.body = body;
            }
            if (info.url.startsWith("/api/hls/vod/")) {
                let body = "#EXTM3U\n";
                let source_file = info.url.match(/api\/hls\/vod\/(.*).m3u8/)[1] + ".json";
                let duration = parseFloat(info.query["duration"]) || 2.0;
                let path = me.core.path.replaceExtension(source_file);
                let source_buffer = await me.core.file.readFile(source_file, "utf8");
                let source = JSON.parse(source_buffer);
                body += "#EXT-X-PLAYLIST-TYPE:VOD\n";
                body += "#EXT-X-TARGETDURATION:" + source.info.format.duration + "\n";
                body += "#EXT-X-VERSION:4\n";
                body += "#EXT-X-MEDIA-SEQUENCE:0\n";
                let parts = me.genParts(source, {
                    duration,
                    path
                });
                for (let part of parts) {
                    body += "#EXTINF:" + duration + "\n" + part.url + "\n";
                }
                body += "#EXT-X-ENDLIST";
                info["content-type"] = "application/vnd.apple.mpegurl";
                info.body = body;
            }
        }
        if (info.url.startsWith("/api/hls/stream/") && info.url.endsWith(".ts")) {
            let path = info.url.match(/api\/hls\/stream\/(.*)/)[1];
            let ts_file = me.core.path.folderPath(path) + ".ts";
            let offset = parseInt(me.core.path.fileName(path));
            let size = parseInt(info.query["size"]) | 0;
            let headers = Object.assign({}, info.headers);
            if (!headers.range || headers.range === "bytes=0-") {
                headers.range = "bytes=" + offset + "-" + (offset + size);
                headers.total = size;
            }
            info.custom = true;
            me.core.stream.serve(headers, info.response, ts_file, "video/MP2T");
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
        return me.core.util.url() + "/api/hls/stream/" + params.path + "/" + part.offset + ".ts?size=" + part.size;
    };
    me.manageFolder = async function (path) {
        var files = await me.core.file.readDir(path);
        for (let name of files) {
            try {
                await me.manageFile(path, name);
            }
            catch (err) {
                me.log_error("Cannot convert: " + path + "/" + name + " err: " + err);
            }
        }
    };
    me.manageFile = async function (path, name) {
        if (!name.endsWith(".ts")) {
            return;
        }
        var info = await me.core.server.spawn("ffprobe -i " + path + "/" + name + " -v quiet -print_format json -show_format -show_streams -hide_banner ");
        info = JSON.parse(info);
        var data = await me.core.server.spawn("ffprobe -hide_banner -select_streams v -show_frames -show_entries frame=pict_type,key_frame,pkt_duration_time,pkt_pos,pkt_size -of csv " + path + "/" + name);
        data = data.split("\n").map(item => item.split(","));
        let frames = data.map((item, frame_index) => {
            const [, key_frame, pkt_duration_time, pkt_pos, pkt_size, pict_type] = item;
            return {
                key_frame,
                pkt_duration_time: parseFloat(pkt_duration_time),
                pkt_pos: parseInt(pkt_pos),
                pict_type,
                pkt_size: parseInt(pkt_size),
                frame_index
            };
        });
        var mainFrames = [];
        var mainFrame = { duration: 0.0, offset: 0, size: 0 };
        for (let frame of frames) {
            if (mainFrame.size && frame.key_frame && frame.pict_type === "I") {
                mainFrames.push(mainFrame);
                mainFrame = { duration: 0.0, offset: 0, size: 0 };
            }
            if (!mainFrame.size) {
                mainFrame.offset = frame.pkt_pos;
                mainFrame.size = frame.pkt_size;
            }
            else {
                mainFrame.size += frame.pkt_size;
            }
            mainFrame.duration += frame.pkt_duration_time;
        }
        mainFrames.push(mainFrame);
        var output = me.core.path.replaceExtension(path + "/" + name, "json");
        var url = me.core.util.url() + "/api/hls/master/" + path + ".m3u8";
        var json = {
            url,
            path,
            frames: mainFrames,
            info,
        };
        me.core.file.writeFile(output, JSON.stringify(json));
    };
    me.manageFileOld = async function (path) {
        if (!path.endsWith(".ts")) {
            return;
        }
        return new Promise(async (resolve, reject) => {
            me.log("Managing file: " + path);
            var buffer = await me.core.file.readFile(path);
            var transmuxer = new me.muxjs.mp4.Transmuxer({ remux: false });
            transmuxer.on("data", function (segment) {
                var metadata = segment.metadata;
                var type = segment.type;
                var output = me.core.path.replaceExtension(path, type + ".json");
                me.core.file.writeFile(output, JSON.stringify(metadata));
            });
            transmuxer.on("error", function (err) {
                reject(err);
            });
            transmuxer.on("done", function () {
                resolve();
            });
            transmuxer.push(new Uint8Array(buffer));
            transmuxer.flush();
        });
    };
    return "server";
};