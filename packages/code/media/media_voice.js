/*
 @author Zakai Hamilton
 @component MediaVoice
 */

package.require("media.voice", "browser");
package.media.voice = function MediaVoice(me) {
    me.pause = function() {
        responsiveVoice.pause();
    };
    me.resume = function() {
        responsiveVoice.resume();
    };
    me.support = function() {
        return responsiveVoice.voiceSupport();
    };
    me.play = function(text, voice, params) {
        responsiveVoice.speak(text, voice, params);
    };
    me.stop = function() {
        responsiveVoice.cancel();
    };
    me.voices = function() {
        return responsiveVoice.getVoices();
    };
};
