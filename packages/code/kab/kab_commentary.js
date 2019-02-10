/*
 @author Zakai Hamilton
 @component KabCommentary
 */

screens.kab.commentary = function KabCommentary(me) {
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
        var hash = String(session.hash);
        var userName = session.options.commentaryUser;
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
            for (let commentary of commentaries) {
                if (!commentary.pre) {
                    continue;
                }
                html += "<p>";
                if (session.options.commentaryLabel) {
                    html += me.ui.html.item({
                        tag: "span",
                        classes: ["kab-term-commentary-label"],
                        value: (userName === "all" ? commentary.name : "Commentary") + ":"
                    });
                }
                let text = commentary.pre.split("\n").join("<br/>");
                html += "\n" + text;
                if (session.options.commentarySeparator) {
                    html += me.ui.html.item({
                        tag: "hr",
                        classes: ["kab-term-commentary-separator"]
                    });
                }
                html += "</p>";
            }
            html += line;
            for (let commentary of commentaries) {
                if (!commentary.post) {
                    continue;
                }
                html += "<p>";
                if (session.options.commentaryLabel) {
                    html += me.ui.html.item({
                        tag: "span",
                        classes: ["kab-term-commentary-label"],
                        value: (userName === "all" ? commentary.name : "Commentary") + ":"
                    });
                }
                let text = commentary.post.split("\n").join("<br/>");
                html += "\n" + text;
                if (session.options.commentarySeparator) {
                    html += me.ui.html.item({
                        tag: "hr",
                        classes: ["kab-term-commentary-separator"]
                    });
                }
                html += "</p>";
            }
            return html;
        }
        let html = me.ui.html.item({
            tag: "section"
        }, () => {
            let html = "";
            for (let commentary of commentaries) {
                if (session.options.commentaryEdit) {
                    let source = me.kab.text.clean(session.line);
                    html += me.ui.html.item({
                        tag: "textarea",
                        classes: ["kab-term-commentary-edit"],
                        attributes: {
                            onchange: "screens.kab.commentary.store(this,'pre')",
                            hash,
                            user: commentary.user,
                            name: commentary.name,
                            source
                        },
                        value: commentary.pre
                    });
                }
            }
            html += line;
            for (let commentary of commentaries) {
                if (session.options.commentaryEdit) {
                    let source = me.kab.text.clean(session.line);
                    html += me.ui.html.item({
                        tag: "textarea",
                        classes: ["kab-term-commentary-edit"],
                        attributes: {
                            onchange: "screens.kab.commentary.store(this,'post')",
                            hash,
                            user: commentary.user,
                            name: commentary.name,
                            source
                        },
                        value: commentary.post
                    });
                }
            }
            return html;
        });
        return html;
    };
    me.store = async function (element, field) {
        var text = element.value;
        var user = "$userId";
        var name = "$userName";
        var hash = me.core.property.get(element, "ui.attribute.#hash");
        var source = me.core.property.get(element, "ui.attribute.#source");
        var data = await me.db.shared.commentary.find({
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
            me.db.shared.commentary.use({
                "user": "$userId",
                "hash": hash
            }, data);
        }
        else {
            me.db.shared.commentary.remove({
                "user": "$userId"
            });
        }
    };
};
