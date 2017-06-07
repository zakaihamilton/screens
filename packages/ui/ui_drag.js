/*
 @author Zakai Hamilton
 @component UIDrag
 */

package.ui.drag = new function UIDrag() {
    var me = this;
    this.extend = function (component) {
        var query = component.type + "." + package.ui.style.to_class(component.class);
        console.log("extending: " + component + " query: " + query);
        var cols = document.querySelectorAll(query);
        [].forEach.call(cols, function (col) {
            console.log("col:" + col);
            col.addEventListener('dragstart', function (e) {
                e.target.style.opacity = '0.4';
            }, false);
            col.addEventListener('dragenter', function (e) {
                e.target.classList.add('over');
            }, false);
            col.addEventListener('dragover', function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                return false;
            }, false);
            col.addEventListener('dragleave', function(e) {
                e.target.classList.remove('over');
            }, false);
        });
    };
};
