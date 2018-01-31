/*
 @author Zakai Hamilton
 @component AppPackets
 */

package.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.manager.packet.items(function (items) {
                var widgets = [];
                for (var item of items) {
                    var fields = [
                        {
                            "ui.basic.tag": "div",
                            "ui.property.style": {
                                "position": "relative",
                                "left": "0px",
                                "top": "5px",
                                "right": "0px",
                                "height": "20px",
                            },
                            "ui.basic.text": "Service: " + item.service
                        }
                    ];
                    if(item.packet) {
                        var callback = (name, value) => {
                            fields.push({
                                "ui.basic.tag": "div",
                                "ui.property.style": {
                                    "position": "relative",
                                    "left": "0px",
                                    "top": "5px",
                                    "right": "0px",
                                    "height": "20px"
                                },
                                "ui.basic.text": name + ": " + value
                            });
                        };
                        function breakdown(prefix, item) {
                            if(Array.isArray(item)) {
                                item.map((subItem) => {
                                    breakdown(prefix, subItem);
                                });
                            }
                            for(var key in item) {
                                var value = item[key];
                                if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                    if(prefix) {
                                        callback(prefix + "-" + key, value);
                                    }
                                    else {
                                        callback(key, value);
                                    }
                                }
                                else if(key === "addr" || key === "flags" || key === "options") {
                                    callback(prefix + "-" + key, JSON.stringify(value));
                                }
                                else if(prefix) {
                                    breakdown(prefix + "-" + key, value);
                                }
                                else {
                                    breakdown(key, value);
                                }
                            }
                        };
                        breakdown("", item.packet);
                    }
                    widgets.push({
                        "ui.property.style": {
                            "left": "0px",
                            "top": "0px",
                            "right": "0px",
                            "min-height": "80px"
                        },
                        "group": "packet",
                        "ui.basic.text": "",
                        "ui.basic.elements": fields

                    });
                }
                me.core.property.set(window.var.list, "ui.basic.elements", widgets);
            });
        }
    };
    me.clearall = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.manager.packet.removeall(function () {
                me.core.property.notify(window, "app.packets.refresh");
            });
        }
    };
};
