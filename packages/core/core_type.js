/*
    @author Zakai Hamilton
    @component CoreType
*/

package.core.type = function CoreType(me) {
    me.wrap = function(unwrapped_data) {
        return JSON.stringify({type:typeof unwrapped_data,value:JSON.stringify(unwrapped_data)});
    };
    me.unwrap = function(wrapped_data) {
        if(wrapped_data) {
            wrapped_data = JSON.parse(wrapped_data);
            if(wrapped_data.value !== undefined) {
                var unwrapped_data = JSON.parse(wrapped_data.value);
                var type = wrapped_data.type;
                if(type === "integer") {
                    unwrapped_data = Number(unwrapped_data);
                }
                else if(type === "string") {
                    unwrapped_data = String(unwrapped_data);
                }
                return unwrapped_data;
            }
        }
    };
    me.wrap_args = function(unwrapped_args) {
        var query = "";
        if(unwrapped_args) {
            for(var i = 0; i < unwrapped_args.length; i++) {
                var value = encodeURIComponent(me.package.core.type.wrap(unwrapped_args[i]));
                if(i === 0) {
                    query = "?" + i + "=" + value;
                }
                else {
                    query += "&" + i + "=" + value;
                }
            }
        }
        return query;
    };
    me.unwrap_args = function(wrapped_args) {
        var unwrapped_args = [];
        if(wrapped_args) {
            for(var key in wrapped_args) {
                if(wrapped_args.hasOwnProperty(key)) {
                    unwrapped_args.push(me.package.core.type.unwrap(wrapped_args[key]));
                }
            }
        }
        return unwrapped_args;
    };
};
