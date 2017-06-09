/*
 @author Zakai Hamilton
 @component UIDrag
 */

package.ui.drag = new function UIDrag() {
    var me = this;
    me.source = null;
    me.target = null;
    me.set_element = function(object, value) {
        var element = package.ui.element.to_object(value);
        if(element) {
            element.drag_element = object;
        }
    };
    me.extend = function (object) {
        object.setAttribute("draggable", true);
        object.addEventListener('dragstart', function (e) {
            var target = me.parent_draggable(e.target);
            if(target.drag_element) {
                in_rect = package.ui.rect.in_region(target.drag_element, e.clientX, e.clientY);
                if (!in_rect) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }
            }
            target.style.opacity = '0.5';
            me.source = target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', target.innerHTML);
        }, false);
        object.addEventListener('dragenter', function (e) {
            var target = me.parent_draggable(e.target);
            me.target = target;
            target.classList.add('over');
        }, false);
        object.addEventListener('dragover', function (e) {
            var target = me.parent_draggable(e.target);
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            me.target = target;
            target.classList.add('over');
            return false;
        }, false);
        object.addEventListener('dragleave', function (e) {
            var target = me.parent_draggable(e.target);
            target.classList.remove('over');
            me.target = null;
        }, false);
        object.addEventListener('drop', function (e) {
            var target = me.parent_draggable(e.target);
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            package.ui.node.shift(me.source, target);
            return false;
        }, false);
        object.addEventListener('dragend', function (e) {
            var target = me.parent_draggable(e.target);
            if(me.target) {
                me.target.classList.remove('over');
            }
            if(target) {
                target.classList.remove('over');
            }
            target.style.opacity = '1.0';
            me.source = me.target = null;
        }, false);
    };
    me.parent_draggable = function(object) {
        while(object) {
            if(object.draggable === true) {
                break;
            }
            object = object.parentNode;
        }
        return object;
    };
};
