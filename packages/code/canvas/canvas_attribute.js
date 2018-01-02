/*
    @author Zakai Hamilton
    @component CanvasAttribute
*/

package.canvas.attribute = function CanvasAttribute(me) {
    me.attach = function(object) {
        object.attributes = {};
        object.getAttribute = function(name) {
            me.getAttribute(this, name);
        };
        object.setAttribute = function(name, value) {
            me.setAttribute(this, name, value);
        };
        object.removeAttribute = function(name) {
            me.removeAttribute(this, name);
        };
    };
    me.getAttribute = function(object, name) {
        return object.attributes[name];
    };
    me.setAttribute = function(object, name, value) {
        if(object.attributes[name] !== value) {
            object.attributes[name] = value;
            object.setDirty();
        }
    };
    me.removeAttribute = function(object, name) {
        if(name in object.attributes) {
            delete object.attributes[name];
            object.setDirty();
        }
    };
};
