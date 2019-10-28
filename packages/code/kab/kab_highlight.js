/*
 @author Zakai Hamilton
 @component KabHighlight
 */

screens.kab.highlight = function KabHighlight(me, { core, kab, ui }) {
    me.query = function () {
        var query = { user: "$userId" };
        return query;
    };
    me.line = async function (session, highlight, line) {
        var hash = String(session.hash);
        let source = kab.text.clean(session.line);
        var classes = [];
        var ondblclick = null;
        if (highlight) {
            if (highlight && highlight.length) {
                classes.push("kab-term-highlight");
            }
            ondblclick = "screens.kab.highlight.store(this)";
        }
        else {
            ondblclick = "screens.kab.highlight.toggle(this)";
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
    };
    me.remove = async function (element) {
        var user = "$userId";
        var name = "$userName";
        if (!core.property.get(element, "ui.class.contains", "kab-term-highlight")) {
            return;
        }
        core.property.set(element, "ui.class.remove", "kab-term-highlight");
        var hash = core.property.get(element, "ui.attribute.#hash");
        var source = core.property.get(element, "ui.attribute.#source");
        var data = await db.shared.highlight.find({
            "user": "$userId",
            "hash": hash
        });
        if (!data) {
            data = {};
        }
        data = Object.assign(data, {
            hash,
            user,
            name,
            source
        });
        db.shared.highlight.remove({
            "user": "$userId"
        });
    };
    me.store = async function (element) {
        var user = "$userId";
        var name = "$userName";
        core.property.set(element, "ui.class.toggle", "kab-term-highlight");
        var highlight = core.property.get(element, "ui.class.kab-term-highlight");
        var hash = core.property.get(element, "ui.attribute.#hash");
        var source = core.property.get(element, "ui.attribute.#source");
        var data = await db.shared.highlight.find({
            "user": "$userId",
            "hash": hash
        });
        if (!data) {
            data = {};
        }
        var date = new Date().toString();
        data = Object.assign(data, {
            hash,
            user,
            name,
            source,
            date
        });
        if (highlight) {
            db.shared.highlight.use({
                "user": "$userId",
                "hash": hash
            }, data);
        }
        else {
            db.shared.highlight.remove({
                "user": "$userId"
            });
        }
    };
};
