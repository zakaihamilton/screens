/*
 @author Zakai Hamilton
 @component KabData
 */

screens.kab.data = function KabData(me) {
    me.init = function () {
        me.files = {};
    };
    me.reload = async function (language) {
        language = language.toLowerCase();
        var json = await me.core.json.loadFile("/packages/res/terms/" + language + ".json", false);
        if (json) {
            me.files[language] = json;
            if (json) {
                json.language = language;
            }
            return json;
        }
    };
    me.load = async function (language, reload = false) {
        language = language.toLowerCase();
        if (!reload && me.files[language]) {
            var json = me.files[language];
            return json;
        } else {
            return await me.reload(language);
        }
    };
    return "client";
};
