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
        if (me.platform !== "server" || info.method !== "GET" || !info.url.endsWith(".m3u8")) {
            return;
        }
        if (info.url.startsWith("/api/hls/master")) {
            let body = "#EXTM3U\n";
            var source_dir = info.query["source"];
            var duration = info.query["duration"] || 2;
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
                    body += me.core.util.url() + "/api/hls/vod?source=" + source_dir + "&duration=" + duration + "&ts=" + me.core.path.replaceExtension(source_file, "ts");
                    body += "\n";
                }
            }
            info["content-type"] = "application/vnd.apple.mpegurl";
            info.body = body;
        }
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
        data = data.map((item, frame_index) => {
            const [, key_frame, pkt_duration_time, pkt_pos, pkt_size, pict_type] = item;
            return { key_frame, pkt_duration_time, pkt_pos, pict_type, pkt_size, frame_index };
        });
        data = data.filter(item => item.key_frame && item.pict_type === "I");
        var frames = data.map(item => {
            delete item.pict_type;
            delete item.key_frame;
            item.pkt_pos = parseInt(item.pkt_pos);
            item.pkt_size = parseInt(item.pkt_size);
            item.pkt_duration_time = parseFloat(item.pkt_duration_time);
            return item;
        });
        var output = me.core.path.replaceExtension(path + "/" + name, "json");
        var url = me.core.util.url() + "/api/hls/master.m3u8?source=" + path;
        var json = {
            url,
            path,
            frames,
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