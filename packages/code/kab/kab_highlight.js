/*
 @author Zakai Hamilton
 @component KabHighlight
 */

screens.kab.highlight = function KabHighlight(me) {
    me.line = async function (session, line) {
        var hash = String(session.hash);
        var params = { hash, user: "$userId" };
        var highlight = await me.db.shared.highlight.find(params);
        let source = me.kab.text.clean(line);
        var classes = [];
        if (highlight) {
            classes.push("kab-term-highlight");
        }
        var html = me.ui.html.item({
            tag: "span",
            classes,
            attributes: {
                onclick: "screens.kab.highlight.store(this)",
                hash,
                source
            },
            value: line
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
        var data = await me.db.commentary.entry.find({
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
