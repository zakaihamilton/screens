/*
 @author Zakai Hamilton
 @component ManagerContent
 */

screens.manager.content = function ManagerContent(me) {
    me.cache = {};
    me.lists = async function (componentId, userId) {
        if (!userId) {
            userId = this.userId;
        }
        var publicList = await me.manager.content.list(componentId, false, userId);
        var privateList = await me.manager.content.list(componentId, true, userId);
        return { publicList, privateList };
    };
    me.reset = function () {
        me.cache = {};
    };
    me.list = async function (componentId, private, userId) {
        if (!userId) {
            userId = this.userId;
        }
        var [package, component] = componentId.split(".");
        var query = { package, component, private: null };
        if (private) {
            query.private = userId;
        }
        var result = await me.db.shared.content.list(query);
        return result;
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
        if (!userId) {
            userId = this.userId;
        }
        var [package, component] = componentId.split(".");
        var query = { package, component, title, private: null };
        if (private) {
            query.private = userId;
        }
        var result = await me.db.shared.content.find(query);
        return result ? true : false;
    };
    me.load = async function (componentId, title, private, userId) {
        if (!userId) {
            userId = this.userId;
        }
        var [package, component] = componentId.split(".");
        var query = { package, component, title, private: null };
        if (private) {
            query.private = userId;
        }
        var result = await me.db.shared.content.find(query);
        result = Object.assign({}, result);
        if (result) {
            result.content = me.core.string.decode(result.content);
        }
        return result;
    };
    me.save = async function (componentId, title, data, private, userId, userName) {
        if (!userId) {
            userId = this.userId;
        }
        if (!userName) {
            userName = this.userName;
        }
        var [package, component] = componentId.split(".");
        var query = { package, component, title, private: null };
        if (private) {
            query.private = userId;
        }
        data = Object.assign({}, data);
        data.content = me.core.string.encode(data.content);
        var info = await me.load(componentId, title, private, userId);
        var result = false;
        if (!info || !info.locked || info.owner === userId || me.user.access.admin(userName)) {
            result = await me.db.shared.content.use(query, data);
        }
        return result;
    };
    me.delete = async function (componentId, title, private, userId, userName) {
        if (!userId) {
            userId = this.userId;
        }
        if (!userName) {
            userName = this.userName;
        }
        var [package, component] = componentId.split(".");
        var query = { package, component, title, private: null };
        if (private) {
            query.private = userId;
        }
        var info = await me.load(componentId, title, private, userId);
        var result = false;
        if (info) {
            if (!info.locked || info.owner === userId || me.user.access.admin(userName)) {
                result = await me.db.shared.content.remove(query);
            }
        }
        return result;

    };
    return "server";
};