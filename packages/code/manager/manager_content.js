/*
 @author Zakai Hamilton
 @component ManagerContent
 */

screens.manager.content = function ManagerContent(me) {
    me._list = {};
    me.list = async function (componentId, private) {
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        var cache = me._list[kind];
        if (cache) {
            return cache;
        }
        var result = await me.storage.data.query(kind, "title");
        me._list[kind] = result;
        return result;
    };
    me.refresh = function () {
        me._list = {};
    };
    me.exists = async function (componentId, title, private) {
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        var result = await me.storage.data.exists(kind, title);
        return result;
    };
    me.load = async function (componentId, title, private) {
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        var result = await me.storage.data.load(kind, title);
        return result;
    };
    me.save = async function (componentId, title, data, private) {
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        await me.storage.data.save(data, kind, title, ["content"]);
    };
    return "server";
};