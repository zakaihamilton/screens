/*
 @author Zakai Hamilton
 @component FileText
 */

screens.file.text = function FileText(me, packages) {
    me.export = function (filename, text) {
        var blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
        var link = document.createElement("a");
        if (link.download !== undefined) {
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
};
