/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.type = new function() {
    this.wrap = function(unwrapped_data) {
        return JSON.stringify({type:typeof unwrapped_data,value:JSON.stringify(unwrapped_data)});
    };
    this.unwrap = function(wrapped_data) {
        wrapped_data = JSON.parse(wrapped_data);
        var unwrapped_data = JSON.parse(wrapped_data.value);
        var type = wrapped_data.type;
        if(type == "integer") {
            unwrapped_data = Number(unwrapped_data);
        }
        else if(type == "string") {
            unwrapped_data = String(unwrapped_data);
        }
        return unwrapped_data;
    };
    this.wrap_args = function(unwrapped_args) {
        var wrapped_args = {args:[]};
        var args_count = Object.keys(unwrapped_args).length;
        for(var args_index = 0; args_index < args_count; args_index++) {
            wrapped_args.args.push(package.core.type.wrap(unwrapped_args[args_index]));
        }
        return encodeURIComponent(JSON.stringify(wrapped_args));
    };
    this.unwrap_args = function(wrapped_args) {
        var unwrapped_args = [];
        wrapped_args = JSON.parse(decodeURIComponent(wrapped_args));
        for(var args_index = 0; args_index < wrapped_args.args.length; args_index++) {
            unwrapped_args.push(package.core.type.unwrap(wrapped_args.args[args_index]));
        }
        return unwrapped_args;
    };
};