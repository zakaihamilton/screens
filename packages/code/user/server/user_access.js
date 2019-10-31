/*
 @author Zakai Hamilton
 @component UserAccess
 */

screens.user.access = function UserAccess(me, { core, storage }) {
    me.init = function () {
        core.property.link("core.socket.access", "user.access.access", true);
    };
    me.access = async function (info) {
        if (me.platform === "server" && (!info.platform || info.platform !== "service") && info.args) {
            var method = info.args[0];
            if (!info.userId) {
                throw " User " + info.userName + " has no user id to use method: " + method;
            }
            var result = await me.isAPIAllowed(method, info.userId);
            if (!result) {
                throw " User " + info.userName + " is not authorised to use method: " + method;
            }
        }
    };
    me.info = async function () {
        let info = {
            userId: me.userId.apply(this),
            admin: me.admin.apply(this),
            appList: await me.appList.apply(this)
        };
        return info;
    };
    me.userId = function () {
        return this.userId;
    };
    me.admin = function (user) {
        if (!user || typeof user !== "string") {
            user = this.userName;
        }
        var isMatch = screens.admins && screens.admins.includes(user);
        me.log("admin: " + user + " = " + isMatch);
        return isMatch;
    };
    me.get = async function (user) {
        if (!user) {
            user = this.userId;
        }
        if (!me.users) {
            me.users = {};
        }
        var result = me.users[user];
        if (!result) {
            result = me.users[user] = await storage.data.load(me.id, user);
        }
        return result;
    };
    me.set = async function (access, user) {
        if (!user) {
            user = this.userId;
        }
        if (!me.users) {
            me.users = {};
        }
        me.users[user] = access;
        await storage.data.save(access, me.id, user);
    };
    me.checkAccessList = function (list, path) {
        var result = false;
        if (path && list) {
            if (list.includes(path)) {
                result = true;
            }
            else {
                var accessTokens = path.split(".");
                var accessPath = "";
                for (var accessToken of accessTokens) {
                    if (accessPath) {
                        accessPath += ".";
                    }
                    accessPath += accessToken;
                    if (list.includes(accessPath)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    };
    me.isAPIAllowed = async function (path, user) {
        if (!user) {
            user = this.userId;
        }
        var access = await me.get(user);
        var result = false;
        var userName = user;
        if (access) {
            result = me.checkAccessList(access.api, path);
            userName = access.name;
        }
        if (!result && screens.api) {
            result = me.checkAccessList(screens.api, path);
        }
        if (!result) {
            me.log("api " + path + " denied on user: " + userName);
        }
        return result;
    };
    me.appList = async function (user) {
        var list = [];
        if (!user) {
            user = this.userId;
        }
        var access = await me.get(user);
        if (access) {
            list.push(...access.apps);
        }
        if (screens.api) {
            list.push(...screens.apps);
        }
        list = Array.from(new Set(list));
        return list;
    };
    return "server";
};
