/*
 @author Zakai Hamilton
 @component KabDraw
 */

screens.kab.draw = function KabDraw(me) {
    me.init = async function () {
        await me.import("/node_modules/animate.css/animate.css");
    };
    me.options = {
        circleMultiplier: 2.5,
        animation: true
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
    me.html = async function (object, list, options) {
        options = Object.assign({}, me.options, options);
        var html = "<div>";
        for (var form of list) {
            var css = [];
            var styles = [];
            var phase = me.kab.form.get(form, "phase");
            var hasPhase = typeof phase !== "undefined";
            if (hasPhase) {
                var index = me.kab.form.index(form);
                var restriction = me.kab.form.get(form, "restriction");
                var direct = me.kab.form.get(form, "direct");
                var phaseName = me.phase[phase].name;
                var term = me.phase[phase].term;
                if (options.animation) {
                    css.push("animated fadeIn");
                }
                css.push("kab-draw-shape");
                if (typeof direct !== "undefined") {
                    css.push("kab-draw-line");
                    styles.push(...["left", "right"].map(name => name + ":49%"));
                    styles.push("top:" + (phase + 1) * options.circleMultiplier + "em");
                    styles.push("height:2.5em");
                    styles.push("background: var(--phase-" +
                        phaseName + "-background);");
                }
                else {
                    if (restriction) {
                        styles.push("background: var(--background);");
                    }
                    else {
                        styles.push("background: radial-gradient(circle at 100px 100px, var(--phase-" +
                            phaseName + "-background), var(--phase-" +
                            phaseName + "-border));");
                    }
                    css.push("kab-draw-circle");
                    let size = (phase + 1) * options.circleMultiplier;
                    styles.push(...["left", "top", "right", "bottom"].map(name => name + ":" + size + "em"));
                }
                var app = me.core.property.get(object, "app");
                var text = await me.core.property.get(object, app.id + ".term", term);
                styles.push("animation-delay: " + (index + 1) + "s");
                styles.push("z-index:" + phase);
                styles.push("border:3px solid var(--phase-" + phaseName + "-border)");
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
