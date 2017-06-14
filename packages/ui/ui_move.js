/*
 @author Zakai Hamilton
 @component UIMove
 */

package.ui.move = function UIMove(me) {
    me.source = null;
    me.target = null;
    me.set_element = function (object, value) {
        var element = me.ui.element.to_object(value);
        if (element) {
            element.drag_element = object;
        }
    };
    me.extend = function (object) {
        object.setAttribute("draggable", true);
        object.addEventListener('dragstart', function (e) {
            var target = me.parent_draggable(e.target);
            if(!target) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return;
            }
            if (target.drag_element) {
                var rect = me.ui.rect.absolute_region(target.drag_element);
                var in_rect = me.ui.rect.in_region(rect, e.clientX, e.clientY);
                if (!in_rect) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }
            }
            me.source = target;
            var source_rect = me.ui.rect.absolute_region(target);
            me.drag_offset = {x:e.clientX-source_rect.left, y: e.clientY-source_rect.top};
            target.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', target.innerHTML);
        }, false);
        object.addEventListener('dragenter', function (e) {
            if (me.source && me.source.style.position!=="absolute") {
                var target = me.parent_draggable(e.target);
                me.target = target;
                target.classList.add('over');
            }
        }, false);
        object.addEventListener('dragover', function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (me.source && me.source.style.position!=="absolute") {
                var target = me.parent_draggable(e.target);
                e.dataTransfer.dropEffect = 'move';
                me.target = target;
                target.classList.add('over');
            }
            return false;
        }, false);
        object.addEventListener('dragleave', function (e) {
            if (me.source && me.source.style.position!=="absolute") {
                var target = me.parent_draggable(e.target);
                target.classList.remove('over');
                me.target = null;
            }
        }, false);
        object.addEventListener('drop', function (e) {
            if (me.source && me.source.style.position!=="absolute") {
                var target = me.parent_draggable(e.target);
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                if (me.source.style.position!=="absolute") {
                    me.ui.node.shift(me.source, target);
                }
            }
            return false;
        }, false);
        object.addEventListener('dragend', function (e) {
            if(me.source) {
                if (me.source.style.position!=="absolute") {
                    var target = me.parent_draggable(e.target);
                    if (me.target) {
                        me.target.classList.remove('over');
                    }
                    if (target) {
                        target.classList.remove('over');
                    }
                }
                me.source.style.opacity = '1.0';
                me.source = me.target = null;
            }
        }, false);
        object.addEventListener('drag', function(e) {
            if(me.source) {
                if(e.clientX && e.clientY) {
                    me.drag_pos = {x:e.clientX,y:e.clientY};
                }
                if (me.source.style.position==="absolute") {
                    me.source.style.left = me.drag_pos.x - me.drag_offset.x + "px";
                    me.source.style.top = me.drag_pos.y - me.drag_offset.y + "px";
                }
            }
        });
    };
    me.parent_draggable = function (object) {
        while (object) {
            if (object.draggable === true) {
                break;
            }
            object = object.parentNode;
        }
        return object;
    };
};
