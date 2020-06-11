/*
 @author Zakai Hamilton
 @component UIPrint
 */

screens.ui.print = function UIPrint(me, { core, ui }) {
    me.init = async function () {
        core.broadcast.register(me, {
            exportMenu: "ui.print.exportMenu"
        });
    };
    me.exportMenu = function (window, method) {
        return {
            text: "Print",
            select: () => {
                core.property.set(window, method, ui.print);
            }
        };
    };
    me.copy = async function (text) {
        var a = window.open("", "", "");
        a.document.write("<html>");
        a.document.write("<body><p>");
        a.document.write(text.split("\n").join("</p><p>"));
        a.document.write("</p></body></html>");
        a.document.close();
        a.print();
    };
    me.importData = function (object, text) {
        me.copy(text);
    };
    return "browser";
};
