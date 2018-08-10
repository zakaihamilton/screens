/*
 @author Zakai Hamilton
 @component UserAccess
 */

screens.user.access = function UserAccess(me) {
    me.init = function() {
        me.core.property.link("core.socket.access", "user.access.access", true);
    };
    me.access = async function (info) {
        me.log("info: " + info.userId + " - " + info.userName);
        if (me.platform === "server" && (!info.platform || info.platform !== "service") && info.args) {
            var method = info.args[0];
            me.log("Checking: " + method + " userId: " + info.userId);
            var result = await me.isAllowed(method, info.userId);
            if(!result) {
                throw " User " + info.userName + " is not authorised to use method: " + method;
            }
        }
    };
    me.get = async function(user) {
        if(!user) {
            user = this.userId;
        }
        return await me.storage.data.load(me.id, user);
    };
    me.set = async function(access, user) {
        if(!user) {
            user = this.userId;
        }
        await me.storage.data.save(access, me.id, user);
    };
    me.checkAccessList = function(list, path) {
        var result = false;
        if(path && list) {
            if(list.includes(path)) {
                result = true;
            }
            else {
                var accessTokens = path.split(".");
                var accessPath = "";
                for(var accessToken of accessTokens) {
                    if(accessPath) {
                        accessPath += ".";
                    }
                    accessPath += accessToken;
                    if(list.includes(accessPath)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    };
    me.isAllowed = async function(path, user) {
        var access = await me.get(user);
        var result = false;
        me.log("Checking if " + path + " allowed on user: " + user);
        if(access) {
            result = me.checkAccessList(access.paths, path);
        }
        if(!result && me.accessList) {
            result = me.checkAccessList(me.accessList, path);
        }
        return result;
    };
    return "server";
};
