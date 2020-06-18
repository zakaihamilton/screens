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
    };
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
        return new Promise((resolve, reject) => {
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
            CopySource: encodeURIComponent(fromBucketName + "/" + fromPath),
            Key: toPath
        };
        return new Promise((resolve, reject) => {
            me.s3.copyObject(params, async function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    await me.deleteFile(from);
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
        return new Promise((resolve, reject) => {
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
    me.metadata = async function (url) {
        const [bucketName, path] = me.parseUrl(url);
        const name = core.path.fileName(url, true);
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
        try {
            const data = await me.s3.headObject(params).promise();
            return {
                type: data.content_type,
                name,
                size: data.Size,
                date: data.lastModified
            };
        }
        catch (err) {
            const params = {
                Bucket: bucketName,
                Delimiter: "/",
                ...path && { Prefix: path + "/" }
            };
            const result = await me.s3.listObjects(params).promise();
            if (result.Contents.length > 0 || result.CommonPrefixes.length > 0) {
                return {
                    type: "application/x-directory",
                    name
                };
            }
        }
        return null;
    };
    me.exists = async function (url) {
        const metadata = await me.metadata(url);
        return metadata !== null;
    };
    me.list = async function (url) {
        const [bucketName, path] = me.parseUrl(url);
        const params = {
            Bucket: bucketName,
            Delimiter: "/",
            ...path && { Prefix: path + "/" }
        };
        if (!bucketName) {
            const result = await me.s3.listBuckets({}).promise();
            var buckets = [];
            result.Buckets.forEach(function (element) {
                buckets.push({
                    name: element.Name,
                    type: "bucket"
                });
            });
            return buckets;
        }
        const items = [];
        for (; ;) {
            const result = await me.s3.listObjects(params).promise();
            result.CommonPrefixes.forEach(prefix => {
                const name = core.path.fileName(prefix.Prefix.substring(0, prefix.Prefix.length - 1), true);
                items.push({
                    type: "application/x-directory",
                    name
                });
            });
            result.Contents.forEach(content => {
                const folder = core.path.folderPath(content.Key);
                if (path !== folder) {
                    return;
                }
                const name = core.path.fileName(content.Key, true);
                if (!name) {
                    return;
                }
                items.push({
                    type: content.content_type,
                    name,
                    size: content.Size,
                    date: content.lastModified
                });
            });
            if (result.IsTruncated && result.NextMarker) {
                params.Marker = result.NextMarker;
            }
            else {
                break;
            }
        }
        return items;
    };
    me.url = function (path) {
        let tokens = path.split("/");
        tokens.shift();
        let fileName = tokens.pop();
        path = tokens.join("/");
        var url = "https://" + me.cdn + "/" + path + "/" + encodeURIComponent(fileName);
        return url;
    };
    return "server";
};
