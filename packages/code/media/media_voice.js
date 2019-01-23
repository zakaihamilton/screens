/*
 @author Zakai Hamilton
 @component MediaVoice
 */

screens.media.voice = function MediaVoice(me) {
    me.init = function () {
        me.synth = window.speechSynthesis;
        me.utterances = [];
        me.currentIndex = 0;
        me.totalParts = 0;
        me.params = null;
        me.playTime = null;
    };
    me.pause = function () {
        me._isPaused = true;
        me.synth.pause();
    };
    me.resume = function () {
        me._isPaused = false;
        me.synth.resume();
    };
    me.speeds = {
        "Slow": 0.5,
        "Slower": 0.75,
        "Normal": 1.0,
        "Faster": 1.25,
        "Fast": 1.5,
        "Really Fast": 2.0
    };
    me.volumes = {
        "None": 0.0,
        "Low": 0.25,
        "Medium": 0.5,
        "Normal": 0.75,
        "High": 1.0
    };
    me.isPlaying = function () {
        return me.synth.speaking || me.synth.pending;
    };
    me.isPaused = function () {
        return me._isPaused;
    };
    me.play = function (text, voiceName, params) {
        if (voiceName === "None") {
            me.stop();
            if (params.oncancel) {
                params.oncancel();
            }
            return;
        }
        var voices = me.voices(params.language);
        voices = voices.filter((voice) => {
            return voice.name.includes(voiceName);
        });
        var volume = 1;
        var speed = 1;
        var pitch = 1;
        if (typeof params.volume !== "undefined") {
            volume = params.volume;
            if (typeof volume === "string") {
                if (volume in me.volumes) {
                    me.log("using volume: " + volume);
                    volume = me.volumes[volume];
                }
                else {
                    volume = 1.0;
                }
            }
        }
        if (typeof params.speed !== "undefined") {
            speed = params.speed;
            if (typeof speed === "string") {
                if (speed in me.speeds) {
                    me.log("using speed: " + speed);
                    speed = me.speeds[speed];
                }
                else {
                    speed = 1.0;
                }
            }
        }
        if (typeof params.pitch !== "undefined") {
            pitch = params.pitch;
        }
        if (!voices.length) {
            voices = me.voices(params.language);
            if (!voices.length) {
                return;
            }
        }
        var voice = voices[0];
        me.utterances = [];
        me.params = params;
        me.currentIndex = params.index || 0;
        me.synth.cancel();
        if (params.onstart) {
            params.onstart();
        }
        var textArray = text;
        if (!Array.isArray(textArray)) {
            textArray = [text];
        }
        var processedTexts = textArray.map((text) => me.process(text));
        me.totalParts = processedTexts.length;
        processedTexts.map((text, index) => {
            var parts = text.split("\n");
            if (!parts.length) {
                if (params.onend) {
                    params.onend();
                }
                return;
            }
            parts.map(processedText => {
                if (!processedText.trim().length) {
                    me.totalParts--;
                    return;
                }
                var utterance = new SpeechSynthesisUtterance();
                utterance.voice = voice;
                utterance.volume = volume; // 0 to 1
                utterance.rate = speed; // 0.1 to 10
                utterance.pitch = pitch; //0 to 2
                utterance.text = processedText;
                utterance.lang = voice.lang;
                utterance.index = index;
                utterance.onstart = () => {
                    if (params.onstate) {
                        params.onstate();
                    }
                    me.currentIndex = utterance.index;
                    if (params.onchange && processedText) {
                        params.onchange(utterance.index, processedText);
                    }
                };
                utterance.onend = () => {
                    if (params.onstate) {
                        params.onstate();
                    }
                    me.queueIndex++;
                    index = me.utterances.indexOf(utterance);
                    if (index == me.utterances.length - 1 && params.onend) {
                        me.queueIndex = 0;
                        params.onend();
                    }
                };
                me.utterances.push(utterance);
                me.log(index + ":" + processedText);
            });
        });
        me.replay();
    };
    me.replay = function () {
        if (me.currentIndex < 0) {
            me.currentIndex = me.totalParts;
            me.rewind();
            return;
        }
        me.log("me.currentIndex:" + me.currentIndex + " me.totalParts: " + me.totalParts);
        var utterances = me.utterances.filter(utterances => utterances.index >= me.currentIndex);
        me.synth.cancel();
        me.playTime = new Date().getTime();
        utterances.map(utterance => me.synth.speak(utterance));
    };
    me.rewind = function () {
        var stop = false;
        if (new Date().getTime() > me.playTime + 3000) {
            me.replay();
            return;
        }
        do {
            me.currentIndex--;
            if (me.currentIndex < 0) {
                me.synth.cancel();
                me.currentIndex = 0;
                if (me.params) {
                    me.params.onprevious();
                }
                return;
            }
            stop = me.utterances.filter(utterances => utterances.index == me.currentIndex).length;
            me.replay();
        } while (!stop);
    };
    me.fastforward = function () {
        var stop = false;
        do {
            me.currentIndex++;
            if (me.currentIndex >= me.totalParts) {
                me.currentIndex = me.totalParts - 1;
                me.synth.cancel();
                if (me.params) {
                    me.params.onnext();
                }
                return;
            }
            stop = me.utterances.filter(utterances => utterances.index == me.currentIndex).length;
            me.replay();
        } while (!stop);
    };
    me.stop = function () {
        me.synth.cancel();
        me.queueIndex = 0;
    };
    me.voices = function (language) {
        var voices = me.synth.getVoices();
        if (language) {
            language = language.toLowerCase();
            if (!voices) {
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
        text = text.replace(/[,] too/g, " too");
        var items = text.match(/-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?/g);
        text = text.replace(/[,]/g, "\n");
        if (items) {
            items.map(item => {
                text = text.replace(item.replace(",", "\n"), item);
            });
        }
        text = text.replace(/No\./g, "No");
        text = text.replace(/^(\d+\))/g, "\n$1\n");
        text = text.replace(/\s-\s/g, "\n");
        text = text.replace(/[.:;—]/g, "\n");
        text = text.replace(/'["“”]/g, "\n");
        text = text.replace(/’["“”]/g, "\n");
        text = text.replace(/["”]/g, "\n");
        text = text.replace(/[)\]]/g, ", ");
        text = text.replace(/[“([]/g, ", ");
        text = text.replace(/\s[,]/g, ",");
        text = text.replace(/[,][,]/g, ",");
        text = text.replace(/\n\s\n/g, "\n");
        text = text.replace(/\n\n/g, "\n");
        text = text.replace(/ {2}/g, " ");
        text = text.replace(/\s\n/g, "\n");
        text = text.replace(/\n\s/g, "\n");
        text = text.replace(/…/g, ", ");
        text = text.replace(/\n[?]/g, "?\n");
        text = text.replace(/[,'"]$/, "");
        text = text.split("\n").map(item => {
            var original = null;
            var index = 0;
            do {
                original = item;
                if (item.length > 50 && item.length - item.lastIndexOf("\n") > 50) {
                    switch (index) {
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
            } while (original !== item);
            return item;
        }).join("\n");
        text = text.split("\n").map(item => {
            if (item.split(" ").length >= 20) {
                me.log("long text: " + item);
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
