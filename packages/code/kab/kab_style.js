/*
 @author Zakai Hamilton
 @component KabStyle
 */

screens.kab.style = function KabStyle(me, { core, kab, ui }) {
    me.process = function (session, instance, replacement, expansion) {
        var nightModeClass = session.options.nightMode ? "night-mode" : "";
        var styles = instance.item.style;
        var html = "";
        var subHeading = "";
        var category = "";
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
            if (styles) {
                if (styles.heading && session.options.headings) {
                    heading = styles.heading;
                }
                if (styles.category && session.options.category) {
                    category = styles.category;
                }
            }
            if (!expansion && (!session.options.doTranslation || term !== replacement)) {
                tooltip = term;
            }
        } else if (!expansion) {
            phase = "none";
            if (term !== replacement) {
                tooltip = term;
            }
            if (styles) {
                if (styles.heading && session.options.headings) {
                    heading = styles.heading;
                }
                if (styles.category && session.options.category) {
                    category = styles.category;
                }
            }
        }
        if (instance.item) {
            if (instance.item.hebrew) {
                if (instance.item.transliterated) {
                    tooltip = instance.item.transliterated;
                }
                tooltip = instance.item.hebrew + core.string.optional(" &#xa; " + tooltip, tooltip);
                if (session.options.subHeadings) {
                    subHeading = tooltip;
                }
                if (session.options.headings &&
                    instance.item.translation &&
                    !session.options.doTranslation &&
                    replacement !== instance.item.translation) {
                    heading = instance.item.translation;
                }
            }
            else if (instance.item.explanation && instance.item.translation && session.options.doExplanation) {
                subHeading = instance.item.translation;
            }
        }
        if (styles && styles.tooltip) {
            tooltip = styles.tooltip;
        }
        if (phase) {
            html += "<span kab-term=\"" + instance.term + "\" kab-phase=\"" + phase + "\" kab-text=\"" + replacement + "\" kab-category=\"" + category + "\" class=\"kab-term-phase-inline " + nightModeClass;
            if (phase) {
                html += " kab-term-phase-" + phase + " kab-term-phase-" + phase + "-border ";
            }
            if (phase !== "none") {
                html += " kab-term-phase-standard-width ";
            }
            if (category) {
                html += " kab-term-category";
            }
            if (heading) {
                html += " kab-term-heading";
            }
            html += " kab-term-" + session.language + "\"";
            if (tooltip) {
                html += " kab-term-tooltip=\"" + tooltip + "\"";
            }
            var diagram = kab.diagram.matchingDiagram(session, instance.target);
            if (diagram) {
                if (!session.diagrams) {
                    session.diagrams = [];
                }
                session.diagrams.push(diagram);
            }
            if (session.options.clickCallback) {
                html += " onclick=\"" + session.options.clickCallback + "(this,'" + instance.item.term + "')\"";
            }
            html += ">";
            if ((phase && phase !== "none") && session.options.phaseNumbers && session.json.phaseNumber) {
                var phaseNumber = session.json.phaseNumber[phase];
                if (phaseNumber) {
                    html += "<span kab-term-phase-number=\"" + phaseNumber + "\" class=\"kab-term-phase-number kab-term-" + session.language + " " + nightModeClass + "\"></span>";
                }
            }
            if (category) {
                let text = category.split("/").join(" &#13;&#10; ");
                html += "<span kab-term-category=\"" + text + "\" class=\"kab-term-" + session.language + " " + nightModeClass + "\"></span>";
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
    me.formatHebrewText = function (text) {
        let matches = text.match(/[ֿ\u0590-\u05FF]+/g);
        if (matches) {
            Array.from(new Set(matches)).map(match => {
                text = ui.html.surround(text, match, "<span style='font-family: ShlomoStam;'>", "</span>");
            });
        }
        return text;
    };
};
