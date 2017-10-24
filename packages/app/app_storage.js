/*
 @author Zakai Hamilton
 @component AppStorage
 */

package.app.storage = function AppStorage(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function(object) {
            me.set(me.singleton.var.tree, "clear");
            me.storage.remote.getChildren(function(root) {
                me.set(me.singleton.var.tree, "ui.group.data", {
                    "ui.data.keyList": ["ui.basic.text", "ui.data.items"],
                    "ui.data.default": {
                        "state": false
                    },
                    "ui.data.values" : me.collectItems(root)
                });
            }, "/Kab/concepts", true);            
        }
    };
    me.collectItems = function(root) {
        var items = [];
        for(var entry of root) {
            var item = [];
            item.push(entry.name);
            if(entry.entries) {
                item.push(me.collectItems(entry.entries));
            }
            items.push(item);
        }
        return items;
    };
};
