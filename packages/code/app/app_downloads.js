/*
 @author Zakai Hamilton
 @component AppDownloads
 */

package.app.downloads = function AppDownloads(me) {
    me.launch = function (args) {
        me.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function(object) {
            var window = me.widget.window.window(object);
            me.manager.download.items(function(items) {
                var widgets = [];
                for(var item of items) {
                    widgets.push({
                        "ui.property.style":{
                            "left":"0px",
                            "top":"0px",
                            "right":"0px",
                            "height":"80px"
                        },
                        "group":"download",
                        "ui.basic.text":"",
                        "ui.basic.elements":[
                            {
                                "ui.basic.tag": "div",
                                "ui.property.style":{
                                    "position":"relative",
                                    "left":"0px",
                                    "top":"5px",
                                    "right":"0px",
                                    "height":"20px",
                                    "border":"1px solid lightgray"
                                },
                                "ui.basic.text":item.from
                            },
                            {
                                "ui.basic.tag": "div",
                                "ui.property.style":{
                                    "position":"relative",
                                    "left":"0px",
                                    "top":"5px",
                                    "right":"0px",
                                    "height":"20px",
                                    "border":"1px solid lightgray"
                                },
                                "ui.basic.text":item.to
                            },
                            {
                                "ui.basic.tag": "div",
                                "ui.property.style":{
                                    "position":"relative",
                                    "left":"0px",
                                    "top":"5px",
                                    "right":"0px",
                                    "height":"20px",
                                    "border":"1px solid lightgray"
                                },
                                "ui.basic.text":item.isDownloading?"Downloading":""
                            }
                        ]
                    });
                }
                me.core.property.set(window.var.list, "ui.basic.elements", widgets);
            });
        }
    };
    me.clearall = {
        set: function(object) {
            var window = me.widget.window.window(object);
            me.manager.download.removeall(function() {
                me.core.property.notify(window, "app.downloads.refresh");
            });
        }
    };
};
