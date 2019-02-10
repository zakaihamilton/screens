/*
 @author Zakai Hamilton
 @component KabHighlight
 */

screens.kab.highlight = function KabHighlight(me) {
    me.query = function () {
        var query = { user: "$userId" };
        return query;
    };
    me.line = async function (session, highlight, line) {
        var hash = String(session.hash);
        let source = me.kab.text.clean(session.line);
        var classes = [];
        if (highlight) {
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
        var value = line.match(tag === "h4" ? /<h4>(.*?)<\/h4>/ : /<p>(.*?)<\/p>/);
        if (value) {
            value = value[1];
        }
        else {
            value = line;
        }
        var html = me.ui.html.item({
            tag,
            classes,
            styles,
            attributes: {
                ondblclick: "screens.kab.highlight.store(this)",
                hash,
                source
            },
            value
        });
        return html;
    };
    me.store = async function (element) {
        var user = "$userId";
        var name = "$userName";
        me.core.property.set(element, "ui.class.toggle", "kab-term-highlight");
        var highlight = me.core.property.get(element, "ui.class.kab-term-highlight");
        var hash = me.core.property.get(element, "ui.attribute.#hash");
        var source = me.core.property.get(element, "ui.attribute.#source");
        var data = await me.db.shared.highlight.find({
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
        if (highlight) {
            me.db.shared.highlight.use({
                "user": "$userId",
                "hash": hash
            }, data);
        }
        else {
            me.db.shared.highlight.remove({
                "user": "$userId"
            });
        }
    };
};
