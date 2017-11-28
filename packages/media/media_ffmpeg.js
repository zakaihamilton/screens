/*
 @author Zakai Hamilton
 @component MediaFFMpeg
 */

package.require("media.ffmpeg", "server");

package.media.ffmpeg = function MediaFFMpeg(me) {
    me.init = function() {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        me.ffmpeg = require('fluent-ffmpeg');
        me.ffmpeg.setFfmpegPath(ffmpegPath);
    };
    me.convert = function(callback, source, format, target) {
        me.ffmpeg(source)
        .toFormat(format)
        .on('error', function (err) {
            me.package.core.console.log('An error occurred: ' + err.message);
            callback(err);
        })
        .on('progress', function (progress) {
            me.package.core.console.log('Processing: ' + source + ' to ' +  target + ' ' + progress.targetSize + ' KB converted = ' + JSON.stringify(progress));
            callback(progress);
        })
        .on('end', function () {
            me.package.core.console.log('Processing finished for ' + source + ' to ' + target);
            callback(null);
        })
        .save(target);
    };
    me.info = function(callback) {
        var job = me.package.core.job.create();
        var info = {};
        me.package.core.job.task(job, function(task) {
            me.ffmpeg.getAvailableFormats(function(err, formats) {
                info.formats = formats;
                me.package.core.job.close(task);
            });
        });
        me.package.core.job.task(job, function(task) {
            me.ffmpeg.getAvailableCodecs(function(err, codecs) {
                info.codecs = codecs;
                me.package.core.job.close(task);
            });
        });
        me.package.core.job.task(job, function(task) {
            me.ffmpeg.getAvailableEncoders(function(err, encoders) {
                info.encoders = encoders;
                me.package.core.job.close(task);
            });
        });
        me.package.core.job.task(job, function(task) {
            me.ffmpeg.getAvailableFilters(function(err, filters) {
                info.filters = filters;
                me.package.core.job.close(task);
            });
        });
        me.package.core.job.complete(job, function() {
            callback(info);
        });
    };
};
