/*
 @author Zakai Hamilton
 @component KabDiagram
 */

package.kab.diagram = function KabDiagram(me) {
    me.matchingDiagram = function(session, term) {
        var matchingDiagram = null;
        if(!session.json || !session.options.diagrams || !session.json.diagrams) {
            return null;
        }
        for(let diagram of session.json.diagrams) {
            var path = "/packages/res/diagrams/" + diagram.diagram + ".json";
            if(diagram.term !== term) {
                continue;
            }
            if(diagram.depends) {
                var dependenciesFound = 0;
                for(let dependency of diagram.depends) {
                    if(session.text.includes(dependency)) {
                        dependenciesFound++;
                    }
                }
                if(dependenciesFound !== diagram.depends.length) {
                    continue;
                }
            }
            matchingDiagram = path;
        }
        return matchingDiagram;
    };
};
