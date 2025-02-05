/*
 @author Zakai Hamilton
 @component GenShorts
 */

screens.gen.short = function genShorts(me, { core }) {
    me.init = function () {
        const ffprobePath = require("@ffprobe-installer/ffprobe").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfprobePath(ffprobePath);
        me.path = require("path");
        me.createCanvas = require("canvas").createCanvas;
        me.fs = require("fs/promises");
        me.util = require("util");
        me.exec = me.util.promisify(require("child_process").exec);
        core.property.link("core.http.receive", "gen.short.receive", true);
        me.http = require("http");
    };

    me.generate = async function (seed = 0) {
        const width = 256;
        const height = 256;
        const fps = 30;
        const duration = 5;
        const totalFrames = fps * duration;
        const maxSquares = 20;

        seed = seed || Math.floor(Date.now() % 1000) + 1;

        const frameDir = me.path.join("cache", "frames-" + seed.toString());
        const videoFolder = me.path.join("cache", "video");
        const videoPath = me.path.join("cache", "video", seed.toString() + ".mp4");

        try {
            await me.fs.rm(frameDir, { recursive: true, force: true }).catch(() => { });
            await me.fs.unlink(videoPath).catch(() => { });

            await me.fs.mkdir(videoFolder, { recursive: true });
            await me.fs.mkdir(frameDir, { recursive: true });

            const framePromises = [];
            for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
                framePromises.push(me.createAndSaveFrame(frameDir, seed, frameNum, width, height, maxSquares));
            }
            await Promise.all(framePromises);

            await new Promise((resolve, reject) => {
                me.ffmpeg()
                    .input(`${frameDir}/frame_%04d.png`)
                    .inputOptions([`-framerate ${fps}`])
                    .videoCodec("libx264")
                    .output(videoPath)
                    .on("end", () => {
                        console.log(`Video created successfully: ${videoPath}`);
                        resolve();
                    })
                    .on("error", (err) => {
                        console.error(`Error creating video: ${err.message}`);
                        reject();
                    })
                    .run();
            });

            return videoPath;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error creating video:", error);
            await me.fs.rm(frameDir, { recursive: true, force: true }).catch(() => { });
            await me.fs.unlink(videoPath).catch(() => { });
        } finally {
            await me.fs.rm(frameDir, { recursive: true, force: true }).catch(() => { });
        }
    };

    me.createFrame = function (seed, frameNum, width, height, maxSquares) {
        const canvas = me.createCanvas();
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        const numSquaresX = 10;
        const numSquaresY = Math.floor(numSquaresX * height / width);
        const squareWidth = width / numSquaresX;
        const squareHeight = height / numSquaresY;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        const prng = me.mulberry32(seed); // Seed only for consistent color
        const color = me.getColor(seed); // Single color per video

        let squaresAnimated = 0;

        for (let y = 0; y < numSquaresY; y++) {
            for (let x = 0; x < numSquaresX; x++) {
                if (prng() < 0.1 && squaresAnimated < maxSquares) {
                    const cellPrng = me.mulberry32(seed + x * 100 + y * 1000); // PRNG for cell movement

                    const directionX = cellPrng() < 0.5 ? 1 : -1;
                    const directionY = cellPrng() < 0.5 ? 1 : -1;

                    const offsetX = Math.floor(Math.sin((frameNum + x * 2 + y * 3 + cellPrng() * 1000) * 0.1 * directionX)) * squareWidth;
                    const offsetY = Math.floor(Math.cos((frameNum + x * 3 + y * 2 + cellPrng() * 1000) * 0.1 * directionY)) * squareHeight;

                    const drawX = x * squareWidth + offsetX;
                    const drawY = y * squareHeight + offsetY;

                    ctx.fillStyle = color; // Use the single video color
                    ctx.fillRect(drawX, drawY, squareWidth, squareHeight);

                    squaresAnimated++;
                }
            }
        }

        return canvas;
    };

    me.getColor = function (combinedSeed) {
        const prng = me.mulberry32(combinedSeed);
        const r = Math.floor(prng() * 256);
        const g = Math.floor(prng() * 256);
        const b = Math.floor(prng() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    };

    me.mulberry32 = function (a) {
        return function () {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };

    me.createAndSaveFrame = async function (frameDir, seed, frameNum, width, height, maxSquares) {
        const canvas = me.createFrame(seed, frameNum, width, height, maxSquares);
        const buffer = canvas.toBuffer("image/png");
        await me.fs.writeFile(`${frameDir}/frame_${frameNum.toString().padStart(4, "0")}.png`, buffer);
    };

    me.receive = async function (info) {
        if (me.platform === "server" && info.method === "GET" && info.url.startsWith("/api/gen/short")) {
            const { id } = info.query;
            const outputFile = await me.generate(id);
            if (!outputFile) {
                return;
            }
            let mimeType = "video/mp4";
            info.custom = true;
            core.stream.serve(info.headers, info.response, outputFile, mimeType);
        }
    };

    return "server";
};
