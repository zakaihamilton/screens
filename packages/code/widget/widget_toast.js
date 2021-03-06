/*
 @author Zakai Hamilton
 @component WidgetToast
 */

screens.widget.toast = function WidgetToast(me, { core }) {
    me.timeout = 3000;
    me.messages = {};
    me.currentType = null;
    me.timer = null;
    me.element = {
        properties: {
            "ui.class.class": "container"
        }
    };
    me.show = function (type, message) {
        if (typeof type !== "string") {
            type = type.id;
        }
        if (!document.body.var || !document.body.var.desktop || !document.body.var.desktop.var) {
            return;
        }
        var toast = document.body.var.desktop.var.toast;
        if (me.currentType === type) {
            if (message) {
                core.property.set(toast, "ui.basic.html", message);
                me.restartTimer();
            }
            else {
                me.showNextMessage();
            }
        }
        else if (Object.keys(me.messages).length) {
            if (message) {
                me.messages[type] = message;
            }
            else {
                delete me.messages[type];
            }
        }
        else if (message) {
            core.property.set(toast, "ui.basic.html", message);
            core.property.set(toast, "ui.class.show", true);
            me.currentType = type;
            me.restartTimer();
        }
    };
    me.restartTimer = function () {
        if (me.timer) {
            clearTimeout(me.timer);
        }
        me.timer = setTimeout(() => {
            me.timer = null;
            me.showNextMessage();
        }, me.timeout);
    };
    me.showNextMessage = function () {
        var toast = document.body.var.desktop.var.toast;
        var type = Object.keys(me.messages).shift();
        if (type) {
            var message = me.messages[type];
            delete me.messages[type];
            me.currentType = type;
            core.property.set(toast, "ui.basic.html", message);
            me.restartTimer();
        }
        else {
            core.property.set(toast, "ui.class.show", false);
            me.currentType = null;
        }
    };
};
