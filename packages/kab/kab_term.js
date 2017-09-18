/*
 @author Zakai Hamilton
 @component KabTerm
 */

package.kab.term = function KabTerm(me) {
    me.load = function (callback, language) {
        language = language.toLowerCase();
        if (me.jsons[language]) {
            var json = me.jsons[language];
            if (callback) {
                callback(json);
            }
        } else {
            me.core.json.loadFile(function (json) {
                if (json) {
                    me.jsons[language] = json;
                    if (callback) {
                        callback(json);
                    }
                }
            }, "/packages/res/terms/" + language + ".json");
        }
    };    
};
