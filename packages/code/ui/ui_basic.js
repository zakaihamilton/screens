/*
 @author Zakai Hamilton
 @component UIBasic
 */

screens.ui.basic = function UIBasic(me, { core, ui, widget }) {
    me.tag = {
        get: function (object) {
            return object.tagName.toLowerCase();
        }
    };
    me.elementId = {
        get: function (object) {
            return object.id;
        },
        set: function (object, value) {
            object.id = value;
        }
    };
    me.src = {
        get: function (object) {
            return object.src;
        },
        set: function (object, value) {
            object.src = ui.image.get(value);
        }
    };
    me.ref = {
        get: function (object) {
            var ref = null;
            var parent = object.parentNode;
            if (parent) {
                if (!parent.ref) {
                    parent.ref = core.ref.gen();
                }
                ref = parent.ref;
            }
            return ref;
        },
        set: function (object) {
            var ref = null;
            var parent = object.parentNode;
            if (parent) {
                parent.ref = ref;
            }
        }
    };
    me.href = {
        get: function (object) {
            return object.href;
        },
        set: function (object, value) {
            object.href = value;
        }
    };
    me.htmlFor = {
        get: function (object) {
            return object.htmlFor;
        },
        set: function (object, value) {
            object.htmlFor = value;
        }
    };
    me.type = {
        get: function (object) {
            return object.type;
        },
        set: function (object, value) {
            object.type = value;
        }
    };
    me.var = {
        set: function (object, value) {
            if (value) {
                var parent = object.parentNode;
                if (object.context) {
                    parent = object.context;
                }
                if (!parent.var) {
                    parent.var = {};
                }
                value.split(",").map(value => {
                    parent.var[value] = object;
                });
            }
        }
    };
    me.context = {
        get: function (object) {
            return object.context;
        },
        set: function (object, value) {
            if (value === "self") {
                object.context = object;
            }
            else {
                object.context = value;
            }
        }
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                ui.element.create(value, object, object.context);
            }
        }
    };
    me.enabled = {
        get: function (object) {
            return !object.getAttribute("disabled");
        },
        set: function (object, value) {
            if (value) {
                object.removeAttribute("disabled");
            }
            else {
                object.setAttribute("disabled", true);
            }
        }
    };
    me.text = {
        get: function (object) {
            if (object.tagName && object.tagName.toLowerCase() === "input") {
                return object.value;
            }
            return object.textContent;
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                if (object.tagName && object.tagName.toLowerCase() === "input") {
                    object.value = value;
                }
                else {
                    object.textContent = value;
                }
            }
        }
    };
    me.html = {
        get: function (object) {
            if (object.tagName && object.tagName.toLowerCase() === "input") {
                return object.value;
            }
            return object.innerHTML;
        },
        set: function (object, value) {
            if (object.tagName && object.tagName.toLowerCase() === "input") {
                object.value = value;
            }
            else {
                object.innerHTML = value;
                ui.theme.updateElements(object.parentNode);
            }
        }
    };
    me.readOnly = {
        get: function (object) {
            return object.readOnly;
        },
        set: function (object, value) {
            object.readOnly = value;
        }
    };
    me.draggable = {
        get: function (object) {
            return object.draggable;
        },
        set: function (object, value) {
            object.draggable = value;
        }
    };
    me.parentWidget = {
        get: function (object) {
            return object.parentWidget;
        },
        set: function (object, value) {
            if (!value) {
                value = object;
            }
            object.parentWidget = value;
        }
    };
    me.window = {
        get: function (object) {
            return object.window;
        },
        set: function (object, value) {
            if (!value) {
                value = object;
            }
            object.window = widget.window.get(value);
        }
    };
    me.target = {
        get: function (object) {
            return object.target;
        },
        set: function (object, value) {
            object.target = value;
        }
    };
    me.editable = {
        get: function (object) {
            return object.contentEditable;
        },
        set: function (object, value) {
            object.contentEditable = value;
        }
    };
    me.save = {
        set: function (object, options = {}) {
            var text = "";
            if (options && options.method) {
                text = core.property.get(object, options.method);
                if (options.json) {
                    text = JSON.stringify(text);
                }
            }
            else {
                text = core.property.get(object, "ui.basic.text");
            }
            core.property.set(object, "storage.local.store", text);
            core.property.notify(ui.node.container(object, widget.container.id), "update");
        }
    };
    me.metadata = {
        get: function (object) {
            return object.metadata;
        },
        set: function (object, value) {
            object.metadata = value;
        }
    };
    me.show = {
        get: function (object) {
            return object.style.visibility !== "hidden";
        },
        set: function (object, value) {
            object.style.visibility = value ? "visible" : "hidden";
        }
    };
    me.hide = {
        get: function (object) {
            return object.style.visibility === "hidden";
        },
        set: function (object, value) {
            object.style.visibility = value ? "hidden" : "visible";
        }
    };
    me.display = {
        get: function (object) {
            return object.style.display !== "none";
        },
        set: function (object, value) {
            object.style.display = value ? "" : "none";
        }
    };
    me.pixelsToEm = function (element, pixelValue) {
        var elementFontSize = parseFloat(window.getComputedStyle(element).fontSize);
        return (pixelValue / elementFontSize);
    };
    me.emToPixels = function (element, emValue) {
        var elementFontSize = parseFloat(window.getComputedStyle(element).fontSize);
        return (emValue * elementFontSize);
    };
    me.unitToPixels = function (element, value, unit) {
        if (element && unit === "em") {
            value = me.emToPixels(element, value);
        }
        return value;
    };
    me.pixelsToUnit = function (element, pixelValue, unit) {
        if (element && unit === "em") {
            return me.pixelsToEm(element, pixelValue);
        }
        return pixelValue;
    };
};
