/*
 @author Zakai Hamilton
 @component UIShared
 */

screens.ui.shared = function UIShared(me, { db, widget }) {
    me.shared = {
        init: function () {
            me.shared.userList = null;
        },
        userMenuList: function (object) {
            var info = {
                list: me.shared.userList,
                property: "name",
                options: { "state": "select" },
                group: "users",
                sort: true,
                itemMethod: me.id + ".userName",
                emptyMsg: "No Users"
            };
            return widget.menu.collect(object, info);
        },
        isThisDevice: function (object) {
            var window = widget.window.get(object);
            return window.options.userName === "";
        },
        update: function (content) {
            var sharedApp = me.id.split(".").pop();
            var date = new Date();
            if (content) {
                let json = false;
                if (typeof content !== "string") {
                    content = JSON.stringify(content);
                    json = true;
                }
                var data = {
                    user: "$userId",
                    name: "$userName",
                    content: content,
                    json: json,
                    date: date.toString()
                };
                db.shared[sharedApp].use({
                    "user": "$userId"
                }, data);
            }
            else {
                db.shared[sharedApp].remove({
                    user: "$userId"
                });
            }
            me.shared.userList = db.shared[sharedApp].list();
        },
        refresh: function () {
            var sharedApp = me.id.split(".").pop();
            me.shared.userList = db.shared[sharedApp].list();
        },
        content: async function (object) {
            var window = widget.window.get(object);
            var userName = window.options.userName.toLowerCase();
            var content = undefined;
            var userList = await me.shared.userList;
            if (userName && userList) {
                var user = userList.find((item) => item.name.toLowerCase() === userName);
                if (user) {
                    content = user.content;
                    if (user.json) {
                        content = JSON.parse(content);
                    }
                }
            }
            return content;
        }
    };
    return me.shared;
};
