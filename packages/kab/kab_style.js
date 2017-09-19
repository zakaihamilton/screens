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
            html += "<span class=\"kab-term-phase-inline kab-term-phase-" + phase + " kab-term-phase-" + phase + "-outline\"";
            if (numDescriptions) {
                html += " kab-term-toast";
            }
            if (tooltip) {
                html += " kab-term-tooltip=\"" + tooltip + "\"";
            }
            if(options.hoverCallback) {
                html += " onmouseover=\"" + options.hoverCallback + "(this,true)\" onmouseout=\"" + options.hoverCallback + "(this,false)\"";
            }
            if(options.toggleCallback) {
                html += " onclick=\"" + options.toggleCallback + "(this)\"";
            }
            html += ">";
            if (phase !== "none" && options.phaseNumbers && json.phaseNumber) {
                var phaseNumber = json.phaseNumber[phase];
                if (phaseNumber) {
                    html += "<span class=\"kab-term-phase-number kab-term-phase-number-" + phase + " kab-term-" + language + "\">" + phaseNumber + "</span>";
                }
            }
            if (heading) {
                html += "<span class=\"kab-term-heading kab-term-" + language + "\">" + heading + "</span>";
            }
            if (numDescriptions) {
                if (phase === "none") {
                    phase = "root";
                }
                for(var descriptionType in descriptions) {
                    var description = descriptions[descriptionType];
                    html += "<span id=\"" + descriptionType + "\" class=\"kab-term-description-box kab-term-" + descriptionType + " kab-term-phase-" + phase + "-border\">";
                    var short = description.short;
                    if (!short) {
                        short = "";
                    }
                    html += "<span class=\"kab-term-short kab-term-" + language + " kab-term-phase-" + phase + " kab-term-phase-" + phase + "-underline\"><b>" + text + ":</b> " + short + "</span>";
                    html += "<span class=\"kab-term-description-type kab-term-" + language + "\">" + descriptionType + "</span>";
                    var long = description.long;
                    if (long) {
                        html += "<span class=\"kab-term-long\">" + long + "</span>";
                    }
                    html += "</span>";
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
