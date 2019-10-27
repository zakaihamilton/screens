/*
 @author Zakai Hamilton
 @component KabData
 */

screens.kab.data = function KabData(me, { core }) {
    me.init = function () {
        me.files = {};
    };
    me.reload = async function (language) {
        language = language.toLowerCase();
        var json = null;
        if (language && language !== "none") {
            json = await core.json.loadFile("/packages/res/terms/" + language + ".json");
        }
        if (json) {
            me.files[language] = json;
            if (json) {
                json.language = language;
            }
            return json;
        }
    };
    me.terms = async function (language, reload = false) {
        var terms = [];
        var json = await me.load(language, reload);
        if (json && json.term) {
            terms = json.term.map(item => item.term);
        }
        return terms;
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
