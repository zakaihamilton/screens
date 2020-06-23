/*
    @author Zakai Hamilton
    @component CoreType
*/

screens.core.type = function CoreType(me) {
    me.wrap = function (data) {
        var result = null;
        if (data === null) {
            result = { type: "null" };
        }
        else if (Array.isArray(data)) {
            result = { type: "array", data: data };
        }
        else if (data instanceof Error) {
            result = { type: "error", data: data.message };
        }
        else if (data instanceof ArrayBuffer) {
            result = { type: "buffer", data: me.arrayBufferToString(data) };
        }
        else if (typeof data === "string") {
            result = { type: "string", data: data };
        }
        else if (typeof data === "number") {
            result = { type: "number", data: data };
        }
        else if (typeof data === "boolean") {
            result = { type: "boolean", data: data };
        }
        else {
            result = { type: "object", data };
        }
        return result;
    };
    me.unwrap = function (wrapped_data) {
        if (wrapped_data) {
            var data = wrapped_data.data;
            var type = wrapped_data.type;
            if (type === "null") {
                data = null;
            }
            else if (type === "array") {
                data = Array.from(data);
            }
            else if (type === "error") {
                data = new Error(data);
            }
            else if (type === "buffer") {
                data = me.stringToArrayBuffer(data);
            }
            else if (type === "string") {
                data = String(data);
            }
            else if (type === "number") {
                data = Number(data);
            }
            else if (type === "boolean") {
                data = Boolean(data);
            }
            return data;
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
    if (me.platform === "server") {
        global.atob = function (a) {
            return new Buffer(a, "base64").toString("binary");
        };
        global.btoa = function (b) {
            return new Buffer(b).toString("base64");
        };
    }
};
