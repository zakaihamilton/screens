/*
 @author Zakai Hamilton
 @component MediaFFMpeg
 */

screens.media.ffmpeg = function MediaFFMpeg(me, packages) {
    me.init = function () {
        const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfmpegPath(ffmpegPath);
    };
    me.convert = function (source, target, options, progressCb) {
        return new Promise((resolve, reject) => {
            let percent = 0;
            var instance = me.ffmpeg(source);
            for (var key in options) {
                instance[key](options[key]);
            }
            instance.on("error", function (err) {
                me.log("An error occurred: " + err.message);
                reject(err);
            });
            instance.on("progress", function (progress) {
                if (percent !== parseInt(progress.percent)) {
                    me.log("Processing: " + source + " to " + target + " " + JSON.stringify(progress));
                    percent = parseInt(progress.percent);
                    if (progressCb) {
                        progressCb(percent);
                    }
                }
            });
            instance.on("end", function () {
                me.log("Processing finished for " + source + " to " + target);
                resolve();
            });
            instance.save(target);
        });
    };
    me.metadata = function (path) {
        return new Promise((resolve, reject) => {
            me.ffmpeg.ffprobe(path, function (err, metadata) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(metadata);
                }
            });
        });
    };
    return "server";
};
