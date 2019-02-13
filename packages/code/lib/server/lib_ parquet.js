/*
 @author Zakai Hamilton
 @component LibParquet
 */

screens.lib.parquet = function LibParquet(me) {
    me.init = function () {
        me.parquet = require("parquet");
    };
    me.write = async function (path, schema, records) {
        let options = {
            compression: "SNAPPY"
        };
        schema = new me.parquet.ParquetSchema(schema);
        var writer = await me.parquet.ParquetWriter.openFile(schema, path, options);
        for (var record of records) {
            await writer.appendRow(record);
        }
        await writer.close();
    };
    me.read = async function (path, filter) {
        let reader = await me.parquet.ParquetReader.openFile(path);
        let schema = reader.getSchema();
        let cursor = reader.getCursor(filter);
        var records = [];
        let record = null;
        while ((record = await cursor.next())) {
            records.push(record);
        }
        await reader.close();
        return { schema, records };
    };
    return "server";
};
