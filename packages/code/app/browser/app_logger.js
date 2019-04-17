/*
 @author Zakai Hamilton
 @component AppLogger
 */

screens.app.logger = function AppLogger(me, packages) {
    const { core, ui } = packages;
    me.launch = function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        me.singleton.isEnabled = false;
        return me.singleton;
    };
    me.init = function () {
        me.ui.options.load(me, null, {
            "source": "Browser",
            "filter": "",
            "format": true,
            "autoRefresh": false
        });
        me.ui.options.toggleSet(me, null, {
            "autoRefresh": "app.logger.refresh",
            "format": "app.logger.refresh"
        });
        me.ui.options.choiceSet(me, null, {
            "source": "app.logger.refresh"
        });
        me.ui.options.listSet(me, null, {
            "filter": "app.logger.refresh"
        });
    };
    me.send = async function (method) {
        var source = me.options.source.toLowerCase().replace(/\s/g, '_');
        var send_method = "send_" + source;
        var send = core.message[send_method];
        var args = Array.prototype.slice.call(arguments, 0);
        return await send.apply(null, args);
    };
    me.clear = {
        set: async function (object) {
            await me.send("core.console.clearMessages");
            await me.refresh(object);
        }
    };
    me.parseMessage = function (message) {
        message = me.parseHeader(message);
        message = me.parseJson(message);
        return message;
    };
    me.parseHeader = function (message) {
        let [, ip, date, platform, component, text] = message.match(/(.*) - (.*) log \[([^-]*)-\s([^\]]*)\]\s?(.*)/);
        ip = ip.split(".").map(str => core.string.padNumber(str, 3)).join(".");
        let html = "<article class=\"message\">";
        html += "<div class=\"message-header\">";
        html += `<p>${ip}</p><p>${date}</p><p>${platform.trim()}</p><p>${component}</p>`;
        html += "</div>";
        html += "<div class=\"message-body\">";
        html += text;
        html += "</div></article>";
        return html;
    };
    me.parseJson = function (message) {
        let [prefix, json, suffix] = core.string.token(message, "[{", "}]");
        if (!json) {
            [prefix, json, suffix] = core.string.token(message, "{", "}");
        }
        let html = prefix;
        if (json) {
            try {
                let object = JSON.parse(json);
                if (Object.keys(object).length) {
                    html += "<nav class=\"level app-logger-level\">";
                    for (let key in object) {
                        let value = object[key];
                        html += `
                        <div class="app-logger-level-item level-item has-text-centered">
                            <div>
                                <p class="heading">${core.string.title(key)}</p>
                            <p class="title">${value}</p>
                        </div>
                        </div>`;
                    }
                    html += "</nav>";
                }
                else {
                    html += "{}";
                }
            }
            catch (err) {

            }
        }
        html += suffix;
        return html;
    };
    me.refresh = async function (object) {
        var bindings = me.bindings(object);
        var logger = bindings.logger;
        core.property.set(logger, "ui.basic.html", "");
        var messages = await me.send("core.console.retrieveMessages");
        if (!messages) {
            messages = [];
        }
        if (me.options.filter) {
            messages = messages.filter(message => message.includes(me.options.filter));
            messages = messages.map(message => ui.html.markHtml(message, me.options.filter));
        }
        messages = messages.filter(Boolean);
        if (me.options.format) {
            messages = messages.map(me.parseMessage);
        }
        core.property.set(logger, "ui.basic.html", messages.join("<br>"));
        logger.scrollTop = logger.scrollHeight;
        var isEnabled = await me.send("core.console.isEnabled");
        me.singleton.isEnabled = isEnabled;
        clearTimeout(me.timerHandle);
        if (me.options.autoRefresh) {
            me.timerHandle = setInterval(() => {
                me.refresh(object);
            }, 5000);
        }
    };
    me.enable = {
        get: function () {
            return me.singleton.isEnabled;
        },
        set: function () {
            me.singleton.isEnabled = !me.singleton.isEnabled;
            me.send("core.console.enable", me.singleton.isEnabled);
        }
    };
    me.bindings = function () {
        var ids = [
            "logger"
        ];
        var bindings = {};
        for (var id of ids) {
            bindings[id] = document.getElementById("app.logger." + id);
        }
        return bindings;
    };
    return "browser";
};
