/*
 @author Zakai Hamilton
 @component KabDraw
 */

screens.kab.draw = function KabDraw(me) {
    me.init = async function() {
        await me.import("/node_modules/animate.css/animate.css");
    };
    me.phase = {
        0: {
            name: "root",
            term: "Behinat Shoresh"
        },
        1: {
            name:"one",
            term:"Behina Aleph"
        },
        2: {
            name:"two",
            term:"Behina Bet"
        },
        3: {
            name:"three",
            term:"Behina Gimel"
        },
        4: {
            name:"four",
            term:"Behina Dalet"
        }
    };
    me.formToHtml = async function (object, form) {
        var html = "";
        var css = [];
        var hasPhase = typeof form.phase !== "undefined";
        if (hasPhase) {
            var phase = me.kab.form.get(form, "phase");
            var phaseName = me.phase[phase].name;
            var term = me.phase[phase].term;
            css.push("kab-draw-phase-" + phaseName);
            if (!form.hardness) {
                css.push("kab-draw-circle animated fadeIn delay-" + phase + "s");
            }
            var app = me.core.property.get(object, "app");
            var text = await me.core.property.get(object, app.id + ".term", term);
            html += "<div class=\"" + css.join(" ") + "\">";
            html += "<div class=\"kab-draw-title\">" + text + "</div>";
        }
        if (form.effects) {
            for (var effect of form.effects) {
                html += await me.formToHtml(object, effect);
            }
        }
        if (hasPhase) {
            html += "</div>";
        }
        return html;
    };
};
