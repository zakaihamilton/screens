/*
 @author Zakai Hamilton
 @component StorageFile
 */

package.storage.file = function StorageFile(me) {
    me.splitPath = function(path) {
        return [].concat.apply([], path.split('"').map(function(v,i){
           return i%2 ? v : v.split('/');
        })).filter(Boolean);
    };
    me.init = function() {
        var local = me.storage.cache.local;
        me.root = me.get(local, "storage-file-root");
        if(!me.root) {
            me.root = __json__;
        }
    };
    me.lookup = function(path) {
        if(!path || !path.startsWith("/")) {
            return undefined;
        }
        var fragments = me.splitPath(path);
        var item = me.root;
        for (var fragmentIndex = 0; fragmentIndex < fragments.length; fragmentIndex++) {
            item = me.traverse(item, fragments[fragmentIndex]);
            if (!item) {
                return null;
            }
        }
        if(item) {
            item.items = function() {
                return me.items(item);
            };
        }
        return item;
    };
    me.items = function(object) {
        var items = object.members.map(function(member) {
            var item = {
                "text": member.name,
                "ui.basic.src": "/packages/res/icons/default.png",
                "app.progman.args": member.name,
                "ui.touch.dblclick": "app.progman.shell"
            };
            return item;
        });
        return items;
    };
    me.members = function(object) {
        var members = object.members;
        if(Array.isArray(members)) {
            return members;
        }
        if(typeof members === "string") {
            return me.send(members, object);
        }
        if(typeof members === "callback") {
            return members(object);
        }
        return [];
    };
    me.traverse = function(object, name) {
        var members = me.members(object);
        for(var memberIdx = 0; memberIdx < members.length; memberIdx++) {
            var child = members[memberIdx];
            if(child.name === name) {
                return child;
            }
        }
        return null;
    };
};
