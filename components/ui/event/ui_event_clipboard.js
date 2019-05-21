COMPONENT.UIEventClipboard = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    static async init(me) {
        me.permissionStatus = null;
        try {
            if (navigator.permissions) {
                var permissionStatus = await navigator.permissions.query({
                    name: "clipboard-read"
                });
                me.permissionStatus = permissionStatus;
                permissionStatus.onchange = () => {
                    me.permissionStatus = permissionStatus;
                };
            }
        }
        catch (err) {
            throw "Clipboard not supported: " + err.message || err;
        }
    }
    static isSupported() {
        const me = COMPONENT.UIEventClipboard;
        return navigator.clipboard && me.permissionStatus === "granted";
    }
    static async copy(text) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
            }
            catch (err) {
                var error = "Could not copy text: " + text + " error: " + err;
                throw error;
            }
        }
        else {
            throw "Clipboard not supported";
        }
    }
    static importData(object, text) {
        const me = COMPONENT.UIEventClipboard;
        me.copy(text);
    }
    events() {
        return {
            click(event) {
                const me = COMPONENT.UIEventClipboard;
                let text = this.instance.send("text")[0];
                if (text) {
                    me.copy(text);
                }
            }
        };
    }
    register(instance) {
        instance.registerEvents(this.events);
    }
};
