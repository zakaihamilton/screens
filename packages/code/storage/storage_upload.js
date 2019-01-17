/*
 @author Zakai Hamilton
 @component StorageUpload
 */

screens.storage.upload = function StorageUpload(me) {
    me.chunkSize = 1024 * 256;
    me.file = async function (file, path, progress) {
        var chunkSize = me.chunkSize;
        var chunkCount = file.size / chunkSize;
        var fileHandle = await me.core.file.open(path);
        me.log(
            "name: " + file.name +
            " size: " + file.size +
            " chunks: " + chunkCount +
            " path: " + path +
            " fileHandle: " + fileHandle
        );
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            var start = chunkIndex * chunkSize;
            var end = start + chunkSize;
            if (end > file.size) {
                end = file.size;
            }
            me.log(
                "start: " + start +
                " end: " + end +
                " size: " + (end - start) +
                " chunkIndex: " + chunkIndex +
                " chunkCount: " + chunkCount
            );
            var chunk = await me.readChunk(file, start, end);
            me.log("writing chunk");
            await me.core.file.write(fileHandle, chunk);
            if (progress) {
                progress(chunkIndex, chunkCount);
            }
        }
        await me.core.file.close(fileHandle);
    };
    me.readFile = async function (file, isText = false) {
        return new Promise((resolve, reject) => {
            if (!me.reader) {
                me.log("Creating reader");
                me.reader = new FileReader();
            }
            me.reader.onerror = function (event) {
                var err = event.target.error;
                me.log_error("Error reading chunk: " + err.message + " name: " + err.name);
                reject(event.target.error.code);
            };
            me.reader.onload = function (event) {
                var data = event.target.result;
                me.log("Result received");
                resolve(data);
            };
            if (isText) {
                me.reader.readAsText(file);
            }
            else {
                me.reader.readAsArrayBuffer(file);
            }
            me.log("Reading from buffer");
        });
    };
    me.readChunk = function (file, start, end) {
        return new Promise((resolve, reject) => {
            if (!me.reader) {
                me.log("Creating reader");
                me.reader = new FileReader();
            }
            me.reader.onerror = function (event) {
                var err = event.target.error;
                me.log_error("Error reading chunk: " + err.message + " name: " + err.name);
                reject(event.target.error.code);
            };
            me.reader.onload = function (event) {
                var data = event.target.result;
                me.log("Result received");
                resolve(data);
            };
            let slice = file.slice(start, end);
            me.log("File sliced from " + start + " to " + end);
            me.reader.readAsArrayBuffer(slice);
            me.log("Reading from buffer");
        });
    };
};
