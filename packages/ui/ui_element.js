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
    this.to_path = function(object) {
        var path = null;
        var info = package.core.ref.gen_path(object, "parentNode");
        if(typeof this.root === "undefined") {
            this.root = info.root;
        }
        return info.path;
    };
    this.to_object = function(path) {
        var object = path;
        if(typeof path === "string") {
            object = package.core.ref.find_object(this.root, path, "childNodes");
        }
        return object;
    };
    this.get = function(object, path) {
        object = this.to_object(object);
        var method = path.substring(path.lastIndexOf(".")+1)
        var result = package.core.message.execute({method:"get",path:path,params:[object,method]});
        if(typeof result === "undefined") {
            result = package.core.message.execute({prefix:"get_",path:path,params:[object]});
        }
        if(typeof result === "undefined" && !method.includes(object.component)) {
            result = package.core.message.execute({prefix:"get_",path:path,params:[object],component:object.component});
        }
        return result;
    };
    this.set = function(object, path, value) {
        object = this.to_object(object);
        var method = path.substring(path.lastIndexOf(".")+1)
        if(!path.startsWith("ui.element")) {
            package.core.message.execute({method:"set",path:path,params:[object,method,value]});
        }
        package.core.message.execute({prefix:"set_",path:path,params:[object,value]});
        if(!path.startsWith(object.component)) {
            package.core.message.execute({prefix:"set_",path:path,params:[object,value],component:object.component});
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
        object.path = this.to_path(object);
        return object.path;
    };
};
