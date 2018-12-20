/*
 @author Zakai Hamilton
 @component UISpeech
 */

screens.ui.speech = function UISpeech(me) {
    me.start = function (object, options = null) {
        var recognition = null;
        if ("webkitSpeechRecognition" in window) {
            recognition = new window.webkitSpeechRecognition();
        }
        else if ("SpeechRecognition" in window) {
            recognition = new window.SpeechRecognition();
        }
        else {
            return false;
        }
        object.speechRecognition = recognition;
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.onresult = function (event) {
            var last = event.results.length - 1;
            if (last) {
                var text = event.results[last][0].transcript;
                me.core.property.set(object, "insertText", text);
            }
        };
        recognition.onend = function (event) {
            me.start(object, options);
        };
        if (options) {
            options = Object.assign(recognition, options);
        }
        recognition.start();
        return true;
    };
    me.working = function (object) {
        return object.speechRecognition != null;
    };
    me.stop = function (object) {
        if (object.speechRecognition) {
            object.speechRecognition.stop();
            object.speechRecognition = null;
        }
    };
    me.toggle = function (object) {
        var result = false;
        if (object.speechRecognition) {
            me.stop(object);
        }
        else {
            result = me.start(object);
        }
        return result;
    };
    return "browser";
};
