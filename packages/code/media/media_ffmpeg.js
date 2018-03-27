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
    me.convert = function (callback, source, format, target) {
        me.ffmpeg(source)
                .toFormat(format)
                .on('error', function (err) {
                    me.log('An error occurred: ' + err.message);
                    callback(err, null);
                })
                .on('progress', function (progress) {
                    me.log('Processing: ' + source + ' to ' + target + ' ' + progress.targetSize + ' KB converted = ' + JSON.stringify(progress));
                    callback(null, progress);
                })
                .on('end', function () {
                    me.log('Processing finished for ' + source + ' to ' + target);
                    callback(null, null);
                })
                .save(target);
    };
    me.info = function (callback) {
        me.lock(task => {
            var info = {};
            me.lock(task, task => {
                me.ffmpeg.getAvailableFormats(function (err, formats) {
                    info.formats = formats;
                    me.unlock(task);
                });
            });
            me.lock(task, task => {
                me.ffmpeg.getAvailableCodecs(function (err, codecs) {
                    info.codecs = codecs;
                    me.unlock(task);
                });
            });
            me.lock(task, task => {
                me.ffmpeg.getAvailableEncoders(function (err, encoders) {
                    info.encoders = encoders;
                    me.unlock(task);
                });
            });
            me.lock(task, task => {
                me.ffmpeg.getAvailableFilters(function (err, filters) {
                    info.filters = filters;
                    me.unlock(task);
                });
            });
            me.unlock(task, () => {
                callback(info);
            });
        });
    };
    return "server";
};
