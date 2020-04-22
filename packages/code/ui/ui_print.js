/*
 @author Zakai Hamilton
 @component UIPrint
 */

screens.ui.print = function UIPrint(me) {
    me.init = async function () {
    };
    me.copy = async function (text) {
        var a = window.open('', '', '');
        a.document.write('<html>');
        a.document.write('<body><p>');
        a.document.write(text.split("\n").join("</p><p>"));
        a.document.write('</p></body></html>');
        a.document.close();
        a.print();
    };
    me.importData = function (object, text) {
        me.copy(text);
    };
    return "browser";
};
