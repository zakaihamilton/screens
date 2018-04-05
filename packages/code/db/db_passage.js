/*
 @author Zakai Hamilton
 @component DbPassage
 */

screens.db.passage = function DbPassage(me) {
    me.init = async function() {
        me.model = await me.storage.db.createModel("library");
        me.proxy.apply = me.create;
    };
    me.create = async function(data) {
        var item = new me.model(data);
        await item.save();
    };
    me.get = function(item, field) {
        return item.get(field);
    };
    me.set = function(item, value, key) {
        if(key) {
            if(value) {
                item.set(value, key);
            }
            else {
                item.unset(key);
            }
        }
        else {
            item.set(value);
        }
    };
    me.save = function(item) {
        item.save();
    }
    me.remove = function(item) {
        item.remove();
    }
};
