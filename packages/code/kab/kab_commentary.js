/*
 @author Zakai Hamilton
 @component KabCommentary
 */

screens.kab.commentary = function KabCommentary(me, { core, db }) {
    me.query = function (options) {
        var query = {};
        var userName = options.commentaryUser;
        if (userName && userName !== "all") {
            query.name = userName;
        }
        else if (options.commentaryEdit) {
            query.user = "$userId";
        }
        return query;
    };
    me.line = async function (session, commentaries, line) {
        if ((!commentaries || !commentaries.length) && session.options.commentaryEdit) {
            commentaries = [{
                text: "",
                user: "$userId",
                name: "$userName"
            }];
        }
        if (!commentaries || !commentaries.length) {
            return line;
        }
        if (!session.options.commentaryEdit) {
            let html = "";
            html += await me.commentary(session, commentaries, "pre");
            html += line;
            html += await me.commentary(session, commentaries, "post");
            return html;
        }
        let html = me.ui.html.item({
            tag: "section"
        }, () => {
            let html = "";
            html += me.edit(session, commentaries, "pre");
            html += line;
            html += me.edit(session, commentaries, "post");
            return html;
        });
        return html;
    };
    me.store = async function (element, field) {
        var text = element.value;
        var user = "$userId";
        var name = "$userName";
        var hash = core.property.get(element, "ui.attribute.#hash");
        var source = core.property.get(element, "ui.attribute.#source");
        var data = await db.shared.commentary.find({
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
        data[field] = text;
        if (text) {
            db.shared.commentary.use({
                "user": "$userId",
                "hash": hash
            }, data);
        }
        else {
            db.shared.commentary.remove({
                "user": "$userId"
            });
        }
    };
    me.commentary = async function (session, commentaries, field) {
        var userName = session.options.commentaryUser;
        var line = "";
        for (let commentary of commentaries) {
            if (!commentary[field]) {
                continue;
            }
            let html = "";
            html += "<p>";
            if (session.options.commentaryLabel) {
                html += me.ui.html.item({
                    tag: "span",
                    classes: ["kab-term-commentary-label"],
                    value: (userName === "all" ? commentary.name : "Commentary") + ": "
                });
            }
            let text = commentary[field].split("\n").join("<br/>");
            html += "\n" + text;
            if (session.options.commentarySeparator) {
                html += me.ui.html.item({
                    tag: "hr",
                    classes: ["kab-term-commentary-separator"]
                });
            }
            html += "</p>";
            if (session.options.showHighlights) {
                html = await me.kab.highlight.line(session, null, html);
            }
            line += html;
        }
        return line;
    };
    me.edit = function (session, commentaries, field) {
        var hash = session.hash;
        var html = "";
        for (let commentary of commentaries) {
            if (session.options.commentaryEdit) {
                let source = me.kab.text.clean(session.line);
                html += me.ui.html.item({
                    tag: "textarea",
                    classes: ["kab-term-commentary-edit"],
                    attributes: {
                        onchange: "screens.kab.commentary.store(this,'" + field + "')",
                        hash,
                        user: commentary.user,
                        name: commentary.name,
                        source
                    },
                    value: commentary[field]
                });
            }
        }
        return html;
    };
};
