/*
 @author Zakai Hamilton
 @component AppStorage
 */

package.app.storage = function AppStorage(me) {
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.package.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function(object) {
            me.package.core.property.set(me.singleton.var.tree, "clear");
            me.package.storage.remote.getChildren(function(root) {
                me.package.core.property.set(me.singleton.var.tree, "ui.group.data", {
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
            var selection = me.package.core.property.get(me.singleton.var.tree, "selection");
            var metadata = me.package.core.property.get(selection, "ui.basic.metadata");
            me.package.storage.remote.metadata(function(data) {
                metadata.data = data;
                me.package.core.app.launch(null, "info", [me.package.core.property.get(selection, "ui.basic.text"), metadata]);
            }, metadata.path);
        }
    };
    me.download = {
        set: function(object) {
            var selection = me.package.core.property.get(me.singleton.var.tree, "selection");
            var metadata = me.package.core.property.get(selection, "ui.basic.metadata");
            me.package.storage.remote.downloadData(function(data) {
                metadata.data = data;
                alert(JSON.stringify(metadata));
            }, metadata.path);
        }
    };
};
