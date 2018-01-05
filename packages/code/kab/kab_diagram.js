/*
 @author Zakai Hamilton
 @component KabDiagram
 */

package.kab.diagram = function KabDiagram(me) {
    me.init = function() {
        
    };
    me.matchingDiagram = function(session, term) {
        var matchingDiagram = null;
        if(!session.json || !session.options.diagrams || !session.json.diagrams) {
            return null;
        }
        for(let diagram of session.json.diagrams) {
            if(!diagram.diagram) {
                continue;
            }
            var path = diagram.diagram;
            if(diagram.term && diagram.term !== term) {
                continue;
            }
            if(session.usedDiagrams && session.usedDiagrams.includes(path)) {
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
            if(!session.usedDiagrams) {
                session.usedDiagrams = [];
            }
            session.usedDiagrams.push(path);
            break;
        }
        return matchingDiagram;
    };
};
