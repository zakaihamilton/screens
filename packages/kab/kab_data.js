/*
 @author Zakai Hamilton
 @component KabData
 */

package.kab.data = function KabData(me) {
    me.init = function() {
        me.files = {};
    };
    me.load = function (callback, language) {
        language = language.toLowerCase();
        if (me.files[language]) {
            var json = me.files[language];
            if (callback) {
                callback(json);
            }
        } else {
            me.core.json.loadFile(function (json) {
                if (json) {
                    me.files[language] = json;
                    if(json) {
                        json.language = language;
                    }
                    if (callback) {
                        callback(json);
                    }
                }
            }, "/packages/res/terms/" + language + ".json");
        }
    };
};
