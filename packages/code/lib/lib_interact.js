/*
 @author Zakai Hamilton
 @component LibInteract
 */

screens.lib.interact = function LibInteract(me) {
    me.init = async function () {
        me.interact = await me.core.require.load(["/node_modules/interactjs/dist/interact.js"]);
    };
    me.draggable = function (object, info) {
        var tagName = info["ui.basic.tag"];
        me.interact(tagName, {
            context: object
        }).draggable({
            onmove: me.dragMoveListener,
            inertia: true,
            restrict: {
                restriction: "parent",
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }
        });
    };
    me.dragMoveListener = function (event) {
        var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
            y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
            target.style.transform =
            "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
    };
};