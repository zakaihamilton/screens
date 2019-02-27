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
        setInterval(me.updateList, 5000);
    };
    me.updateList = function () {
        me.db.shared.message.list({ user: "$userId" }).then(messages => {
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
    me.push = function (title, body, args, type) {
        me.db.shared.message.push({ title, body, args, type, user: "$userId" });
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
        var html = "<div class=\"app-message-items\">";
        for (let index = 0; index < messages.length; index++) {
            var message = messages[index];
            var type = message.type;
            if (!type) {
                type = "info";
            }
            var notification = `
            <article class="app-message-item message is-${type}" id="${message._id}">
  <div class="message-header">
    ${message.title}
    <button class="delete" onclick="screens.app.messages.delete(this)"></button>
  </div>
  <div class="message-body" onclick="screens.app.messages.click(this)">
    ${message.body}
  </div>
</article>`;
            html += notification;
        }
        html += "</div>";
        return html;
    };
    me.delete = async function (object) {
        var container = me.ui.node.classParent(object, "app-message-item");
        if (container) {
            var id = me.core.property.get(container, "ui.attribute.#id");
            var index = me.messages.findIndex(message => message._id === id);
            var message = me.messages[index];
            await me.db.shared.message.remove({ _id: message._id });
            me.messages.splice(index, 1);
            me.core.property.set(container, "ui.class.close", true);
            me.updateSignal();
        }
    };
    me.click = function (object) {
        var container = me.ui.node.classParent(object, "app-message-item");
        if (container) {
            var id = me.core.property.get(container, "ui.attribute.#id");
            var index = me.messages.findIndex(message => message._id === id);
            var message = me.messages[index];
            if (message.args) {
                me.core.message.send.apply(null, message.args);
            }
            me.delete(container);
        }
    };
};
