/*
 @author Zakai Hamilton
 @component UIDrag
 */

package.ui.drag = new function UIDrag() {
    var me = this;
    me.drag_element = null;
    me.extend = function (object) {
        object.setAttribute("draggable", true);
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
            package.ui.node.move(me.drag_element, e.target);
            return false;
        }, false);
        object.addEventListener('dragend', function (e) {
            var component = package[object.component];
            if(component.class) {
                var query = component.type + "." + package.ui.style.to_class(component.class);
                var cols = document.querySelectorAll(query);
                [].forEach.call(cols, function (col) {
                    col.classList.remove('over');
                });
            }
            e.target.style.opacity = '1.0';
        }, false);
    };
};
