/*
 @author Zakai Hamilton
 @component LibDictionary
 */

screens.lib.dictionary = function LibDictionary(me, packages) {
    const { core, db } = packages;
    me.definition = async function (name) {
        var cache = await db.cache.dictionary.find({ name });
        if (cache) {
            return cache.definition;
        }
        var definition = await me.send(name);
        await db.cache.dictionary.use({ name }, { name, definition });
        return definition;
    };
    me.send = async function (text) {
        var sources = {
            google: "https://googledictionaryapi.eu-gb.mybluemix.net/?define=${text}"
        };
        var promises = [];
        for (let name in sources) {
            let url = sources[name].replace(/\${text}/g, text);
            let promise = core.json.get(url);
            promises.push(promise);
        }
        var names = Object.keys(sources);
        var values = await Promise.all(promises);
        var result = {};
        values.map((value, index) => {
            let name = names[index];
            if (value) {
                result[name] = value;
            }
        });
        return result;
    };
    return "server";
};