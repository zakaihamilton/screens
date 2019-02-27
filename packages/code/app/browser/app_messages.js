/*
 @author Zakai Hamilton
 @component AppChat
 */

screens.app.messages = function AppMessages(me) {
    me.init = function () {
        me.messages = [];
    };
    me.ready = async function () {
        me.db.shared.message.list({ user: "$userId" }).then(messages => {
            me.messages = messages;
        });
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if (me.core.property.get(me.singleton, "temp")) {
                me.core.property.set(me.singleton, "fullscreen", false);
                me.core.property.set(me.singleton, "nobar", false);
                me.core.property.set(me.singleton, "temp", false);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.html = function (object) {
        var messages = me.messages;
        var html = "<div class=\"app-message-items\">";
        for (let index = 0; index < messages.length; index++) {
            var message = messages[index];
            var notification = `
            <article class="app-message-item message is-info" index="${index}" onclick="screens.app.messages.click(this)">
  <div class="message-header">
    ${message.title}
    <button class="delete" onclick="screens.app.messages.delete(this)"></button>
  </div>
  <div class="message-body">
    ${message.body}
  </div>
</article>`;
            html += notification;
        }
        html += "</div>";
        return html;
    };
    me.delete = function (object) {
        var container = me.ui.node.classParent(object, "app-message-item");
        if (container) {
            me.core.property.set(container, "ui.class.close", true);
        }
    };
    me.click = function (object) {
        var index = me.core.property.get(object, "ui.attribute.#index");
        var message = me.messages[parseInt(index)];
        if (message.args) {
            me.core.message.send.apply(null, message.args);
        }
        me.core.property.set(object, "ui.class.close", true);
    };
};
