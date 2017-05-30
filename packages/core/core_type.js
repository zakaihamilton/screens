/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.type = new function() {
    this.wrap = function(unwrapped_data) {
        return JSON.stringify({type:typeof unwrapped_data,value:JSON.stringify(unwrapped_data)});
    };
    this.unwrap = function(wrapped_data) {
        if(wrapped_data) {
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
        }
    };
    this.wrap_args = function(unwrapped_args) {
        var wrapped_args = {args:unwrapped_args.map(function(item) { return package.core.type.wrap(item); })};
        return encodeURIComponent(JSON.stringify(wrapped_args));
    };
    this.unwrap_args = function(wrapped_args) {
        var unwrapped_args = [];
        wrapped_args = JSON.parse(decodeURIComponent(wrapped_args));
        unwrapped_args = wrapped_args.args.map(function(item) { return package.core.type.unwrap(item); });
        return unwrapped_args;
    };
};
