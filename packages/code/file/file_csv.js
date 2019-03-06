/*
 @author Zakai Hamilton
 @component FileCsv
 */

screens.file.csv = function FileCsv(me, packages) {
    me.export = function (filename, rows) {
        var csvFile = "";
        csvFile = rows.map((row) => {
            var finalVal = "";
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? "" : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, "\"\"");
                if (result.search(/("|,|\n)/g) >= 0)
                    result = "\"" + result + "\"";
                if (j > 0)
                    finalVal += ",";
                finalVal += result;
            }
            return finalVal;
        }).join("\n");
        var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
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
