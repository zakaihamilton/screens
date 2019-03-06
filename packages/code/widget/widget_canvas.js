/*
 @author Zakai Hamilton
 @component WidgetCanvas
 */

screens.widget.canvas = function WidgetCanvas(me, packages) {
    me.element = {
        dependencies: {
            properties: ["mode"]
        },
        properties: {
            "ui.basic.tag": "canvas",
            "dynamicSize": true
        },
        draw: function (object) {
            me.context(object);
        }
    };
    me.mode = {
        get: function (object) {
            return object.contextMode;
        },
        set: function (object, value) {
            object.contextMode = value;
        }
    };
    me.dynamicSize = {
        get: function (object) {
            return object.dynamicSize;
        },
        set: function (object, value) {
            object.dynamicSize = value;
        }
    };
    me.context = function (object) {
        var contextMode = object.contextMode || "2d";
        var context = object.getContext(contextMode);
        if (object.dynamicSize) {
            if (context.canvas.width !== window.innerWidth) {
                context.canvas.width = window.innerWidth;
            }
            if (context.canvas.height !== window.innerHeight) {
                context.canvas.height = window.innerHeight;
            }
        }
        return context;
    };
    me.clear = function (object) {
        var context = me.context(object);
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, object.width, object.height);
        context.restore();
    };
    me.stroke = function (object, params) {
        if (!params || !params.start || !params.end) {
            return;
        }
        var context = me.context(object);
        context.moveTo(params.start.x, params.start.y);
        context.lineTo(params.end.x, params.end.y);
        context.stroke();
    };
    me.fillText = function (object, params) {
        if (!params) {
            return;
        }
        var context = me.context(object);
        context.font = params.font;
        context.fillText(params.text, params.pos.x, params.pos.y);
    };
    me.fillRect = function (object, params) {
        if (!params) {
            return;
        }
        var context = me.context(object);
        context.fillStyle = params.fillStyle;
        context.fillRect(params.pos.x, params.pos.y, params.size.width, params.size.height);
    };
    me.circle = function (object, params) {
        if (!params) {
            return;
        }
        var context = me.context(object);
        context.beginPath();
        context.arc(params.center.x, params.center.y, params.radius, 0, 2 * Math.PI);
        context.stroke();
    };
};
