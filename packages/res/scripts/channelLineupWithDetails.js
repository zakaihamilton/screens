/*
1. Read channelsLineup.json
2. Traverse servicePresentationData.services
3. Read logical channel number
4. Read template and apply template to each service
5. Output new file
*/

var me = me, object = object;

async function run() {
    var window = me.widget.window.get(object);
    var channelsLineup = await me.content(window, "channelsLineup.json");
    var channelDetails = await me.content(window, "channelDetails.json");
    if (!channelsLineup) {
        alert("channelsLineup.json not loaded in files or is an empty file");
        return;
    }
    if (!channelDetails) {
        alert("channelDetails.json not loaded in files or is an empty file");
        return;
    }
    try {
        var channelsLineup = JSON.parse(channelsLineup);
    }
    catch (err) {
        alert("Invalid json: " + err + " content: " + channelsLineup);
    }
    try {
        var channelDetails = JSON.parse(channelDetails);
    }
    catch (err) {
        alert("Invalid json: " + err + " content: " + channelDetails);
    }
    var services = channelsLineup.servicePresentationData.services;
    services = services.map(service => {
        let LCN = service.logicalChannelNumber;
        let SEK = service.SEK;
        service = Object.assign(service, channelDetails);
        let text = JSON.stringify(service);
        text = text.replace(/{LCN}/g, LCN);
        text = text.replace(/{SEK}/g, SEK);
        service = JSON.parse(text);
        return service;
    });
    channelsLineup.servicePresentationData.services = services;
    me.output(window, "output.json", JSON.stringify(channelsLineup), true);
}

run();