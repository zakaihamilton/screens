/*
 @author Zakai Hamilton
 @component AppStorage
 */

screens.app.storage = function AppStorage(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        return me.singleton;
    };
    me.refresh = {
        set: async function(object) {
            me.core.property.set(me.singleton.var.tree, "clear");
            var root = await me.storage.file.getChildren("/Kab/concepts", true);
            me.core.property.set(me.singleton.var.tree, "ui.group.data", {
                "ui.data.keyList": ["ui.basic.text", "ui.basic.metadata", "ui.data.items"],
                "ui.data.default": {
                    "state": false
                },
                "ui.data.values" : me.collectItems(root)
            });
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
        set: async function(object) {
            var selection = me.core.property.get(me.singleton.var.tree, "selection");
            var metadata = me.core.property.get(selection, "ui.basic.metadata");
            var data = await me.storage.file.metadata(metadata.path);
            metadata.data = data;
            me.core.app("info", me.core.property.get(selection, "ui.basic.text"), metadata);
        }
    };
    me.download = {
        set: function(object) {
            var selection = me.core.property.get(me.singleton.var.tree, "selection");
            var metadata = me.core.property.get(selection, "ui.basic.metadata");
            metadata.data = await me.storage.file.downloadData(metadata.path);
            alert(JSON.stringify(metadata));
        }
    };
};
