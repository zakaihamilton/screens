/*
 @author Zakai Hamilton
 @component UISpeech
 */

screens.ui.speech = function UISpeech(me, { core }) {
    me.start = function (object, options = null) {
        var recognition = null;
        me.stop(object);
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
            if (last !== -1) {
                var text = event.results[last][0].transcript;
                core.property.set(object, "insertText", text);
            }
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
