/*
 @author Zakai Hamilton
 @component StorageFile
 */

package.storage.file = function StorageFile(me) {
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
        var fragments = path.split("/");
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
