/*
 @author Zakai Hamilton
 @component StorageAWS
 */

screens.storage.aws = function StorageAWS(me, { core }) {
    me.bufferSize = 10 * 1024 * 1024;
    me.init = async function () {
        let AWS = require("aws-sdk");
        let keys = await core.private.keys("aws");
        let { accessKeyId, secretAccessKey, endpoint, cdn } = keys;
        endpoint = new AWS.Endpoint(endpoint);
        me.s3 = new AWS.S3({
            endpoint,
            accessKeyId,
            secretAccessKey
        });
        me.fs = require("fs");
        me.cdn = cdn;
    };
    me.parseUrl = function (path) {
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        let tokens = path.split("/");
        let bucketName = tokens.shift();
        path = tokens.join("/");
        return [bucketName, path];
    }
    me.uploadFile = function (from, to) {
        const [bucketName, path] = me.parseUrl(to);
        var params = {
            Bucket: bucketName,
            Key: path,
            Body: me.fs.createReadStream(from),
            ACL: "public-read"
        };
        var options = {
            partSize: me.bufferSize,
            queueSize: 10
        };
        return new Promise((resolve, reject) => {
            me.s3.upload(params, options, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.downloadFile = function (from, to) {
        const [bucketName, path] = me.parseUrl(from);
        var params = {
            Bucket: bucketName,
            Key: path
        };
        const writeStream = me.fs.createWriteStream(to);
        return new Promise((resolve, reject) => {
            let readStream = me.s3.getObject(params).createReadStream({ bufferSize: me.bufferSize });
            readStream.on("error", reject);
            readStream.on("end", resolve);
            readStream.pipe(writeStream);
        });
    };
    me.uploadData = function (url, data) {
        const [bucketName, path] = me.parseUrl(url);
        var params = {
            Bucket: bucketName,
            Key: path,
            Body: data,
            ACL: "public-read"
        };
        var options = {
            partSize: me.bufferSize,
            queueSize: 10
        };
        return new Promise((resolve, reject) => {
            me.s3.upload(params, options, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.downloadData = function (url) {
        const [bucketName, path] = me.parseUrl(url);
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise((resolve, reject) => {
            me.s3.getObject(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Body.toString());
                }
            });
        });
    };
    me.copyFile = function (from, to) {
        const [fromBucketName, fromPath] = me.parseUrl(from);
        const [toBucketName, toPath] = me.parseUrl(to);
        var params = {
            Bucket: toBucketName,
            CopySource: fromBucketName + "/" + fromPath,
            Key: toPath
        };
        return new Promise(resolve => {
            me.s3.copyObject(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.moveFile = function (from, to) {
        const [fromBucketName, fromPath] = me.parseUrl(from);
        const [toBucketName, toPath] = me.parseUrl(to);
        var params = {
            Bucket: toBucketName,
            CopySource: fromBucketName + "/" + fromPath,
            Key: toPath
        };
        return new Promise(resolve => {
            me.s3.copyObject(params, async function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    await deleteFile(from);
                    resolve(data);
                }
            });
        });
    };
    me.deleteFile = function (url) {
        const [bucketName, path] = me.parseUrl(url);
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise(resolve => {
            me.s3.deleteObject(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.metadata = function (url) {
        const [bucketName, path] = me.parseUrl(url);
        if (!path) {
            return {
                type: "application/x-directory",
                name: bucketName
            };
        }
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise(resolve => {
            me.s3.headObject(params, function (err, data) {
                if (err) {
                    resolve(null);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.exists = function (url) {
        const [bucketName, path] = me.parseUrl(url);
        var params = {
            Bucket: bucketName,
            Key: path
        };
        return new Promise(resolve => {
            me.s3.headObject(params, function (err, resp, body) {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    me.list = function (url) {
        const [bucketName, path] = me.parseUrl(url);
        var params = {
            Bucket: bucketName
        };
        if (!bucketName) {
            return new Promise((resolve, reject) => {
                me.s3.listBuckets({}, function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var buckets = [];
                    data.Buckets.forEach(function (element) {
                        buckets.push({
                            name: element.Name,
                            type: "application/x-directory"
                        });
                    });
                    resolve(buckets);
                });
            });
        }
        return new Promise((resolve, reject) => {
            me.s3.listObjectsV2(params, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                var files = [];
                data.Contents.forEach(function (element) {
                    files.push({
                        type: element.content_type,
                        name: element.Key,
                        size: element.Size,
                        date: element.lastModified
                    });
                });
                resolve(files);
            });
        });
    };
    me.url = function (path) {
        let tokens = path.split("/");
        tokens.shift();
        let groupName = tokens.shift().toLowerCase();
        path = tokens.join("/");
        var url = "https://" + me.cdn + "/" + groupName + "/" + encodeURIComponent(path);
        return url;
    };
    return "server";
};