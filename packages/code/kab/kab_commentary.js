/*
 @author Zakai Hamilton
 @component KabCommentary
 */

screens.kab.commentary = function KabCommentary(me) {
    me.line = async function (session, line) {
        var hash = String(session.hash);
        var params = { hash };
        var userName = session.options.commentaryUser;
        if (userName && userName !== "all") {
            params.name = userName;
        }
        else if (session.options.commentaryEdit) {
            params.user = "$userId";
        }
        var commentaries = await me.db.commentary.entry.list(params);
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
            for (var commentary of commentaries) {
                if (session.options.commentaryLabel) {
                    line += me.ui.html.item({
                        tag: "span",
                        classes: ["kab-term-commentary-label"],
                        value: (userName === "all" ? commentary.name : "Commentary") + ":"
                    });
                }
                line += "\n" + commentary.text;
            }
            return line;
        }
        let html = me.ui.html.item({
            tag: "section"
        }, () => {
            let html = line;
            for (var commentary of commentaries) {
                if (session.options.commentaryLabel) {
                    html += me.ui.html.item({
                        tag: "span",
                        classes: ["kab-term-commentary-label"],
                        value: "Commentary:"
                    });
                }
                if (session.options.commentaryEdit) {
                    let source = me.kab.text.clean(line);
                    html += me.ui.html.item({
                        tag: "textarea",
                        classes: ["kab-term-commentary-edit"],
                        attributes: {
                            onchange: "screens.kab.commentary.store(this)",
                            hash,
                            user: commentary.user,
                            name: commentary.name,
                            source
                        },
                        value: commentary.text
                    });
                }
                return html;
            }
        });
        return html;
    };
    me.store = function (element) {
        var text = element.value;
        var hash = me.core.property.get(element, "ui.attribute.#hash");
        var user = me.core.property.get(element, "ui.attribute.#user");
        var name = me.core.property.get(element, "ui.attribute.#name");
        var source = me.core.property.get(element, "ui.attribute.#source");
        var data = {
            text,
            hash,
            user,
            name,
            source
        };
        if (text) {
            me.db.commentary.entry.use({
                "user": "$userId"
            }, data);
        }
        else {
            me.db.commentary.entry.remove({
                "user": "$userId"
            });
        }
    };
};
