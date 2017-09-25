/*
 @author Zakai Hamilton
 @component KabDiagram
 */

package.kab.diagram = function KabDiagram(me) {
    me.process = function(wordsString, json, options) {
        var diagrams = json.diagrams;
        if(!diagrams) {
            return wordsString;
        }
        for(let diagram of diagrams) {
            var path = "/packages/res/diagrams/" + diagram.diagram + ".json";
            if(!diagram.terms) {
                continue;
            }
            var termsFound = 0;
            for(let term of diagram.terms) {
                if(wordsString.includes(term)) {
                    termsFound++;
                }
            }
            if(termsFound !== diagram.terms.length) {
                continue;
            }
            me.core.app.launch(null, "diagram", [path,options]);
        }
        return wordsString;
    };
};
