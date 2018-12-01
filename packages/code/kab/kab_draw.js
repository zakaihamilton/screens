/*
 @author Zakai Hamilton
 @component KabDraw
 */

screens.kab.draw = function KabDraw(me) {
    me.init = async function () {
        await me.import("/node_modules/animate.css/animate.css");
    };
    me.options = {

    };
    me.phase = {
        0: {
            name: "root",
            term: "Behinat Shoresh"
        },
        1: {
            name: "one",
            term: "Behina Aleph"
        },
        2: {
            name: "two",
            term: "Behina Bet"
        },
        3: {
            name: "three",
            term: "Behina Gimel"
        },
        4: {
            name: "four",
            term: "Behina Dalet"
        }
    };
    me.list = function (form, list) {
        list.push(form);
        if (form.effects) {
            for (var effect of form.effects) {
                me.list(effect, list);
            }
        }
        return list;
    };
    me.html = async function (object, list) {
        var options = me.options;
        var html = "<div>";
        for (var form of list) {
            var css = [];
            var styles = [];
            var phase = me.kab.form.get(form, "phase");
            var hasPhase = typeof phase !== "undefined";
            if (hasPhase) {
                var index = me.kab.form.index(form);
                var restriction = me.kab.form.get(form, "restriction");
                var hardness = me.kab.form.get(form, "hardness");
                var phaseName = me.phase[phase].name;
                var term = me.phase[phase].term;
                css.push("kab-draw-phase-" + phaseName);
                if (restriction) {
                    css.push("restriction");
                }
                if (!hardness) {
                    css.push("kab-draw-circle animated fadeIn");
                    var size = (phase + 1) * 2.5;
                    styles.push(...["left", "top", "right", "bottom"].map(name => name + ":" + size + "em"));
                }
                var app = me.core.property.get(object, "app");
                var text = await me.core.property.get(object, app.id + ".term", term);
                styles.push("animation-delay: " + (index + 1) + "s");
                styles.push("z-index:" + phase);
                html += "<div class=\"" + css.join(" ") + "\" " + "style=\"" + styles.join(";") + "\">";
                html += "<div class=\"kab-draw-title\">" + text + "</div>";
                html += "</div>";
            }
        }
        html += "</div>";
        return html;
    };
    return "browser";
};
