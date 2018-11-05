/*
 @author Zakai Hamilton
 @component AppEnvision
 */

screens.app.envision = function AppEnvision(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            editMode: false,
            autoRefresh: true,
            outputMode: false,
            liveEdit: false
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateMode,
            "formatMode": me.updateMode,
            "autoRefresh": me.updateMode,
            "outputMode": me.updateMode,
            "liveEdit": me.updateMode
        });
        me.core.property.set(window, "app", me);
        me.updateMode(window);
        me.refresh(window);
    };
    me.importData = function (object, text) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.source, "text", text);
        me.core.property.set(window.var.content, "ui.basic.html", me.convert(object, text));
        me.core.property.set(window.var.source, "ui.basic.save");
    };
    me.updateMode = function (object) {
        var window = me.widget.window.get(object);
        var editMode = window.options.editMode;
        var formatMode = window.options.formatMode;
        var liveEdit = window.options.liveEdit;
        me.core.property.set(window.var.content, "ui.style.opacity", editMode && !liveEdit ? "0" : "");
        me.core.property.set(window.var.editorContainer, "ui.basic.show", editMode);
        me.core.property.set(window.var.source, "ui.basic.show", editMode && !formatMode);
        me.core.property.set(window.var.format, "ui.basic.show", editMode && formatMode);
        me.core.property.set(window.var.editorContainer, "ui.style.top", liveEdit ?  "70%" : "");
        me.core.property.set(window.var.editorContainer, "ui.style.height", liveEdit ?  "29%" : "");
        if (!editMode) {
            me.refresh(object);
        }
        clearInterval(window.intervalHandle);
        if ((liveEdit || !editMode) && window.options.autoRefresh) {
            window.intervalHandle = setInterval(() => {
                me.refresh(object);
            }, 1000);
        }
    };
    me.refresh = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.source, "text");
        text = me.convert(object, text);
        if (window.options.outputMode) {
            text = me.formatXml(text);
        }
        me.core.property.set(window.var.content, window.options.outputMode ? "ui.basic.text" : "ui.basic.html", text);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.source, "text");
        me.core.property.set(target, "importData", text);
    };
    me.serialize = function (node) {
        var serializer = new XMLSerializer();
        return serializer.serializeToString(node);
    };
    me.formatXml = function (xml) {
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        var tokens = xml.split('\r\n');
        for (var index = 0; index < tokens.length; index++) {
            node = tokens[index];
            var indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        }
        return formatted;
    };
    me.beautifyName = function (object, name) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        name = name.replace(/_([a-z])/g, function (m, w) {
            return " " + w.toUpperCase();
        });
        return name;
    };
    me.processArrays = function (object, text, root) {
        text = text.replace(/\$\[[^\[\]]*\]/g, function (match) {
            console.log("match: " + match);
            match = match.substring(1, match.length - 1);
            var [path, content] = match.split("=");
            var item = me.core.json.traverse(root, path);
            var result = "";
            if (item.found && content && item.value) {
                for (var element of item.value) {
                    result += me.processVars(object, content, element);
                }
            }
            return result;
        });
        return text;
    };
    me.processVars = function (object, text, root) {
        text = text.replace(/\${[^{}]*}/g, function (match) {
            console.log("match: " + match);
            var path = match.substring(2, match.length - 1);
            if (path.startsWith("@")) {
                path = path.substring(1);
                if (path === "date") {
                    return new Date().toString();
                }
                else {
                    var info = me.core.property.split(object, path);
                    var item = me.core.json.traverse(root, info.value);
                    if (item.found) {
                        return me.core.property.get(object, info.name, item.value);
                    }
                    return "";
                }
            }
            var item = me.core.json.traverse(root, path);
            if (item.found) {
                return item.value;
            }
            return "";
        });
        return text;
    };
    me.convert = function (object, text) {
        var window = me.widget.window.get(object);
        var format = me.core.property.get(window.var.format, "text");
        if (!format) {
            format = "<div></div>";
        }
        if (!text) {
            text = "{}";
        }
        me.core.property.set(window.var.format, "ui.basic.save");
        try {
            try {
                var source = JSON.parse(text);
            }
            catch (err) {
                throw "Cannot parse text: " + err;
            }
            try {
                format = me.processArrays(object, format, source);
            }
            catch(err) {
                throw "Cannot process arrays: " + err;
            }
            try {
                format = me.processVars(object, format, source);
            }
            catch(err) {
                throw "Cannot process vars: " + err;
            }
            parser = new DOMParser();
            try {
                format = parser.parseFromString(format, "text/xml");
            }
            catch(err) {
                throw "Cannot parse format: " + err;
            }
            try {
                format = me.serialize(format);
            }
            catch(err) {
                throw "Cannot serialise format: " + err;
            }
        }
        catch (err) {
            return `<article class="message is-danger">
                        <div class="message-header">
                        <p>Error</p>
                        </div>
                        <div class="message-body">
                            Error parsing content: ${err}
                            Stack: ${new Error().stack}
                        </div>
                    </article>`
        }
        return `${format}`;
    };
};
