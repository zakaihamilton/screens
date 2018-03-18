/*
 @author Zakai Hamilton
 @component AppInfo
 */

package.app.info = function AppInfo(me) {
    me.launch = function (args) {
        var json = {title:args[0],"ui.var.data":args[1]};
        Object.assign(json, __json__);
        return me.ui.element(json, "workspace", "self");
    };
    me.data = {
        get: function(object, value) {
            return me.collectItems(value);
        }
    };
    me.collectItems = function(root) {
        var items = [];
        if(Array.isArray(root)) {
            var length = root.length;
            for (var index = 0; index < length; index++) {
                var item = [];
                var element = root[index];
                item.push(index);
                item.push(me.collectItems(element));
                items.push(item);
            }
        }
        else if(typeof root === "object") {
            for(var key in root) {
                var item = [];
                var value = root[key];
                item.push(key);
                item.push(me.collectItems(value));
                items.push(item);
            }
        }
        else {
            items.push([root,[["Type: " + typeof root]]]);
        }
        return items;
    };
};
