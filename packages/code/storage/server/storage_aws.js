/*
 @author Zakai Hamilton
 @component StorageAWS
 */

screens.storage.aws = function StorageAWS(me, { core }) {
    me.bufferSize = 10 * 1024 * 1024;
    me.init = async function () {
        me.aws = require("@aws-sdk/client-s3");
        const { createReadStream, createWriteStream } = require("fs");
        const keys = await core.private.keys("aws");
        let { accessKeyId, secretAccessKey, endpoint, cdn, bucket } = keys;
        const region = endpoint.split(".")[1];
        const s3Client = new me.aws.S3Client({
            region,
            endpoint: "https://" + endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });
        me.s3Client = s3Client;
        me.createReadStream = createReadStream;
        me.createWriteStream = createWriteStream;
        me.cdn = cdn;
        me.bucket = bucket;
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
    me.uploadFile = async function (from, to) {
        const [bucketName, path] = me.parseUrl(to);
        const uploadParams = {
            Bucket: bucketName,
            Key: path,
            Body: me.createReadStream(from),
            ACL: "public-read"
        };
        const command = new me.aws.PutObjectCommand(uploadParams);
        const response = await me.s3Client.send(command);
        return response;
    };
    me.downloadFile = async function (from, to) {
        const [bucketName, path] = me.parseUrl(from);
        const downloadParams = {
            Bucket: bucketName,
            Key: path
        };
        const writeStream = me.createWriteStream(to);
        const command = new me.aws.GetObjectCommand(downloadParams);
        const response = await me.s3Client.send(command);
        response.Body.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
        });
    };
    me.uploadData = async function (url, data) {
        const [bucketName, path] = me.parseUrl(url);
        const uploadParams = {
            Bucket: bucketName,
            Key: path,
            Body: data,
            ACL: "public-read"
        };
        const command = new me.aws.PutObjectCommand(uploadParams);
        const response = await me.s3Client.send(command);
        return response;
    };
    me.downloadData = async function (url) {
        const [bucketName, path] = me.parseUrl(url);
        const downloadParams = {
            Bucket: bucketName,
            Key: path
        };
        const command = new me.aws.GetObjectCommand(downloadParams);
        const response = await me.s3Client.send(command);
        return response.Body.toString();
    };
    me.copyFile = async function (from, to) {
        const [fromBucketName, fromPath] = me.parseUrl(from);
        const [toBucketName, toPath] = me.parseUrl(to);
        const copyParams = {
            Bucket: toBucketName,
            CopySource: `/${fromBucketName}/${fromPath}`,
            Key: toPath
        };
        const command = new me.aws.CopyObjectCommand(copyParams);
        const response = await me.s3Client.send(command);
        return response;
    };
    me.moveFile = async function (from, to) {
        const [fromBucketName, fromPath] = me.parseUrl(from);
        const [toBucketName, toPath] = me.parseUrl(to);
        const copyParams = {
            Bucket: toBucketName,
            CopySource: encodeURIComponent(`/${fromBucketName}/${fromPath}`),
            Key: toPath
        };
        const copyCommand = new me.aws.CopyObjectCommand(copyParams);
        const copyResponse = await me.s3Client.send(copyCommand);
        const deleteParams = {
            Bucket: fromBucketName,
            Key: fromPath
        };
        const deleteCommand = new me.aws.DeleteObjectCommand(deleteParams);
        await me.s3Client.send(deleteCommand);
        return copyResponse;
    };
    me.deleteFile = async function (url) {
        const [bucketName, path] = me.parseUrl(url);
        const deleteParams = {
            Bucket: bucketName,
            Key: path
        };
        const command = new me.aws.DeleteObjectCommand(deleteParams);
        const response = await me.s3Client.send(command);
        return response;
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
        const headParams = {
            Bucket: bucketName,
            Key: path
        };
        const command = new me.aws.HeadObjectCommand(headParams);
        try {
            const response = await me.s3Client.send(command);
            return {
                type: response.ContentType,
                name,
                size: response.ContentLength,
                date: response.LastModified.valueOf()
            };
        } catch (err) {
            const listParams = {
                Bucket: bucketName,
                Delimiter: "/",
                ...(path && { Prefix: path + "/" })
            };
            const command = new me.aws.ListObjectsCommand(listParams);
            const result = await me.s3Client.send(command);
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
        const listParams = {
            Bucket: bucketName,
            Delimiter: "/",
            ...(path && { Prefix: path + "/" })
        };
        if (!bucketName) {
            const result = await me.s3Client.listBuckets({});
            var buckets = [];
            if (result && result.Buckets) {
                result.Buckets.forEach(function (element) {
                    buckets.push({
                        name: element.Name,
                        type: "bucket"
                    });
                });
            }
            return buckets;
        }
        const items = [];
        let continuationToken;
        do {
            listParams.ContinuationToken = continuationToken;
            const command = new me.aws.ListObjectsCommand(listParams);
            const result = await me.s3Client.send(command);
            if (result && result.CommonPrefixes) {
                result.CommonPrefixes.forEach(prefix => {
                    const name = core.path.fileName(prefix.Prefix.substring(0, prefix.Prefix.length - 1), true);
                    items.push({
                        type: "application/x-directory",
                        name
                    });
                });
            }
            if (result && result.Contents) {
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
                        type: content.ContentType,
                        name,
                        size: content.Size,
                        date: content.LastModified.valueOf()
                    });
                });
            }
            continuationToken = result.NextContinuationToken;
        } while (continuationToken);
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
