/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = new function() {
    this.platform = "browser";
    this.matches = function(properties) {
        /* Find matching components */
        var matches = Object.keys(package["ui"]).map(function(component_name) {
            component = package["ui." + component_name];
            if(component.depends) {
                for(var depend_index = 0; depend_index < component.depends.length; depend_index++) {
                    if(!(component.depends[depend_index] in properties)) {
                        return null;
                    }
                }
                return component.id;
            }
            else {
                return null;
            }
        });
        matches = matches.filter(Boolean);
        /* TODO: sort by dependency count */
        matches.sort(function(source, target){
            return package[target].depends.length - package[source].depends.length;
        });
        return matches;
    };
    this.get = function(object, method) {
        var params = [object];
        var result = package.core.message.execute({prefix:"get_",method:method,params:params});
        if(typeof result === "undefined" && !method.includes(object.component)) {
            result = package.core.message.execute({prefix:"get_",method:method,params:params,component:object.component});
        }
        return result;
    };
    this.set = function(object, method, value) {
        var params = [object,value];
        package.core.message.execute({prefix:"set_",method:method,params:params});
        if(!method.includes(object.component)) {
            package.core.message.execute({prefix:"set_",method:method,params:params,component:object.component});
        }
    };
    this.create = function(properties) {
        var matches = this.matches(properties);
        var object = null;
        if(matches.length === 0) {
            return null;
        }
        var name = matches[0];
        var component = package[name];
        object = document.createElement(component.type);
        object.properties = properties;
        object.component = name;
        package.core.message.execute({component:name,method:"init",params:[object]});
        for (var key in properties) {
            this.set(object,key,properties[key]);
        }
        var body = document.getElementsByTagName("body")[0];
        this.set(object,"ui.node.parent",body);
        var info = package.core.ref.path(object, "parentNode");
        console.log("found:" + package.core.ref.get(info.root, info.path, "childNodes"));
        return object;
    };
};
