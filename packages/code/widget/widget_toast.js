/*
 @author Zakai Hamilton
 @component WidgetToast
 */

screens.widget.toast = function WidgetToast(me) {
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
        var toast = document.body.var.desktop.var.toast;
        if (me.currentType === type) {
            me.core.property.set(toast, "ui.basic.text", message);
            me.restartTimer();
        }
        else if (Object.keys(me.messages).length) {
            me.messages[type] = message;
        }
        else {
            me.core.property.set(toast, "ui.basic.text", message);
            me.core.property.set(toast, "ui.class.show", true);
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
            me.core.property.set(toast, "ui.basic.text", message);
            me.restartTimer();
        }
        else {
            me.core.property.set(toast, "ui.class.show", false);
            me.currentType = null;
        }
    };
};