/*
 @author Zakai Hamilton
 @component AppChat
 */

screens.app.messages = function AppMessages(me) {
    me.init = function () {
        me.messages = [];
    };
    me.ready = async function () {
        me.updateList();
        if (!me.intervalHandle) {
            me.intervalHandle = setInterval(me.updateList, 10000);
        }
    };
    me.updateList = function () {
        me.db.shared.message.listing().then(messages => {
            if (messages.length === me.messages.length) {
                return;
            }
            me.messages = messages;
            if (me.singleton) {
                me.core.property.set(me.singleton, "ui.basic.html", me.html(me.singleton));
            }
            me.updateSignal();
        });
    };
    me.updateSignal = function () {
        let bar = me.ui.element.bar();
        me.core.property.set(bar.var.messages, "ui.class.on", me.messages.length);
    };
    me.push = function (title, body, type, args, broadcast) {
        if (!title) {
            title = "";
        }
        if (!body) {
            body = "";
        }
        var data = { title, body, type };
        if (args) {
            data.args = args;
        }
        if (broadcast) {
            data.user = "";
        }
        else {
            data.user = "$userId";
        }
        me.db.shared.message.send(data);
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.toggleVisibility", true);
            return;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        me.core.property.set(me.singleton, "ui.class.rise", true);
        return me.singleton;
    };
    me.html = function (object) {
        var messages = me.messages;
        var html = "<div class=\"app-messages-items\">";
        for (let index = 0; index < messages.length; index++) {
            var message = messages[index];
            var type = message.type;
            if (!type) {
                type = "info";
            }
            var actions = "";
            if (message.args) {
                actions += "<div class=\"app-messages-action\" onclick=\"screens.app.messages.click(this)\">Open</div>";
            }
            actions += "<div class=\"app-messages-action\" onclick=\"screens.app.messages.remove(this)\">Remove</div>";
            var notification = `
            <article class="app-messages-item message is-${type}" unique="${message.unique}">
  <div class="message-header">
    ${message.title}
    <button class="delete" onclick="screens.app.messages.delete(this)"></button>
  </div>
  <div class="message-body app-messages-body">
    ${message.body}
    <div class="app-messages-actions">
        ${actions}
    </div>
  </div>
</article>`;
            html += notification;
        }
        html += "</div>";
        return html;
    };
    me.remove = async function (object) {
        var container = me.ui.node.classParent(object, "app-messages-item");
        if (container) {
            var unique = me.core.property.get(container, "ui.attribute.#unique");
            var index = me.messages.findIndex(message => message.unique === unique);
            var message = me.messages[index];
            await me.db.shared.message.mark(message.unique);
            me.messages.splice(index, 1);
            me.core.property.set(container, "ui.class.close", true);
            me.updateSignal();
        }
    };
    me.click = function (object) {
        var container = me.ui.node.classParent(object, "app-messages-item");
        if (container) {
            var unique = me.core.property.get(container, "ui.attribute.#unique");
            var index = me.messages.findIndex(message => message.unique === unique);
            var message = me.messages[index];
            if (message.args) {
                me.core.message.send.apply(null, message.args);
            }
            me.remove(container);
        }
    };
};
