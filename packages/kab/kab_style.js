/*
 @author Zakai Hamilton
 @component KabStyle
 */

package.kab.style = function KabStyle(me) {
    me.process = function (term, styles, text, options, expansion, json, language) {
        var html = "";
        var phase = null, heading = null, tooltip = null, descriptions = {};
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
        if(styles) {
            if(options.prioritizeExplanation) {
                if(styles.explanation) {
                    descriptions["explanation"] = styles.explanation;
                }
                if(styles.technical) {
                    descriptions["technical"] = styles.technical;
                }
            }
            else {
                if(styles.technical) {
                    descriptions["technical"] = styles.technical;
                }
                if(styles.explanation) {
                    descriptions["explanation"] = styles.explanation;
                }
            }
        }
        descriptions["related"] = {};
        var numDescriptions = Object.keys(descriptions).length;
        if (styles && styles.tooltip) {
            tooltip = styles.tooltip;
        }
        if (phase) {
            html += "<span class=\"kab-terms-phase-inline kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-outline\"";
            if (numDescriptions) {
                html += " kab-terms-toast";
            }
            if (tooltip) {
                html += " kab-terms-tooltip=\"" + tooltip + "\"";
            }
            html += ">";
            if (phase !== "none" && options.phaseNumbers && json.phaseNumber) {
                var phaseNumber = json.phaseNumber[phase];
                if (phaseNumber) {
                    html += "<span class=\"kab-terms-phase-number kab-terms-phase-number-" + phase + " kab-terms-" + language + "\">" + phaseNumber + "</span>";
                }
            }
            if (heading) {
                html += "<span class=\"kab-terms-heading kab-terms-" + language + "\">" + heading + "</span>";
            }
            if (numDescriptions) {
                if (phase === "none") {
                    phase = "root";
                }
                for(var descriptionType in descriptions) {
                    var description = descriptions[descriptionType];
                    html += "<span class=\"kab-terms-description-box kab-terms-" + descriptionType + " kab-terms-phase-" + phase + "-border\">";
                    var short = description.short;
                    if (!short) {
                        short = "";
                    }
                    html += "<span class=\"kab-terms-short kab-terms-" + language + " kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-underline\"><b>" + text + ":</b> " + short + "</span>";
                    var long = description.long;
                    if (long) {
                        html += "<span class=\"kab-terms-long\">" + long + "</span>";
                    }
                    html += "</span>";
                    break;
                }
            }
        }
        html += text;
        if (phase) {
            html += "</span>";
        }
        if (styles && styles.bold) {
            html += "</b>";
        }
        return html;
    };
};
