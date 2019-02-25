/*
 @author Zakai Hamilton
 @component ManagerContent
 */

screens.manager.content = function ManagerContent(me) {
    me.cache = {};
    me.lists = async function (userId) {
        if (!userId) {
            userId = this.userId;
        }
        var project = { title: 1, package: 1, component: 1 };
        var publicList = await me.db.shared.content.list({ private: null }, { project });
        var privateList = await me.db.shared.content.list({ private: userId }, { project });
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
        let lists = await me.lists(userId);
        let apps = await me.user.access.appList(userId);
        for (let listName in lists) {
            let list = lists[listName];
            let filter = item => item.package === "app" && apps.includes(item.component);
            list = list.filter(filter);
            let results = {};
            for (let item of list) {
                if (title && item.title !== title) {
                    continue;
                }
                var titles = results[item.component];
                if (!titles) {
                    titles = results[item.component] = [];
                }
                titles.push(item.title);
            }
            lists[listName] = results;
        }
        return lists;
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
            data.private = userId;
        }
        data = Object.assign({}, data);
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