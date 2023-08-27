var gptId = null;// 's' + 'k-' + '4' + 'ENv' + '6UG' + 'ZC' + 'kn4' + 'xP' + 'Pz2x' + 'LFT3' + 'Bl' + 'bkFJY' + 'jrK' + 'IVjKqD9' + 'k6t' + 'Nm3' +'X9'+'s'

//var big6_gptJsonPartChat = ['{"model": "gpt-4","messages": ['
//    , '{"role": "user", "content": "hi"}'
//    , '], "temperature": 1, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0}'];

function big6_gptGetKeysFromUrl() {
    if (gptId == null) {
        let urlQ = new URLSearchParams(window.location.search);
        if (urlQ.get('keys') != null) gptId.value = urlQ.get('keys');
    }
}

function big6_gptGetKeysAsUrl(epilogIfKeys) {
    ret = "";
    let urlQ = new URLSearchParams(window.location.search);
    if (urlQ.get('keys') != null)
        ret = "keys=" + urlQ.get('keys') + epilogIfKeys;
    return ret;
}

function big6_gptReq(useChat) {
    big6_gptGetKeysFromUrl();
    let req = new XMLHttpRequest();
    req.open("POST", useChat ? "https://api.openai.com/v1/chat/completions" : "https://api.openai.com/v1/completions");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + gptId);
    return req;
}
async function big6_gptChatDivAsync(idDiv, sSrcJson) {
    try {
        let xhr = big6_gptReq();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4)
                if (xhr.status == 200) {
                    var json = JSON.parse(xhr.responseText);
                    document.getElementById(idDiv).innerHTML = json.choices[0].message.content;
                }
                else {
                    try { console.log(JSON.parse(xhr.responseText).error.message); } catch (e) { console.log(xhr.status + " " + xhr.text); }
                }
        }
        xhr.send('{"model": "gpt-4","messages": [' + sSrcJson + '], "temperature": 1, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0}');
    } catch (ex) { return ex.message }
    return null;
}
async function big6_gptNochatDivAsync(idDiv, sSrcJson) {
    try {
        let xhr = big6_gptReq();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4)
                if (xhr.status == 200) {
                    var json = JSON.parse(xhr.responseText);
                    document.getElementById(idDiv).innerHTML = json.choices[0].message.content;
                }
                else try { console.log(JSON.parse(xhr.responseText).error.message); } catch (e) { console.log(xhr.status + " " + xhr.text); }
        }
        xhr.send('{"model":"text-davinci-003","temperature":1,"prompt:"' + sSrcJson + '","temperature":0.7,"top_p":1,"frequency_penalty":0.75,"presence_penalty":0}');

    } catch (ex) { return ex.message }
    return null;
}

// show txt, then replace with result of query q
function big6_gptResult(txt, q, chat) { // console.log("big6_gptResult " + txt + " q " + q + " chat " + chat)
    var id = 'pending' + Math.floor(Math.random() * 0x100000000).toString(16);
    var sErr = chat ? big6_gptNochatDivAsync(id, q) : big6_gptChatDivAsync(id, q);
    if (sErr != null)
        ret = sErr;
    return "<div id='"+ id + "'>" + txt + "</span>";
}