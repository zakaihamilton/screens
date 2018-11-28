/*
 @author Zakai Hamilton
 @component MediaSpeech
 */

screens.media.speech = function MediaSpeech(me) {
    me.init = function () {
        const ffprobePath = require("@ffprobe-installer/ffprobe").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfprobePath(ffprobePath);
    };
    me.transcribed = function (path) {
        var transcriptPath = me.core.path.replaceExtension(path, "txt");
        return me.core.file.exists(transcriptPath);
    };
    me.transcribe = async function (path) {
        if (!path) {
            return null;
        }
        var transcriptPath = me.core.path.replaceExtension(path, "txt");

        var request = require("request");
        var fs = require("fs");
        var temp = require("temp").track();
        var async = require("async");

        var API_KEY = "AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw";

        var MAX_CONCURRENT = 20;
        var MAX_SEG_DUR = 10;
        var POST_SAMPLE_RATE = 44100;

        var totalDuration = 0;

        function getRequestOptions() {
            var pair = me.core.util.genPair();
            var streamUrl = "https://www.google.com/speech-api/full-duplex/v1/";
            var upstreamUrl = streamUrl + "up?";
            var upstreamParams = me.core.http.urlEncode({
                "output": "json",
                "lang": "en-us",
                "pfilter": 2,
                "key": API_KEY,
                "client": "chromium",
                "maxAlternatives": 1,
                "pair": pair
            });
            var otherOpts = ["continuous", "interim"];
            var upstreamOpts = {
                "url": upstreamUrl + upstreamParams + "&" + otherOpts.join("&"),
                "headers": {
                    "content-type": "audio/x-flac; rate=" + POST_SAMPLE_RATE
                },
            };
            var downstreamUrl = streamUrl + "down?";
            var downstreamParams = me.core.http.urlEncode({
                "pair": pair
            });
            var downstreamOpts = {
                "url": downstreamUrl + downstreamParams,
            };
            return [upstreamOpts, downstreamOpts];
        }

        function getTranscriptFromServer(params, onfinish) {
            if (!params.file) {
                onfinish(null, {
                    text: "",
                    start: params.start,
                    error: new Error("No file is specified. Please specify a file path through params.file")
                });
                return;
            }
            var file_name = params.file;
            var source = fs.createReadStream(file_name);
            source.on("error", function (err) {
                onfinish(null, {
                    text: "",
                    start: params.start,
                    error: err
                });
            });
            var opts = getRequestOptions();
            var upstreamOpts = opts[0];
            var downstreamOpts = opts[1];
            var postReq = request.post(upstreamOpts, error => {
                if (error) {
                    onfinish(null, {
                        text: "",
                        start: params.start,
                        error: error
                    });
                }
            });

            source.pipe(postReq);

            request.get(downstreamOpts, function (error, res, body) {
                if (error) {
                    onfinish(null, { text: "", start: params.start, error: error });
                    return;
                }
                try {
                    var results = body.split("\n");
                    var last_result = JSON.parse(results[results.length - 2]);
                    var text = last_result.result[0].alternative[0].transcript;
                    onfinish(null, {
                        text: text,
                        start: params.start,
                        duration: params.duration
                    });
                }
                catch (e) {
                    params.retries = params.retries | 0;
                    if (params.retries < maxRetries) {
                        params.retries++;
                        getTranscriptFromServer(params, onfinish);
                        return;
                    }
                    onfinish(null, {
                        text: "",
                        start: params.start,
                        error: new Error("Could not get valid response from Google servers "
                            + "for segment starting at second " + params.start)
                    });
                }
            });
        }

        function processAudioSegment(data, onfinish) {
            var start = data.start;
            var dur = data.duration;
            var tmpFile = temp.path({ suffix: ".flac" });
            me.ffmpeg()
                .on("error", function (err) {
                    onfinish(null, { start: start, text: "", error: err });
                })
                .on("end", function () {
                    getTranscriptFromServer({
                        "file": tmpFile,
                        "start": start,
                        "duration": dur
                    }, (err, result) => {
                        result.error = err;
                        onfinish(null, result);
                    });
                })
                .input(file)
                .setStartTime(start)
                .duration(dur)
                .output(tmpFile)
                .audioFrequency(POST_SAMPLE_RATE)
                .toFormat("flac")
                .run();
        }

        var options = { file: path };
        var file = options.file || options;
        var segments = options.segments;
        var maxDuration = options.maxDuration | MAX_SEG_DUR;
        var maxRetries = options.maxRetries | 1;
        var limitConcurrent = options.limitConcurrent | MAX_CONCURRENT;

        return new Promise((resolve, reject) => {
            me.ffmpeg.ffprobe(file, function (err, info) {
                if (err) {
                    var error = "Cannot transcribe path: " + path + " context: ffprobe error: " + err;
                    me.log_error(error);
                    reject(error);
                    return;
                }
                var audioSegments = [];
                totalDuration = info.format.duration;
                if (segments) {
                    for (var i = 0; i < segments.length; i++) {
                        var duration = (i == segments.length - 1) ? totalDuration - segments[i] : segments[i + 1] - segments[i];
                        var curStart = segments[i];
                        while (duration > maxDuration + .001) {
                            audioSegments.push({
                                "start": curStart,
                                "duration": maxDuration
                            });
                            duration -= maxDuration;
                            curStart += maxDuration;
                        }
                        audioSegments.push({
                            "start": curStart,
                            "duration": duration
                        });
                    }
                }
                else {
                    var numSegments = Math.ceil(totalDuration / maxDuration);
                    for (var segmentIndex = 0; segmentIndex < numSegments; segmentIndex++) {
                        audioSegments.push({
                            "start": maxDuration * segmentIndex,
                            "duration": maxDuration
                        });
                    }
                }

                async.mapLimit(audioSegments, limitConcurrent, processAudioSegment, function (err, results) {
                    if (err) {
                        var error = "Cannot transcribe path: " + path + "context: processAudioSegment error: " + err;
                        me.log_error(error);
                        reject(error);
                        return;
                    }
                    var timedTranscript = results.sort(function (a, b) {
                        if (a.start < b.start) return -1;
                        if (a.start > b.start) return 1;
                        return 0;
                    });

                    var result = timedTranscript.map(entry => {
                        return me.core.string.formatDuration(entry.start) + " - " + entry.text;
                    }).join("\n");
                    me.core.file.writeFile(transcriptPath, result);
                    me.log("Transcript written to " + transcriptPath);
                    resolve(transcriptPath);
                });
            });
        });
    };
    return "server";
};
