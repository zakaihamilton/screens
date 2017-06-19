/*
 @author Zakai Hamilton
 @component UIModal
 */

package.ui.modal = function UIModal(me) {
    me.require = {platform:"browser"};
    me.popup = {
        get: function(object) {
            
        },
        set: function(object, value) {
            object.modal_popup_method = value;
            var fullscreen = me.ui.rect.viewport();
            me.ui.element.update({
                "ui.style.position":"absolute",
                "ui.style.left":"0px",
                "ui.style.top":"0px",
                "ui.style.width":fullscreen.width + "px",
                "ui.style.height":fullscreen.height + "px",
                "ui.event.click":"ui.modal.click"
            }, object);
        }
    };
    me.click = {
        set: function(object, value) {
            me.ui.element.set(object.firstChild, object.modal_popup_method, value);
        }
    };
    me.close = function(object) {
        if (object.parentNode.parentNode) {
            object.parentNode.parentNode.removeChild(object.parentNode);
        }
    };
};
