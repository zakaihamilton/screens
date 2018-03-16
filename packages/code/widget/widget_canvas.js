/*
 @author Zakai Hamilton
 @component WidgetCanvas
 */

package.widget.button = function WidgetButton(me) {
    me["ui.element.depends"] = {
        properties:["mode"]
    };
    me["ui.element.default"] = {
        "ui.basic.tag":"canvas",
        "dynamicSize":true
    };
    me.mode = {
        get: function(object) {
            return object.contextMode;
        },
        set: function(object, value) {
            object.contextMode = value;
        }
    };
    me.dynamicSize = {
        get: function(object) {
            return object.dynamicSize;
        },
        set: function(object, value) {
            object.dynamicSize = value;
        }
    };
    me.draw = function(object) {
        me.context(object);
    };
    me.context = function(object) {
        var contextMode = object.contextMode || "2d";
        var context = object.getContext(contextMode);
        if(object.dynamicSize) {
            if(context.canvas.width !== window.innerWidth) {
                context.canvas.width  = window.innerWidth;
            }
            if(context.canvas.height !== window.innerHeight) {
                context.canvas.height = window.innerHeight;
            }
        }
        return context;
    };
    me.stroke = function(object, params) {
        if(!params || !params.start || !params.end) {
            return;
        }
        var context = me.context(object);
        context.moveTo(params.start.x,params.start.y);
        context.lineTo(params.end.x,params.end.y);
        context.stroke();
    };
    me.fillText = function(object, params) {
        if(!params) {
            return;
        }
        var context = me.context(object);
        context.font = params.font;
        context.fillText(params.text,params.pos.x,params.pos.y);        
    };
};
