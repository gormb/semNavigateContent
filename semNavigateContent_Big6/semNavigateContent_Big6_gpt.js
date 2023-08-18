
function oaiReq(url) {
    let req = new XMLHttpRequest();
    req.open("POST", url != null ? url : "https://api.openai.com/v1/completions");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + gptId.value);
    return req;
}
function oaiReqDaE() { return oaiReq("https://api.openai.com/v1/images/generations"); }
function oaiReqGpt() { return oaiReq("https://api.openai.com/v1/completions"); }
async function oaiHtmlItemAsync(cDest, sSrc, isImage, doneC, errC, maxTokens, stopArray) {
    if (isImage == null) isImage = 0;
    let xhr = isImage == 1 ? oaiReqDaE() : oaiReqGpt();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4)
            if (xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
                if (isImage == 1) cDest.src = json.data[0].url; // url for image
                else if (cDest.value != null) cDest.value = json.choices[0].text;
                else cDest.innerHTML = json.choices[0].text; // text returned onto textarea (or other with value)
                if (doneC != null) doneC(cDest);
            }
            else {
                let errT = "error";
                try { errT = JSON.parse(xhr.responseText).error.message; } catch (e) { errT = xhr.status + " " + xhr.text }
                if (errC != null) errC(errT);
                else console.log(errT);
            }
    }
    xhr.send(oaiJson(sSrc, isImage, maxTokens, stopArray));
}

// show txt, then replace with result of query q
function big6_gptResult(txt, q) {
    var id = 'pending' + Math.floor(Math.random() * 0x100000000).toString(16);
    return "<span id='"+ id + "'>" + txt + "</span>";
}