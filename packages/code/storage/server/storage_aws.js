/*
 @author Zakai Hamilton
 @component StorageAWS
 */

screens.storage.aws = function StorageAWS(me, packages) {
    const { core } = packages;
    me.init = async function () {
        let AWS = require("aws-sdk");
        let keys = await core.private.keys("aws");
        let { accessKeyId, secretAccessKey, endpoint } = keys;
        endpoint = new AWS.Endpoint(endpoint);
        me.s3 = new AWS.S3({
            endpoint,
            accessKeyId,
            secretAccessKey
        });
        me.fs = require("fs");
    };
    me.uploadFile = function (from, to) {
        let tokens = to.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path,
            Body: me.fs.createReadStream(from)
        };
        var options = {
            partSize: 10 * 1024 * 1024,
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
    me.downloadFile = async function (from, to) {
        let tokens = from.split("/");
        let bucketName = tokens.shift();
        let path = tokens.join("/");
        var params = {
            Bucket: bucketName,
            Key: path
        };
        const file = me.fs.createWriteStream(to);
        var data = await me.s3.getObject(params).promise();
        return new Promise(resolve => {
            file.write(data.Body, () => {
                file.end();
                resolve();
            });
        });
    };
    me.exists = function (path) {
        let tokens = path.split("/");
        let bucketName = tokens.shift();
        path = tokens.join("/");
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
    me.list = function (path) {
        let tokens = path.split("/");
        let bucketName = tokens.shift();
        path = tokens.join("/");
        var params = {
            Bucket: bucketName
        };
        return new Promise((resolve, reject) => {
            me.s3.listObjectsV2(params, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                var files = [];
                data.Contents.forEach(function (element) {
                    files.push({
                        name: element.Key,
                        size: element.Size,
                        date: element.lastModified
                    });
                });
                resolve(files);
            });
        });
    };
    return "server";
};