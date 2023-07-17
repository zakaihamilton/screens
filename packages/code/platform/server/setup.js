require("dotenv").config();
const { S3Client, ListObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createWriteStream, promises: statSync } = require("fs");

async function loadPrivate() {
    const {
        AWS_ENDPOINT,
        AWS_ACCESSKEYID,
        AWS_SECRETACCESSKEY,
        AWS_BUCKET,
        AWS_PRIVATEPATH
    } = process.env;
    if (AWS_ENDPOINT && AWS_ACCESSKEYID && AWS_SECRETACCESSKEY) {
        console.log("checking private AWS configuration...");
        const region = AWS_ENDPOINT.split(".")[1];
        const s3Client = new S3Client({
            region,
            endpoint: "https://" + AWS_ENDPOINT,
            credentials: {
                accessKeyId: AWS_ACCESSKEYID,
                secretAccessKey: AWS_SECRETACCESSKEY
            }
        });
        const { Contents } = await s3Client.send(new ListObjectsCommand({
            Bucket: AWS_BUCKET,
            Delimiter: "/",
            ...(AWS_PRIVATEPATH && { Prefix: AWS_PRIVATEPATH + "/" })
        }));
        for (const content of Contents) {
            const { Key, LastModified, Size } = content;
            const name = Key.split("/").pop();
            const localPath = "private/" + name;
            try {
                const stat = statSync(localPath);
                if (stat) {
                    if (stat.mtime) {
                        const remoteDate = LastModified.toDateString();
                        const remoteSize = Size;
                        const localDate = stat.mtime.toDateString();
                        const localSize = stat.size;
                        if (remoteDate === localDate && localSize === remoteSize) {
                            continue;
                        }
                    }
                }
            } catch (err) {
                // Ignore the error
            }
            const writeStream = createWriteStream(localPath);
            console.log("downloading: " + name);
            await new Promise((resolve, reject) => {
                s3Client.send(new GetObjectCommand({
                    Bucket: AWS_BUCKET,
                    Key: Key
                })).then(response => {
                    response.Body.pipe(writeStream)
                        .on("error", reject)
                        .on("close", resolve);
                }).catch(reject);
            });
        }
    }
}

function setup(callback) {
    loadPrivate().then(() => {
        console.log("loading screens...");
        callback();
    }).catch(err => {
        console.error("Failed to setup screens: error: " + err);
    });
}

module.exports = {
    setup
};