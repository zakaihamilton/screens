/*
 @author Zakai Hamilton
 @component UIShared
 */

screens.ui.shared = function UIShared(me) {
    me.shared = {
        init: function () {
            me.shared.userList = null;
        },
        userMenuList: function (object) {
            var info = {
                list: me.shared.userList,
                property: "name",
                attributes: { "state": "select" },
                group: "users",
                itemMethod: me.id + ".userName",
                emptyMsg: "No Users"
            };
            return me.widget.menu.collect(object, info);
        },
        isThisDevice: function (object) {
            var window = me.widget.window.get(object);
            return window.options.userName === "";
        },
        update: function (content) {
            var sharedApp = me.id.split(".").pop();
            var date = new Date();
            if (content) {
                var data = {
                    user: "$userId",
                    name: "$userName",
                    content: content,
                    date: date.toString()
                };
                me.db.shared[sharedApp].use({
                    "user": "$userId"
                }, data);
            }
            else {
                me.db.shared[sharedApp].remove({
                    user: "$userId"
                });
            }
            me.shared.userList = me.db.shared[sharedApp].list();
        },
        refresh: function () {
            var sharedApp = me.id.split(".").pop();
            me.shared.userList = me.db.shared[sharedApp].list();
        },
        content: async function (object) {
            var window = me.widget.window.get(object);
            var userName = window.options.userName.toLowerCase();
            var content = undefined;
            var userList = await me.shared.userList;
            if (userName) {
                var user = userList.find((item) => item.name.toLowerCase() === userName);
                if (user) {
                    content = user.content;
                }
            }
            return content;
        }
    };
    return me.shared;
};
