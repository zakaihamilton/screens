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
                    "ui.data.keyList": ["ui.basic.text", "ui.basic.metadata", "ui.data.items"],
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
            item.push({
                path:entry.path_lower
            });
            if(entry.entries) {
                item.push(me.collectItems(entry.entries));
            }
            items.push(item);
        }
        return items;
    };
    me.info = {
        set: function(object) {
            var selection = me.get(me.singleton.var.tree, "selection");
            var metadata = me.get(selection, "ui.basic.metadata");
            me.storage.remote.metadata(function(data) {
                metadata.data = data;
                me.core.app.launch(null, "info", [me.get(selection, "ui.basic.text"), metadata]);
            }, metadata.path);
        }
    };
    me.download = {
        set: function(object) {
            var selection = me.get(me.singleton.var.tree, "selection");
            var metadata = me.get(selection, "ui.basic.metadata");
            me.storage.remote.downloadData(function(data) {
                metadata.data = data;
                alert(JSON.stringify(metadata));
            }, metadata.path);
        }
    };
};
