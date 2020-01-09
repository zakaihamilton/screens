/*
 @author Zakai Hamilton
 @component KabHighlight
 */

screens.kab.highlight = function KabHighlight(me, { core, kab, ui }) {
    me.highlights = [];
    me.line = async function (session, line) {
        var hash = String(session.hash);
        let source = kab.text.clean(session.line);
        var classes = [];
        var ondblclick = "screens.kab.highlight.toggle(this)";
        if (me.highlights.includes(hash)) {
            classes.push("kab-term-highlight");
        }
        classes.push("kab-term-hover");
        var styles = {
            "user-select": "none"
        };
        if (!line) {
            return "";
        }
        var tag = line.includes("<h4>") ? "h4" : "p";
        var value = line.replace(/\n/g, "").match(tag === "h4" ? /<h4>(.*?)<\/h4>/ : /<p>(.*?)<\/p>/);
        if (value) {
            value = value[1];
        }
        else {
            value = line;
        }
        var html = ui.html.item({
            tag,
            classes,
            styles,
            attributes: {
                ondblclick,
                hash,
                source
            },
            value
        });
        return html;
    };
    me.toggle = async function (element) {
        core.property.set(element, "ui.class.toggle", "kab-term-highlight");
        var highlight = core.property.get(element, "ui.class.kab-term-highlight");
        var hash = core.property.get(element, "ui.attribute.#hash");
        me.highlights = me.highlights.filter(item => item === hash);
        if (highlight) {
            me.highlights.push(hash);
        }
    };
    me.remove = async function (element) {
        core.property.set(element, "ui.class.remove", "kab-term-highlight");
        var hash = core.property.get(element, "ui.attribute.#hash");
        me.highlights = me.highlights.filter(item => item === hash);
    };
};
