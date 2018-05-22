/*
    @author Zakai Hamilton
    @component CoreType
*/

screens.core.type = function CoreType(me) {
    me.wrap = function (unwrapped_data) {
        var result = null;
        if (unwrapped_data instanceof Error) {
            result = JSON.stringify({ type: "error", data: JSON.stringify(unwrapped_data.message) });
        }
        else if (unwrapped_data instanceof ArrayBuffer) {
            result = JSON.stringify({ type: "buffer", data: JSON.stringify(me.arrayBufferToString(unwrapped_data)) });
        }
        else {
            result = JSON.stringify({ type: typeof unwrapped_data, data: JSON.stringify(unwrapped_data) });
        }
        return result;
    };
    me.unwrap = function (wrapped_data) {
        if (wrapped_data) {
            wrapped_data = JSON.parse(wrapped_data);
            if (wrapped_data.data !== undefined) {
                var unwrapped_data = JSON.parse(wrapped_data.data);
                var type = wrapped_data.type;
                if (type === "integer") {
                    unwrapped_data = Number(unwrapped_data);
                }
                else if (type === "string") {
                    unwrapped_data = String(unwrapped_data);
                }
                else if (type === "error") {
                    unwrapped_data = new Error(unwrapped_data);
                }
                else if (type === "buffer") {
                    unwrapped_data = me.stringToArrayBuffer(unwrapped_data);
                }
                return unwrapped_data;
            }
        }
    };
    me.wrap_args = function (unwrapped_args) {
        var query = null;
        if (unwrapped_args) {
            var first = true;
            var value = null;
            for (var i = 0; i < unwrapped_args.length; i++) {
                try {
                    value = encodeURIComponent(me.core.type.wrap(unwrapped_args[i]));
                    if (first) {
                        query = "?" + i + "=" + value;
                        first = false;
                    }
                    else {
                        query += "&" + i + "=" + value;
                    }
                }
                catch (e) {

                }
            }
        }
        return query;
    };
    me.unwrap_args = function (wrapped_args) {
        if (!wrapped_args) {
            return wrapped_args;
        }
        if (typeof wrapped_args === "string") {
            wrapped_args = me.core.http.parse_query(wrapped_args);
        }
        var unwrapped_args = [];
        if (wrapped_args) {
            for (var key in wrapped_args) {
                if (wrapped_args.hasOwnProperty(key)) {
                    unwrapped_args.push(me.core.type.unwrap(wrapped_args[key]));
                }
            }
        }
        return unwrapped_args;
    };
    me.arrayBufferToString = function (buffer) {
        var bytes = new Uint8Array(buffer);
        var len = buffer.byteLength;
        var binary = "";
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };
    me.stringToArrayBuffer = function (string) {
        var binary = atob(string);
        var buffer = new ArrayBuffer(binary.length);
        var bytes = new Uint8Array(buffer);
        for (var i = 0; i < buffer.byteLength; i++) {
            bytes[i] = binary.charCodeAt(i) & 0xFF;
        }
        return buffer;
    };
    if(me.platform === "server" || me.platform === "service") {
        global.atob = function(a) {
            return new Buffer(a, 'base64').toString('binary');
        };
        global.btoa = function(b) {
            return new Buffer(b).toString('base64');
        };
    }
};
