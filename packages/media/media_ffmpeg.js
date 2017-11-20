/*
 @author Zakai Hamilton
 @component MediaFFMpeg
 */

package.media.ffmpeg = function MediaFFMpeg(me) {
    me.init = function() {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        me.ffmpeg = require('fluent-ffmpeg');
        me.ffmpeg.setFfmpegPath(ffmpegPath);
    };
};
