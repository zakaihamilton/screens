/*
 @author Zakai Hamilton
 @component AppServices
 */

package.app.services = function AppServices(me) {
    me.launch = function (args) {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function(object) {
            var window = me.widget.window(object);
            me.manager.service.items(function(items) {
                var widgets = [];
                for(var item of items) {
                    widgets.push({
                        "ui.property.style":{
                            "left":"0px",
                            "top":"0px",
                            "right":"0px",
                            "height":"80px"
                        },
                        "group":"service",
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
                                },
                                "ui.basic.text":"Name: " + item.name
                            },
                            {
                                "ui.basic.tag": "div",
                                "ui.property.style":{
                                    "position":"relative",
                                    "left":"0px",
                                    "top":"5px",
                                    "right":"0px",
                                    "height":"20px",
                                },
                                "ui.basic.text":"Ref: " + item.ref
                            }
                        ]
                    });
                }
                me.core.property.set(window.var.list, "ui.basic.elements", widgets);
            });
        }
    };
};
