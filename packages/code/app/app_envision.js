/*
 @author Zakai Hamilton
 @component AppEnvision
 */

screens.app.envision = function AppEnvision(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
        me.ui.options.load(me, window, {
            editMode: false
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateEditMode,
            "formatMode": me.updateEditMode
        });
        me.core.property.set(window, "app", me);
        me.updateEditMode(window);
        me.refresh(window);
    };
    me.importData = function (object, text) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.source, "text", text);
        me.core.property.set(window.var.content, "ui.basic.html", me.convert(object, text));
        me.core.property.set(window.var.source, "ui.basic.save");
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.content, "ui.style.opacity", window.options.editMode ? "0" : "");
        me.core.property.set([window.var.editorContainer], "ui.basic.show", window.options.editMode);
        me.core.property.set(window.var.source, "ui.basic.show", window.options.editMode && !window.options.formatMode);
        me.core.property.set(window.var.format, "ui.basic.show", window.options.editMode && window.options.formatMode);
        if (!window.options.editMode) {
            me.refresh(object);
        }
    };
    me.refresh = function (object) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.source, "text");
        me.core.property.set(window.var.content, "ui.basic.html", me.convert(object, text));
    };
    me.clear = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.source, "text", "");
        me.core.property.set(window.var.source, "ui.basic.save");
        me.core.property.set(window.var.content, "ui.basic.html", "");
        window.searchText = "";
    };
    me.exportText = function (object, target) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.source, "text");
        me.core.property.set(target, "importData", text);
    };
    me.execute = function (object) {
        var window = me.widget.window(object);
        var url = me.core.property.get(window.var.url, "text");
        alert(url);
    };
    me.convert = function (object, text) {
        var window = me.widget.window(object);
        var format = me.core.property.get(window.var.format, "text");
        if (!format) {
            format = "{}"
        }
        me.core.property.set(window.var.format, "ui.basic.save");
        try {
            format = JSON.parse(format);
        }
        catch (err) {
            return `<article class="message is-danger">
                        <div class="message-header">
                        <p>Error</p>
                        </div>
                        <div class="message-body">
                            Format is not JSON compliant
                        </div>
                    </article>`
        }
        return `<pre><code>${text}</code></pre>`;
        return text;
    };
};
