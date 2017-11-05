/*
 @author Zakai Hamilton
 @component KabStyle
 */

package.kab.style = function KabStyle(me) {
    me.process = function (session, instance, replacement, expansion) {
        var styles = instance.item.style;
        var html = "";
        var phase = null, heading = null, tooltip = null, descriptions = {};
        var term = instance.item.source ? instance.item.source : instance.target;
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
            if (styles && styles.heading && session.options.headings) {
                heading = styles.heading;
            }
            if (!session.options.keepSource && !expansion && session.options.doTranslation && term !== replacement) {
                if (instance.item.source) {
                    term = instance.item.source;
                }
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
        if(styles) {
            if(session.options.prioritizeExplanation) {
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
            var diagram = me.the.kab.diagram.matchingDiagram(session, instance.target);
            if(diagram && session.options.diagramCallback) {
                html += " onload=\"" + session.options.diagramCallback + "(this," + diagram + ")\"";
            }
            if(session.options.hoverCallback) {
                html += " onmouseover=\"" + session.options.hoverCallback + "(this,true)\" onmouseout=\"" + session.options.hoverCallback + "(this,false)\"";
            }
            if(session.options.toggleCallback) {
                html += " onclick=\"" + session.options.toggleCallback + "(this)\"";
            }
            html += ">";
            if (phase !== "none" && session.options.phaseNumbers && session.json.phaseNumber) {
                var phaseNumber = session.json.phaseNumber[phase];
                if (phaseNumber) {
                    html += "<span kab-term-phase-number=\"" + phaseNumber + "\" class=\"kab-term-phase-number kab-term-phase-number-" + phase + " kab-term-" + session.language + "\"></span>";
                }
            }
            if (heading) {
                html += "<span kab-term-heading=\"" + heading + "\" class=\"kab-term-" + session.language + "\"></span>";
            }
            if (numDescriptions) {
                if (phase === "none") {
                    phase = "root";
                }
                for(var descriptionType in descriptions) {
                    var description = descriptions[descriptionType];
                    html += "<span id=\"" + descriptionType + "\" style=\"display:none;\" class=\"kab-term-description-box kab-term-" + descriptionType + " kab-term-phase-" + phase + "-border\">";
                    var short = description.short;
                    if (!short) {
                        short = "";
                    }
                    html += "<span class=\"kab-term-short kab-term-" + session.language + " kab-term-phase-" + phase + " kab-term-phase-" + phase + "-underline\"><b>" + replacement + ":</b> " + short + "</span>";
                    html += "<span class=\"kab-term-description-type kab-term-" + session.language + "\">" + descriptionType + "</span>";
                    var long = description.long;
                    if (long) {
                        html += "<span class=\"kab-term-long\">" + long + "</span>";
                    }
                    html += "</span>";
                }
            }
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
