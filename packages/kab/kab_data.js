/*
 @author Zakai Hamilton
 @component KabData
 */

package.kab.data = function KabData(me) {
    me.init = function() {
        me.files = {};
    };
    me.reload = function(callback, language) {
        language = language.toLowerCase();
        me.the.core.json.loadFile(function (json) {
            if (json) {
                me.files[language] = json;
                if(json) {
                    json.language = language;
                }
                if (callback) {
                    callback(json);
                }
            }
        }, "/packages/res/terms/" + language + ".json", false);
    };
    me.load = function (callback, language, reload=false) {
        language = language.toLowerCase();
        if (!reload && me.files[language]) {
            var json = me.files[language];
            if (callback) {
                callback(json);
            }
        } else {
            me.reload(callback, language);
        }
    };
};
