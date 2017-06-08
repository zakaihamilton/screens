/*
 @author Zakai Hamilton
 @component UIDrag
 */

package.ui.drag = new function UIDrag() {
    var me = this;
    me.drag_element = null;
    me.extend = function (object) {
        object.addEventListener('dragstart', function (e) {
            e.target.style.opacity = '0.4';
            me.drag_element = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }, false);
        object.addEventListener('dragenter', function (e) {
            e.target.classList.add('over');
        }, false);
        object.addEventListener('dragover', function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }, false);
        object.addEventListener('dragleave', function (e) {
            e.target.classList.remove('over');
        }, false);
        object.addEventListener('drop', function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (me.drag_element !== e.target) {
                if(!e.target.nextSibling) {
                    me.drag_element.parentNode.appendChild(me.drag_element);
                }
                else if(!e.target.previousSibling) {
                    me.drag_element.parentNode.insertBefore(me.drag_element, e.target);
                }
                else if(!me.drag_element.nextSibling) {
                    me.drag_element.parentNode.insertBefore(me.drag_element, e.target);
                }
                else {
                    me.drag_element.parentNode.insertBefore(me.drag_element, e.target.nextSibling);
                }
            }
            return false;
        }, false);
        object.addEventListener('dragend', function (e) {
            var component = package[object.component];
            var query = component.type + "." + package.ui.style.to_class(component.class);
            var cols = document.querySelectorAll(query);
            [].forEach.call(cols, function (col) {
                col.classList.remove('over');
            });
            e.target.style.opacity = '1.0';
        }, false);
    };
};
