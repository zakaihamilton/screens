/*
 @author Zakai Hamilton
 @component MediaVoice
 */

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
        var voices = me.voices(params.language);
        var voices = voices.filter((voice) => {
            return voice.name.includes(voiceName);
        });
        var volume = 1;
        var rate = 1;
        var pitch = 1;
        if(typeof params.volume !== "undefined") {
            volume = params.volume;
        }
        if(typeof params.rate !== "undefined") {
            rate = params.rate;
        }
        if(typeof params.pitch !== "undefined") {
            pitch = params.pitch;
        }
        if(!voices.length) {
            voices = me.voices(params.language);
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
        var textArray = text;
        if(!Array.isArray(textArray)) {
            textArray = [text];
        }
        var processedTexts = textArray.map((text) => me.process(text));
        processedTexts.map((text, index) => {
            var parts = text.split("\n");
            if (!parts.length) {
                if (params.onend) {
                    params.onend();
                }
                return;
            }
            parts.map(processedText => {
                var utterance = new SpeechSynthesisUtterance();
                utterance.voice = voice;
                utterance.volume = volume; // 0 to 1
                utterance.rate = rate; // 0.1 to 10
                utterance.pitch = pitch; //0 to 2
                utterance.text = processedText;
                utterance.lang = voice.lang;
                utterance.onstart = () => {
                    if (!me.queueIndex && params.onstart) {
                        params.onstart();
                    }
                    if(params.onchange && processedText) {
                        params.onchange(index, processedText);
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
    me.voices = function (language) {
        var voices = me.synth.getVoices();
        if(language) {
            language = language.toLowerCase();
            if(!voices) {
                voices = [];
            }
            language = language.slice(0, 2).toLowerCase();
        }
        voices = voices.filter((voice) => {
            return voice.lang.toLowerCase().startsWith(language);
        });
        return voices;
    };
    me.process = function (text) {
        var items = text.match(/-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?/g);
        text = text.replace(/[,]/g, "\n");
        if(items) {
            items.map(item => {
                text = text.replace(item.replace(",", "\n"), item);
            });
        }
        text = text.replace(/^(\d+\))/g, "\n$1\n");
        text = text.replace(/\s-\s/g, "\n");
        text = text.replace(/[”\".:;—]/g, "\n");
        text = text.replace(/[\)\]]/g, ", ");
        text = text.replace(/[“\(\[]/g, ", ");
        text = text.replace(/\s[,]/g, ",");
        text = text.replace(/[,][,]/g, ",");
        text = text.replace(/\n\s\n/g, "\n");
        text = text.replace(/\n\n/g, "\n");
        text = text.replace(/  /g, " ");
        text = text.replace(/\s\n/g, "\n");
        text = text.replace(/\n\s/g, "\n");
        text = text.replace(/…/g, ", ");
        text = text.split("\n").map(item => {
            var original = null;
            var index = 0;
            do {
                original = item;
                if(item.length > 50 && item.length - item.lastIndexOf("\n") > 50) {
                    switch(index) {
                        case 0:
                            item = item.replace(" that is that ", " that\nis that ");
                            break;
                        case 1:
                            item = item.replace(" because ", "\nbecause ");
                            break;
                        case 2:
                            item = item.replace(" and ", "\nand ");
                            break;
                        case 3:
                            item = item.replace(" or ", "\nor ");
                            break;
                        default:
                            original = null;
                            index = -1;
                            break;
                    }
                    index++;
                }
            } while(original !== item);
            return item;
        }).join("\n");
        text = text.split("\n").map(item => {
            if(item.split(" ").length >= 20) {
                console.log("long text: " + item);
            }
            return item;
        }).join("\n");
        text = text.split("\n").filter(item => {
            return item.trim() !== "";
        }).join("\n");
        return text;
    };
    return "browser";
};
