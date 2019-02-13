/*
 @author Zakai Hamilton
 @component MediaFFMpeg
 */

screens.media.ffmpeg = function MediaFFMpeg(me) {
    me.init = function () {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        me.ffmpeg = require('fluent-ffmpeg');
        me.ffmpeg.setFfmpegPath(ffmpegPath);
    };
    me.convert = function (source, format, target) {
        return new Promise((resolve, reject) => {
            me.ffmpeg(source).toFormat(format)
                .on('error', function (err) {
                    me.log('An error occurred: ' + err.message);
                    reject(err);
                })
                .on('progress', function (progress) {
                    me.log('Processing: ' + source + ' to ' + target + ' ' + progress.targetSize + ' KB converted = ' + JSON.stringify(progress));
                })
                .on('end', function () {
                    me.log('Processing finished for ' + source + ' to ' + target);
                    resolve();
                })
                .save(target);
        });
    };
    return "server";
};
