/*
 @author Zakai Hamilton
 @component LibDictionary
 */

screens.lib.dictionary = function LibDictionary(me) {
    me.init = async function () {
        me.request = require("request");
    };
    me.definition = async function (name) {
        var cache = await me.db.cache.dictionary.find({ name });
        if (cache) {
            return cache.definition;
        }
        var definition = await me.send("?define=" + name);
        await me.db.cache.dictionary.use({ name }, { name, definition });
        return definition;
    };
    me.send = async function (url) {
        var info = {
            url: "https://googledictionaryapi.eu-gb.mybluemix.net/" + url
        };
        return new Promise((resolve, reject) => {
            me.request.get(info, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (body[0] === "<") {
                        resolve({});
                        return;
                    }
                    let json = JSON.parse(body);
                    resolve(json);
                }
            });
        });
    };
    return "server";
};