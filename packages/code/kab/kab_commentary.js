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
                    let source = me.kab.text.clean(line);
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
                    let source = me.kab.text.clean(line);
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
        var hash = me.core.property.get(element, "ui.attribute.#hash");
        var user = me.core.property.get(element, "ui.attribute.#user");
        var name = me.core.property.get(element, "ui.attribute.#name");
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
        data[field] = text;
        if (text) {
            me.db.commentary.entry.use({
                "user": "$userId",
                "hash": hash
            }, data);
        }
        else {
            me.db.commentary.entry.remove({
                "user": "$userId"
            });
        }
    };
};
