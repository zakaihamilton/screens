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
            x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
            y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
        me.moveElement(target, x, y);
    };
    me.moveElement = function (object, x, y) {
        object.style.transform = "translate(" + x + "px, " + y + "px)";
        object.setAttribute("data-x", x);
        object.setAttribute("data-y", y);
    };
};