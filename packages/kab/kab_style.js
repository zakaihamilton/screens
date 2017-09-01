/*
 @author Zakai Hamilton
 @component KabStyle
 */

package.kab.style = function KabStyle(me) {
    me.process = function (term, styles, text, options, expansion, json, language) {
        var html = "";
        var phase = null, heading = null, tooltip = null, short = null, long = null;
        if (typeof styles === "string") {
            if (json.style) {
                styles = json.style[styles];
            } else {
                styles = null;
            }
        }
        if (styles && styles.bold) {
            html += "<b>";
        }
        if (styles && styles.phase) {
            phase = styles.phase;
            if (styles && styles.heading && options.headings) {
                heading = styles.heading;
            }
            if (!options.keepSource && !expansion && options.doTranslation && term !== text) {
                tooltip = term;
            }
        } else if (!options.keepSource && !expansion) {
            phase = "none";
            if (term !== text) {
                tooltip = term;
            }
            if (styles && styles.heading && options.headings) {
                heading = styles.heading;
            }
        }
        var description = null;
        if(styles) {
            description = styles.technical;
            if(options.prioritizeExplanation) {
                description = styles.explanation;
            }
            if(description) {
                if (description.short) {
                    short = description.short;
                }
                if (styles && description.long) {
                    long = description.long;
                }
            }
        }
        if (styles && styles.tooltip) {
            tooltip = styles.tooltip;
        }
        if (phase) {
            html += "<span class=\"kab-terms-phase-inline kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-outline\"";
        }
        if (phase || short || long) {
            html += " kab-terms-toast";
        }
        if (tooltip) {
            html += " kab-terms-tooltip=\"" + tooltip + "\"";
        }
        if (phase || tooltip || heading || short || long) {
            html += ">";
        }
        if (phase && phase !== "none" && options.phaseNumbers && json.phaseNumber) {
            var phaseNumber = json.phaseNumber[phase];
            if (phaseNumber) {
                html += "<span class=\"kab-terms-phase-number kab-terms-phase-number-" + phase + " kab-terms-" + language + "\">" + phaseNumber + "</span>";
            }
        }
        if (heading) {
            html += "<span class=\"kab-terms-heading kab-terms-" + language + "\">" + heading + "</span>";
        }
        if (phase || short || long) {
            if (phase === "none") {
                phase = "root";
            }
            html += "<span class=\"kab-terms-description-box kab-terms-phase-" + phase + "-border\">";
            if (!short) {
                short = "";
            }
            html += "<span class=\"kab-terms-short kab-terms-" + language + " kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-underline\"><b>" + text + ":</b> " + short + "</span>";
            if (long) {
                html += "<span class=\"kab-terms-long\">" + long + "</span>";
            }
            html += "</span>";
        }
        html += text;
        if (phase || tooltip || heading || short || long) {
            html += "</span>";
        }
        if (styles && styles.bold) {
            html += "</b>";
        }
        return html;
    };
};
