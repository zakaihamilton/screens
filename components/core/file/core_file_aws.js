COMPONENT.define("CoreFileAWS", {
    config: {
        protocol: /^aws:\\/,
        platform: "server"
    },
    init: function (me) {
        me.bufferSize = 10 * 1024 * 1024;
        let AWS = require("aws-sdk");
        me.fs = require("fs");
        const keys = JSON.parse(me.fs.readFileSync("private/aws.json"));
        const { accessKeyId, secretAccessKey, cdn } = keys;
        const endpoint = new AWS.Endpoint(keys.endpoint);
        me.s3 = new AWS.S3({
            endpoint,
            accessKeyId,
            secretAccessKey
        });
        me.cdn = cdn;
    },
    read: async function (options) {
        const me = this;
        let tokens = this._path.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path
        };
        let writeStream = null;
        let data = "";
        if (options.path) {
            writeStream = me.fs.createWriteStream(options.path);
        }
        return new Promise((resolve, reject) => {
            let readStream = me.s3.getObject(params).createReadStream({ bufferSize: me.bufferSize });
            readStream.on("error", reject);
            readStream.on("end", () => {
                resolve(data);
            });
            if (options.path) {
                readStream.pipe(writeStream);
            }
            else {
                readStream.on("data", chunk => {
                    data += chunk;
                });
            }
        });
    },
    write: async function (data, options) {
        const me = this;
        let tokens = this._path.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path,
            Body: options.path ? me.fs.createReadStream(options.path) : data,
            ACL: "public-read"
        };
        var s3Options = {
            partSize: me.bufferSize,
            queueSize: 10
        };
        return new Promise((resolve, reject) => {
            me.s3.upload(params, s3Options, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    },
    members: async function () {
        const me = this;
        let tokens = this._path.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName
        };
        return new Promise((resolve, reject) => {
            me.s3.listObjectsV2(params, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                var files = Array.from(data.Contents);
                files.map(file => {
                    file.name = file.Key;
                    file.size = file.Size;
                    delete file.Size;
                });
                resolve(files);
            });
        });
    },
    info: async function () {
        const me = this;
        let tokens = this._path.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise((resolve, reject) => {
            me.s3.headObject(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    },
    size: async function () {
        return (await this.info()).ContentLength;
    },
    exists: async function () {
        const me = this;
        let tokens = this._path.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise(resolve => {
            me.s3.headObject(params, err => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
});