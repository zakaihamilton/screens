/*
 @author Zakai Hamilton
 @component UserAccess
 */

screens.user.access = function UserAccess(me, packages) {
    const { core } = packages;
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
    me.userId = function () {
        return this.userId;
    };
    me.admin = async function (user) {
        if (!user || typeof user !== "string") {
            user = this.userName;
        }
        var isMatch = me.admins.includes(user);
        me.log("isAdmin: " + user + " = " + isMatch);
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
            result = me.users[user] = await me.storage.data.load(me.id, user);
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
        await me.storage.data.save(access, me.id, user);
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
        if (!result && me.api) {
            result = me.checkAccessList(me.api, path);
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
        if (me.api) {
            list.push(...me.apps);
        }
        list = Array.from(new Set(list));
        return list;
    };
    return "server";
};
