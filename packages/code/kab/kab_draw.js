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
            phase: "Behinat Shoresh",
            light: "Yechida"
        },
        1: {
            name: "one",
            phase: "Behina Aleph",
            light: "Haya"
        },
        2: {
            name: "two",
            phase: "Behina Bet",
            light: "Neshama"
        },
        3: {
            name: "three",
            phase: "Behina Gimel",
            light: "Ruach"
        },
        4: {
            name: "four",
            phase: "Behina Dalet",
            light: "Nefesh"
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
                var depth = index;
                var restriction = me.kab.form.get(form, "restriction");
                var direct = me.kab.form.get(form, "direct");
                var reflect = me.kab.form.get(form, "reflect");
                var phaseName = me.phase[phase].name;
                var term = me.phase[phase].phase;
                if (options.animation) {
                    css.push("animated fadeIn");
                }
                css.push("kab-draw-shape");
                if (typeof reflect !== "undefined") {
                    styles.push(...["left", "right"].map(name => name + ":47%"));
                    styles.push("top:" + (phase + 1) * options.circleMultiplier + "em");
                    styles.push("height:2.5em");
                    if (direct) {
                        styles.push("background: var(--phase-" +
                            phaseName + "-background)");
                    }
                    term = me.phase[phase].light;
                    depth -= (0 - phase);
                }
                else if (direct) {
                    styles.push(...["left", "right"].map(name => name + ":50%"));
                    styles.push("top:" + (phase + 1) * options.circleMultiplier + "em");
                    styles.push("height:10em");
                    styles.push("background: var(--phase-root-background)");
                    term = "Ohr Yashar";
                    depth += 4;
                }
                else {
                    css.push("circle");
                    if (restriction) {
                        styles.push("background: var(--background)");
                        depth = index + [0, 2, 4, 6, 8][phase];
                    }
                    else {
                        styles.push("background: radial-gradient(circle at 100px 100px, var(--phase-" +
                            phaseName + "-background), var(--phase-" +
                            phaseName + "-border))");
                    }
                    let size = (phase + 1) * options.circleMultiplier;
                    styles.push(...["left", "top", "right", "bottom"].map(name => name + ":" + size + "em"));
                }
                var text = await me.core.property.get(object, options.termMethod, term);
                var borderColor = me.ui.color.get("--phase-" + phaseName + "-border");
                if (!phase) {
                    borderColor = "darkgray";
                }
                var backgroundColor = me.ui.color.get("--phase-" + phaseName + "-background");
                styles.push("z-index:" + depth);
                styles.push("animation-delay: " + index + "s");
                styles.push("transform: translateZ(" + (depth * 30) + "px)");
                styles.push("border:0.1em solid " + borderColor);
                styles.push("--border-color: " + borderColor);
                styles.push("--background-color: " + backgroundColor);
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
