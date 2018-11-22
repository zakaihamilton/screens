/*
 @author Zakai Hamilton
 @component MediaSpeech
 */

screens.media.speech = function MediaSpeech(me) {
    me.init = function () {
        me.gspeech = require("gspeech-api");
    };
    me.recognize = function (path) {
        return new Promise((resolve, error) => {
            me.gspeech.recognize(path, function (err, data) {
                if (err) {
                    error(err);
                }
                else {
                    resolve(data.transcript);
                }
            });
        });
    };
    return "server";
};
