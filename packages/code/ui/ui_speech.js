/*
 @author Zakai Hamilton
 @component UISpeech
 */

screens.ui.speech = function UISpeech(me) {
    me.start = function (object) {
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
        recognition.continuous = true;
        recognition.onresult = function (event) {
            var text = event.results[event.results.length - 1][0].transcript;
            me.core.property.set(object, "insertText", text);
        };
        recognition.start();
        object.speechRecognition = recognition;
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
