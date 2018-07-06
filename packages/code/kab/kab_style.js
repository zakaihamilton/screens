/*
 @author Zakai Hamilton
 @component KabStyle
 */

screens.kab.style = function KabStyle(me) {
    me.process = function (session, instance, replacement, expansion) {
        var nightModeClass = session.options.nightMode ? "night-mode" : "";
        var styles = instance.item.style;
        var html = "";
        var subHeading = "";
        var phase = null, parentPhase = null, heading = null, tooltip = null;
        var term = instance.target;
        if (typeof styles === "string") {
            if (session.json.style) {
                styles = session.json.style[styles];
            } else {
                styles = null;
            }
        }
        if (styles && styles.bold) {
            html += "<b>";
        }
        if (styles && styles.phase) {
            phase = styles.phase;
            if (typeof phase !== "string") {
                if (phase.major) {
                    parentPhase = phase.major;
                }
                if (phase.minor) {
                    phase = phase.minor;
                }
                else {
                    phase = phase.major;
                    parentPhase = null;
                }
            }
            if (styles && styles.heading && session.options.headings) {
                heading = styles.heading;
            }
            if (!session.options.keepSource && !expansion && (!session.options.doTranslation || term !== replacement)) {
                tooltip = term;
            }
        } else if (!session.options.keepSource && !expansion) {
            phase = "none";
            if (term !== replacement) {
                tooltip = term;
            }
            if (styles && styles.heading && session.options.headings) {
                heading = styles.heading;
            }
        }
        if (instance.item && instance.item.hebrew) {
            if (instance.item.transliterated) {
                tooltip = instance.item.transliterated;
            }
            tooltip = instance.item.hebrew + me.core.string.optional(" &#xa; " + tooltip, tooltip);
            if (session.options.subHeadings) {
                subHeading = tooltip;
            }
        }
        if (styles && styles.tooltip) {
            tooltip = styles.tooltip;
        }
        if (phase) {
            html += "<span class=\"kab-term-phase-inline kab-term-phase-" + phase + " kab-term-phase-" + phase + "-border " + nightModeClass + "\"";
            if (tooltip) {
                html += " kab-term-tooltip=\"" + tooltip + "\"";
            }
            var diagram = me.kab.diagram.matchingDiagram(session, instance.target);
            if (diagram && session.options.diagramCallback) {
                html += " onload=\"" + session.options.diagramCallback + "(this," + diagram + ")\"";
            }
            if (session.options.clickCallback) {
                html += " onclick=\"" + session.options.clickCallback + "(this,'" + instance.item.term + "')\"";
            }
            html += ">";
            if (phase !== "none" && session.options.phaseNumbers && session.json.phaseNumber) {
                var phaseNumber = session.json.phaseNumber[phase];
                if (phaseNumber) {
                    html += "<span kab-term-phase-number=\"" + phaseNumber + "\" class=\"kab-term-phase-number kab-term-" + session.language + " " + nightModeClass + "\"></span>";
                }
            }
            if (heading) {
                html += "<span kab-term-heading=\"" + heading + "\" class=\"kab-term-" + session.language + " " + nightModeClass + "\"></span>";
            }
            if (subHeading) {
                html += "<span kab-term-sub-heading=\"" + subHeading + "\" class=\"kab-term-" + session.language + " " + nightModeClass + "\"></span>";
            }
        }
        if (instance.prefixLetters) {
            html += instance.prefixLetters;
        }
        html += replacement;
        if (phase) {
            html += "</span>";
        }
        if (styles && styles.bold) {
            html += "</b>";
        }
        return html;
    };
};
