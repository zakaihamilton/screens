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
        var info = await me.storage.data.load(kind, title);
        if (info) {
            info.content = me.core.string.decode(info.content);
        }
        return info;
    };
    me.save = async function (componentId, title, data, private) {
        var result = false;
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        data.content = me.core.string.encode(data.content);
        var owner = await me.lockedOwner(componentId, title);
        var isLocked = !private && owner;
        if (!isLocked || owner === this.userId || me.user.access.admin(this.userName)) {
            await me.storage.data.save(data, kind, title, ["content"]);
            return result;
        }
        return result;
    };
    me.lockedOwner = async function (componentId, title) {
        var info = me.load(componentId, title);
        var result = null;
        if (info.locked) {
            result = info.owner;
        }
        return result;
    };
    return "server";
};