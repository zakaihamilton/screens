/*
 @author Zakai Hamilton
 @component AppPrism
 */

screens.app.prism = function AppPrism(me, { core, ui, widget, kab }) {
    me.init = async function () {
        await ui.transform.implement(me);
    };
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var window = ui.element.create(me.json, "workspace", "self");
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = widget.window.get(object);
            var options = me.transform.options();
            ui.options.load(me, window, Object.assign({
                doTranslation: false,
                doExplanation: true,
                prioritizeExplanation: true,
                addStyles: true,
                abridged: true,
                brackets: true,
                parentheses: true,
                keepSource: false,
                category: true,
                headings: true,
                subHeadings: true,
                language: "Auto",
                fontSize: "18px",
                phaseNumbers: true,
                animation: true,
                autoRotate: false
            }, options.load));
            ui.options.toggleSet(me, null, Object.assign({
                "animation": me.reload,
                "autoRotate": me.update
            }, options.toggle));
            ui.options.choiceSet(me, null, Object.assign({
                "fontSize": (object, value) => {
                    core.property.set(window.var.viewer, "ui.style.fontSize", value);
                    core.property.notify(window, "reload");
                    core.property.notify(window, "update");
                }
            }, options.choice));
            core.property.set(window, "app", me);
            me.resize(window);
        }
    };
    me.update = function (object) {
        var window = widget.window.get(object);
        var autoRotate = window.options.autoRotate;
        var viewer = window.var.viewer;
        if (autoRotate) {
            var animate = () => {
                if (!viewer.rotateAngle) {
                    viewer.rotateAngle = 0;
                }
                var angle = viewer.rotateAngle + (viewer.rotateDirection ? 1 : -1);
                me.rotate(window, angle);
                if (angle !== viewer.rotateAngle) {
                    viewer.rotateDirection = !viewer.rotateDirection;
                }
                return !window.options.autoRotate;
            };
            core.util.animate(animate, 10);
        }
    };
    me.reload = async function (object) {
        var window = widget.window.get(object);
        var root = kab.form.root();
        var list = kab.draw.list(root, []);
        window.options.termMethod = "app.prism.transform.term";
        var html = await kab.draw.html(window, list, window.options);
        window.var.viewer.rotateDirection = false;
        core.property.set(window.var.viewer, "ui.basic.html", html);
        core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
        core.property.set(window.var.viewer, "ui.style.transform", "rotate3d(0,100,0,0deg)");
        core.property.notify(window, "update");
    };
    me.resetRotation = function (object) {
        var window = widget.window.get(object);
        me.rotate(window, 0);
    };
    me.rotateEvent = function (object, event) {
        var target_region = ui.rect.absoluteRegion(object);
        if (event.type === ui.touch.eventNames["down"]) {
            core.property.set(object, {
                "ui.touch.move": "app.prism.rotateEvent",
                "ui.touch.up": "app.prism.rotateEvent"
            });
            object.rotateLeft = event.clientX - target_region.left;
            object.rotateMode = false;
            object.rotateStartAngle = object.rotateAngle;
        }
        else if (event.type === ui.touch.eventNames["move"]) {
            if (!object.rotateMode && event.clientX > object.rotateLeft - 10 && event.clientX < object.rotateLeft + 10) {
                return;
            }
            object.rotateMode = true;
            var angle = ((event.clientX - target_region.left) - object.rotateLeft) / 5;
            if (object.rotateStartAngle) {
                angle += object.rotateStartAngle;
            }
            me.rotate(object, angle);
        }
        else if (event.type === ui.touch.eventNames["up"]) {
            object.rotateMode = false;
            core.property.set(object, {
                "ui.touch.move": null,
                "ui.touch.up": null
            });
        }
    };
    me.rotate = function (object, angle) {
        var window = widget.window.get(object);
        var x = 0, y = 100, z = 0;
        angle = core.util.range(angle, -70, 70);
        window.var.viewer.rotateAngle = angle;
        core.property.set(window.var.viewer, {
            "ui.style.transform": "rotate3d(" + [x, y, z, angle + "deg"].join(",") + ")"
        });
    };
    me.resize = function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.container, "ui.style.overflow", "hidden");
        var target_region = ui.rect.absoluteRegion(window.var.container);
        var size = target_region.width > target_region.height ? target_region.height : target_region.width;
        core.property.set(window.var.viewer, {
            "ui.style.top": ((target_region.height - size) / 2) + "px",
            "ui.style.left": ((target_region.width - size) / 2) + "px",
            "ui.style.width": size + "px",
            "ui.style.height": size + "px"
        });
    };
};
