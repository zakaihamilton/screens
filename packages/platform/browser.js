include([
"core.platform",
"core.console",
"core.remote",
"core.event",
"core.http",
"core.message",
"core.type",
"core.ref",
"core.module",
"core.script",
"ui.node",
"ui.element",
"ui.event",
"ui.style",
"ui.radio",
"ui.checkbox",
"ui.list",
"ui.button",
"ui.input",
"ui.text",
"app.main"
],
function() {
    package.core.message.send_browser("app.main.browser");
});
