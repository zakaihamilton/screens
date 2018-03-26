/*
 @author Zakai Hamilton
 @component ContentText
 */

package.content.text = function ContentText(me) {
    me.object = function(object) {
        var window = me.widget.window.mainWindow(object);
        if(window) {
            object = window;
        }
        return object;
    };
    me.name = {
        get: function(object) {
            var window = me.object(object);
            return window.contentTextName;
        },
        set: function(object, value) {
            var window = me.object(object);
            window.contentTextName = value;
        }
    };
    me.title = {
        get: function(object) {
            var window = me.object(object);
            return window.contentTextTitle;
        },
        set: function(object, value) {
            var window = me.object(object);
            window.contentTextTitle = value;
        }
    };
    me.field = {
        get: function(object) {
            var window = me.object(object);
            return window.contentTextField;
        },
        set: function(object, value) {
            var window = me.object(object);
            window.contentTextField = value;
        }
    };
    me.data = {
        get: function(object) {
            var window = me.object(object);
            return window.contentText;
        },
        set: function(object, value) {
            var window = me.object(object);
            window.contentText = value;
        }
    };
    me.list = {
        get: function(object) {
            var window = me.object(object);
            return window.contentTextList;
        }
    };
    me.refresh = {
        set: function (object) {
            var window = me.object(object);
            if(window.contentTextName) {
                me.storage.data.query((err, items) => {
                    me.error(err);
                    window.contentTextList = items;
                }, window.contentTextName);
            }
        }
    };
    me.menuList = {
        get: function (object) {
            var window = me.object(object);
            var dataList = window.contentTextList;
            if (!dataList) {
                dataList = [];
            }
            var items = dataList.map(function (item) {
                var fieldData = me.core.string.decode(item[window.contentTextField]);
                var result = [
                    item.title,
                    function () {
                        window.contentText = fieldData;
                        window.contentTextTitle = item.title;
                        me.core.property.notify(window, "data.content.update");
                    },
                    {
                        "state": function () {
                            return window.contentText === fieldData;
                        }
                    }
                ];
                return result;
            });
            return items;
        }
    };
    me.save = {
        get: function (object) {
            var window = me.object(object);
            return window.contentText;
        },
        set: function (object) {
            var window = me.object(object);
            var date = new Date();
            var title = window.contentTextTitle;
            if(!title) {
                title = date.toLocaleDateString();
            }
            var data = {
                date: date.toString(),
                title: title
            };
            data[window.contentTextField] = me.core.string.encode(window.contentText);
            me.storage.data.save(err => {
                if (err) {
                    me.error("Cannot save data: " + err.message);
                } else {
                    me.refresh.set(window);
                }
            }, data, window.contentTextName, title, [window.contentTextField]);
        }
    };    
};
