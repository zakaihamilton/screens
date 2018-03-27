/*
    @author Zakai Hamilton
    @component CorePrivate
*/

screens.core.private = function CorePrivate(me) {
    me.keys = function(callback, name) {
        me.core.file.readFile(function(err, data) {
            var json = {};
            if(data) {
                json = JSON.parse(data);
            }
            if(callback) {
                callback(json);
            }
        }, "private/" + name + ".json", 'utf8');
    };
    me.path = function(name) {
        return "private/" + name + ".json";
    };
    return "server";
};
