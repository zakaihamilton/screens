/*
 @author Zakai Hamilton
 @component ManagerContent
 */

screens.manager.content = function ManagerContent(me) {
    me._list = {};
    me.lists = async function (componentId, userId) {
        var publicList = await me.manager.content.list(componentId, false, userId);
        var privateList = await me.manager.content.list(componentId, true, userId);
        return { publicList, privateList };
    };
    me.list = async function (componentId, private, userId) {
        var kind = componentId + ".content";
        if (private) {
            if (!userId) {
                userId = this.userId;
            }
            kind += "." + userId;
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
    me.associated = async function (title, userId) {
        if (!userId) {
            userId = this.userId;
        }
        let apps = await me.user.access.appList(userId);
        let results = await Promise.all([false, true].map(async private => {
            let result = {};
            for (let app of apps) {
                var list = await me.list("app." + app, private, userId);
                for (let item of list) {
                    if (title && item.title !== title) {
                        continue;
                    }
                    var titles = result[app];
                    if (!titles) {
                        titles = result[app] = [];
                    }
                    titles.push(item.title);
                }
            }
            return result;
        }));
        return results;
    };
    me.exists = async function (componentId, title, private, userId) {
        var kind = componentId + ".content";
        if (private) {
            kind += "." + userId ? userId : this.userId;
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
        var info = me.load(componentId, title, private);
        if (!info.locked || info.owner === this.userId || me.user.access.admin(this.userName)) {
            await me.storage.data.save(data, kind, title, ["content"]);
            result = true;
        }
        return result;
    };
    me.delete = async function (componentId, title, private) {
        var result = false;
        var kind = componentId + ".content";
        if (private) {
            kind += "." + this.userId;
        }
        var info = me.load(componentId, title, private);
        if (!info.locked || info.owner === this.userId || me.user.access.admin(this.userName)) {
            await me.storage.data.delete(kind, title);
            result = true;
        }
        return result;
    };
    return "server";
};