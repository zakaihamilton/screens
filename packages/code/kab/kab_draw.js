/*
 @author Zakai Hamilton
 @component KabDraw
 */

screens.kab.draw = function KabDraw(me) {
    me.coarseness = {
        0: "root",
        1: "one",
        2: "two",
        3: "three",
        4: "four"
    };
    me.formToHtml = function (form) {
        var html = "";
        var css = [];
        var hasPhase = typeof form.phase !== "undefined";
        if (hasPhase) {
            var phase = me.kab.form.get(form, "phase");
            css.push("kab-draw-phase-" + me.coarseness[phase]);
            if (!form.hardness) {
                css.push("kab-draw-circle");
            }
            var title = me.core.string.title(me.coarseness[phase]);
            html += "<div class=\"" + css.join(" ") + "\">";
            html += "<div class=\"kab-draw-title\">" + title + "</div>";
        }
        if (form.effects) {
            for (var effect of form.effects) {
                html += me.formToHtml(effect);
            }
        }
        if (hasPhase) {
            html += "</div>";
        }
        return html;
    };
};
