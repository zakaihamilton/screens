/*
    @author Zakai Hamilton
    @component CoreType
*/

screens.core.type = function CoreType(me) {
    me.wrap = function (unwrapped_data) {
        var result = null;
        if (unwrapped_data === null) {
            result = { type: "null" };
        }
        else if (unwrapped_data instanceof Error) {
            result = { type: "error", data: unwrapped_data.message };
        }
        else if (unwrapped_data instanceof ArrayBuffer) {
            result = { type: "buffer", data: me.arrayBufferToString(unwrapped_data) };
        }
        else if (Array.isArray(unwrapped_data)) {
            result = { type: "array", data: unwrapped_data };
        }
        else {
            result = { type: typeof unwrapped_data, data: unwrapped_data };
        }
        return result;
    };
    me.unwrap = function (wrapped_data) {
        if (wrapped_data) {
            var unwrapped_data = wrapped_data.data;
            var type = wrapped_data.type;
            if (type === "null") {
                unwrapped_data = null;
            }
            else if (type === "array") {
                unwrapped_data = Array.from(unwrapped_data);
            }
            else if (type === "integer") {
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
    if (me.platform === "server" || me.platform === "service") {
        global.atob = function (a) {
            return new Buffer(a, "base64").toString("binary");
        };
        global.btoa = function (b) {
            return new Buffer(b).toString("base64");
        };
    }
};
