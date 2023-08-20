var gptId = 's' + 'k-' + '4' + 'ENv' + '6UG' + 'ZC' + 'kn4' + 'xP' + 'Pz2x' + 'LFT3' + 'Bl' + 'bkFJY' + 'jrK' + 'IVjKqD9' + 'k6t' + 'Nm3' +'X9'+'s'

var big6_gptJsonPart = ['{"model": "gpt-4","messages": ['
    , '{"role": "user", "content": "hi"}'
    , '], "temperature": 1, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0}'];

function big6_gptReq() {
    let req = new XMLHttpRequest();
    req.open("POST", "https://api.openai.com/v1/chat/completions");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + gptId);
    return req;
}
async function big6_gptDivAsync(idDiv, sSrcJson) {
    try {
        let xhr = big6_gptReq();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4)
                if (xhr.status == 200) {
                    var json = JSON.parse(xhr.responseText);
                    document.getElementById(idDiv).innerHTML = json.choices[0].message.content; // text returned onto textarea (or other with value)
                    //json.choices[0].text; // text returned onto textarea (or other with value)
                }
                else {
                    try { console.log(JSON.parse(xhr.responseText).error.message); } catch (e) { console.log(xhr.status + " " + xhr.text); }
                }
        }
        //alert(idDiv);
        xhr.send('{"model": "gpt-4","messages": [' + sSrcJson + '], "temperature": 1, "max_tokens": 256, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0}');
    } catch (ex) { return ex.message }
    return null;
}

// show txt, then replace with result of query q
function big6_gptResult(txt, q) {
    var id = 'pending' + Math.floor(Math.random() * 0x100000000).toString(16);
    var sErr = big6_gptDivAsync(id, q);
    if (sErr != null)
        ret = sErr;
    return "<div id='"+ id + "'>" + txt + "</span>";
}