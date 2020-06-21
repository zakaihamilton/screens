require("dotenv").config();

async function loadPrivate() {
    const {
        AWS_ENDPOINT,
        AWS_ACCESSKEYID,
        AWS_SECRETACCESSKEY,
        AWS_BUCKET,
        AWS_PRIVATEPATH
    } = process.env;
    if (AWS_ENDPOINT && AWS_ACCESSKEYID && AWS_SECRETACCESSKEY) {
        const AWS = require("aws-sdk");
        const endpoint = new AWS.Endpoint(AWS_ENDPOINT);
        const s3 = new AWS.S3({
            endpoint,
            accessKeyId: AWS_ACCESSKEYID,
            secretAccessKey: AWS_SECRETACCESSKEY
        });
        const fs = require("fs");
        const listResult = await s3.listObjects({
            Bucket: AWS_BUCKET,
            Delimiter: "/",
            ...AWS_PRIVATEPATH && { Prefix: AWS_PRIVATEPATH + "/" }
        }).promise();
        for (const content of listResult.Contents) {
            const { Key, LastModified } = content;
            const name = Key.split("/").pop();
            const localPath = "private/" + name;
            try {
                const stat = fs.statSync(localPath);
                if (stat) {
                    if (stat.mtime) {
                        const remoteDate = LastModified.toDateString();
                        const localDate = stat.mtime.toDateString();
                        if (remoteDate === localDate) {
                            continue;
                        }
                    }
                }
            }
            // eslint-disable-next-line no-empty
            catch (err) {

            }
            const writeStream = fs.createWriteStream(localPath);
            // eslint-disable-next-line no-console
            console.log("downloading: " + name);
            await new Promise((resolve, reject) => {
                let readStream = s3.getObject({
                    Bucket: AWS_BUCKET,
                    Key: Key
                }).createReadStream();
                readStream.on("error", reject);
                readStream.on("end", resolve);
                readStream.pipe(writeStream);
            });
        }
    }
}

function setup(callback) {
    loadPrivate().then(callback).catch(err => {
        // eslint-disable-next-line no-console
        console.error("Failed to setup screens: error: " + err);
    });
}

module.exports = {
    setup
};