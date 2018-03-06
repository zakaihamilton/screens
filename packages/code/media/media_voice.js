/*
 @author Zakai Hamilton
 @component MediaVoice
 */

package.require("media.voice", "browser");
package.media.voice = function MediaVoice(me) {
    me.init = function () {
        me.synth = window.speechSynthesis;
        me.utterances = [];
        me.queueIndex = 0;
    };
    me.pause = function () {
        me.synth.pause();
    };
    me.resume = function () {
        me.synth.resume();
    };
    me.play = function (text, voiceName, params) {
        var voices = me.synth.getVoices();
        var voices = voices.filter((voice) => {
            return voice.name.includes(voiceName);
        });
        if(!voices.length) {
            return;
        }
        var voice = voices[0];
        me.utterances = [];
        var parts = text.split("\n").filter(item => {
            return item.trim() !== "";
        });
        if(me.queueIndex) {
            me.queueIndex = 0;
            me.synth.cancel();
            if (params.onstart) {
                params.onstart();
            }
        }
        if (!parts.length) {
            if (params.onend) {
                params.onend();
            }
            return;
        }
        parts.map(item => {
            var utterance = new SpeechSynthesisUtterance();
            utterance.voice = voice;
            utterance.volume = 1; // 0 to 1
            utterance.rate = 1; // 0.1 to 10
            utterance.pitch = 1; //0 to 2
            utterance.text = item;
            utterance.lang = voice.lang;
            utterance.onstart = () => {
                if (!me.queueIndex && params.onstart) {
                    params.onstart();
                }
            };
            utterance.onend = () => {
                me.queueIndex++;
                if (me.queueIndex >= me.utterances.length && params.onend) {
                    me.queueIndex = 0;
                    params.onend();
                }
            };
            me.utterances.push(utterance);
            me.synth.speak(utterance);
        });
    };
    me.stop = function () {
        me.synth.cancel();
    };
    me.voices = function () {
        return me.synth.getVoices();
    };
};
