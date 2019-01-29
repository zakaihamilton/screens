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
                elementRect: { top: -0.05, left: -0.05, bottom: 1.05, right: 1.05 }
            }
        }).gesturable({
            onmove: me.dragMoveListener,
            inertia: true,
            restrict: {
                restriction: "parent",
                elementRect: { top: -0.05, left: -0.05, bottom: 1.05, right: 1.05 }
            }
        });
    };
    me.dragMoveListener = function (event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
            y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
        me.core.property.set(target, "ui.style.transition", "none");
        me.moveElement(target, x, y);
        me.core.property.set(target, "ui.style.transition", "");
    };
    me.moveElement = function (object, x, y) {
        var emX = me.ui.basic.pixelsToEm(object, x);
        var emY = me.ui.basic.pixelsToEm(object, y);
        object.style.transform = "translate(" + emX + "em, " + emY + "em)";
        object.setAttribute("data-x", x);
        object.setAttribute("data-y", y);
    };
};