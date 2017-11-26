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
};
