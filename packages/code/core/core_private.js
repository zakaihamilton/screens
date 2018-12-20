/*
    @author Zakai Hamilton
    @component CorePrivate
*/

screens.core.private = function CorePrivate(me) {
    me.keys = async function (name) {
        var data = await me.core.file.readFile("private/" + name + ".json", 'utf8');
        var json = {};
        if (data) {
            json = JSON.parse(data);
        }
        return json;
    };
    me.path = function (name) {
        return "private/" + name + ".json";
    };
    return "server";
};
