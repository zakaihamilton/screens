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
            voices = voices.filter((voice) => {
                return voice.name.includes("English");
            });
            if(!voices.length) {
                return;
            }
        }
        var voice = voices[0];
        me.utterances = [];
        if(me.queueIndex) {
            me.queueIndex = 0;
            me.synth.cancel();
            if (params.onstart) {
                params.onstart();
            }
        }
        if(!Array.isArray(text)) {
            text = [text];
        }
        text.map((textItem, index) => {
            var parts = textItem.split("\n");
            if (!parts.length) {
                if (params.onend) {
                    params.onend();
                }
                return;
            }
            parts.map(text => {
                var utterance = new SpeechSynthesisUtterance();
                utterance.voice = voice;
                utterance.volume = 1; // 0 to 1
                utterance.rate = params.rate || 1; // 0.1 to 10
                utterance.pitch = 1; //0 to 2
                utterance.text = text;
                utterance.lang = voice.lang;
                utterance.onstart = () => {
                    if (!me.queueIndex && params.onstart) {
                        params.onstart();
                    }
                    if(params.onchange) {
                        params.onchange(index, text);
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
        });
    };
    me.stop = function () {
        me.synth.cancel();
    };
    me.voices = function () {
        return me.synth.getVoices();
    };
};
