/*
 @author Zakai Hamilton
 @component StorageUpload
 */

screens.storage.upload = function StorageUpload(me) {
    me.chunkSize = 1024 * 1024;
    me.file = async function(file, path, progress) {
        var chunkSize = me.chunkSize;
        var chunkCount = file.size / chunkSize;
        console.log("size: " + file.size + " chunks: " + chunkCount);
        var fileHandle = await me.core.file.open(path);
        for(chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            var start = chunkIndex * chunkSize;
            var end = start + chunkSize;
            if(end > file.size) {
                end = file.size;
            }
            var chunk = await me.readChunk(file, start, end);
            await me.core.file.write(fileHandle, chunk);
            if(progress) {
                progress(chunkIndex, chunkCount);
            }
        }
        await me.core.file.close(fileHandle);
    };
    me.readChunk = function(file, start, end) {
        return new Promise((resolve, reject) => {
            if(!me.reader) {
                me.reader = new FileReader();
            }
            me.reader.onload = function() {
                var data = me.reader.result;
                resolve(data);
            };
            let slice = file.slice(start, end);
            me.reader.readAsArrayBuffer(slice);
        });
    };
};
