/*
    @author Zakai Hamilton
    @component CorePrivate
*/

screens.core.private = function CorePrivate(me, packages) {
    const { core } = packages;
    me.keys = async function (name) {
        let path = me.path(name);
        var data = await core.file.readFile(path, "utf8");
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
