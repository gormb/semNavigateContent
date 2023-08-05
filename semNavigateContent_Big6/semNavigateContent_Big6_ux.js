function ux_Click_Reset() {
    big6_Url_Set('', 1);
    bResults.style.display = 'none';
    big6_testIndex = 0;
    big6_SetButtons();
}
function ux_Click_Next() {
    big6_Url_Set('!', 0);
    TraitsUpdate();
    big6_SetButtons();
}
function ux_Click_Skip() {
    big6_Url_Set('-', 0);
    TraitsUpdate();
    big6_SetButtons();
}
function ux_Click_Results() {
    big6_Url_Set('$', 0);
    big6_traits_ShowAsHtm(null);
}
function big6_Url_Set(a, clear) { // history.pushState(nextState, nextTitle, nextURL);
    console.log("big6_Url " + a + " " + clear);
    if (a == '!' || a == '-') // Add values of the choices made
        a = big6_menu[0][i_beliefid] + (big6_bYes == 0 ? "y" : (big6_bNo == 0 ? "n" : ".")) + big6_menu[0][i_attitudetype] + ","
          + big6_menu[1][i_beliefid] + (big6_bYes == 1 ? "y" : (big6_bNo == 1 ? "n" : ".")) + big6_menu[1][i_attitudetype] + "," 
          + big6_menu[2][i_beliefid] + (big6_bYes == 2 ? "y" : (big6_bNo == 2 ? "n" : ".")) + big6_menu[2][i_attitudetype] + "," 
          + big6_menu[3][i_beliefid] + (big6_bYes == 3 ? "y" : (big6_bNo == 3 ? "n" : ".")) + big6_menu[3][i_attitudetype] + "," 
          + a; // 311000y0,332000n3,332000.1,332000.0,! 
    if (!clear) {
        console.log(a);
        if (a.length == 0) a = new URLSearchParams(window.location.search).get('test').toString();
        else a = new URLSearchParams(window.location.search).get('test').toString() + "," + a;
    }
    history.pushState(null, '', "?test=" + a);
    console.log("big6_Url_Set -> " + window.location.search);
}

function big6_Url_Simulate(a) { // window.location.search = "?test=300000,311000y0,332000n3,332000.1,332000.0,!,$";
    // new URLSearchParams(window.location.search).get('test').toString();// 300000,311000y0,332000n3,332000.1,332000.0,!,$ // Select test 30000, score 311000 yes to 0,332000 no to 3,332000 1 not chosen,332000 0 not chosen, press next
    try { a = a.split(",");} catch(e) { console.log(e);}
    var ignoreI = 3;
    for (var i=0;i<a.length;i++) {
        var v = a[i];
        var v_y = v.split("y"), v_n = v.split("n"), v_i = v.split(".");
        if (v_y.length == 2) { // console.log("yes " + v_y[0] + " " + v_y[1]);
            big6_menu[0] = big6_statements[big6_statements_i(v_y[0], v_y[1])];
            big6_SetButton(0, big6_menu[0]);
            big6_bNo = big6_bYes = -1;
            selectButton(0, b0);
        }
        else if (v_n.length == 2) { // console.log("no " + v_n[0] + " " + v_n[1]);
            big6_menu[1] = big6_statements[big6_statements_i(v_n[0], v_n[1])];
            big6_SetButton(1, big6_menu[1]); 
            big6_bNo = -1;
            selectButton(1, b1);
        }
        else if (v_i.length == 2) { // console.log("ignore " + v_i[0] + " " + v_i[1])
            ignoreI = ignoreI == 2 ? 3 : 2; // swap ignore between 2 and 3
            big6_menu[ignoreI] = big6_statements[big6_statements_i(v_i[0], v_i[1])];
            big6_SetButton(ignoreI, big6_menu[ignoreI]); 
        }
        else if (v == '!' || v == '-') { // console.log("commit");
            TraitsUpdate();big6_SetButtons() 
        }
        else if (v == '$') { // console.log("show results");
            big6_traits_ShowAsHtm(null); 
        }
        else if (Number.isInteger(parseInt(v))) { // console.log("select test " + v);
            big6_SetTestIndex(v);
            TraitsPopulate();
            big6_SetButtons(); // populate the first statement
        }
    }
}

function big6_test_AsHtm(testIndex = big6_testIndex) {
    var i = big6_i(testIndex);
    return "<h2>" + big6[i][i_belieftext] + "</h2>" + "<p>" + big6[i][i_consequence] + "</p>";
}

function big6_score_AsHtm(trait) {
    var cols = 2;
    var h = "<h3>" + trait[i_trait][i_belieftext] + "</h3>";
    var len = trait[i_statements].length;
    h += "<h4>&#x2714;:" + (len==0 ? "?" : Math.trunc(50 + (50 * trait[i_yesno])/len) + "% ") 
        + "&#x1F4CC;&#x1F6A8;:" + (len==0 ? "?" : Math.trunc(50 + (50 * trait[i_opportunitythreat])/len) + "%") 
        + "</h4>";
    h += "<p>" + trait[i_trait][i_consequence] + "</p>";
    h += "<table>";//<tr><th>Statement</th><th>Score</th><th>Attractiveness</th></tr>";
    for (var i=0;i<len;i++) {
        var rep = trait[i_statements][i];
        if (i % cols == 0) h += '<tr>'
        h += '<td style="border-width: 5px;border-color:'+ (rep[i_answer] > 0 ? 'green' : 'red') +'">'+rep[i_belieftext]+'</td>';
        if (i % cols == cols - 1) h += '</tr>'
    }
    if (len % cols == 1) h += '<td style="border-width: 0px;"></td></tr>'
    h += "</table>";
    return h;
} //= new Array(), i_trait=0, i_statements = 1, i_yesno=2, i_opportunitythreat=3;

var big6_traits_ShowAsHtm_lastShow = -1;
function big6_traits_ShowAsHtm(i) {
    if (i == null) { // Show all traits
        var h = big6_test_AsHtm() + "<h1>&#x1F4C8;</h1>";
        for (var t=0;t<big6_scores.length;t++)
            h += "<hr>" + big6_score_AsHtm(big6_scores[t], 1);
        traitsDetail.innerHTML = h;
        traitDetailsTable.style.display='table';
    }
    else if (big6_traits_ShowAsHtm_lastShow != i) { // trait clicked; show trait details and relevant statement chosen
        big6_traits_ShowAsHtm_lastShow = i;
        traitsDetail.innerHTML = big6_score_AsHtm(big6_scores[i], 2);
        traitDetailsTable.style.display='table';
    }
    else { // second click; hide
        traitDetailsTable.style.display='none';
        big6_traits_ShowAsHtm_lastShow = -1;
    }
}
function big6_Text(b6i, f, addIfContent) {
    var t = big6[b6i];
    var res = t[f];
    // replace html characters with normal characters
    res = res.replace(/&shy;/g, "");
    res = res.replace(/&nbsp;/g, "");
    res = res.replace(/&amp;/g, "&");
    res = res.replace(/&lt;/g, "<");
    res = res.replace(/&gt;/g, ">");
    res = res.replace(/&quot;/g, "\"");
    res = res.replace(/&apos;/g, "'");
    res = res.replace(/&cent;/g, "¢");
    res = res.replace(/&pound;/g, "£");
    res = res.replace(/&yen;/g, "¥");
    res = res.replace(/&euro;/g, "€");
    res = res.replace(/&copy;/g, "©");
    res = res.replace(/&reg;/g, "®");
    res = res.replace(/&trade;/g, "™");
    res = res.replace(/&times;/g, "×");
    if (addIfContent != null && res != "") res += addIfContent;
    return res;
}
function big6_prompt_FromIds(a)
{
    var res = a.length == 0 ? "0" : a[a.length - 1] + "\t" + (a.length == 1 ? "-1" : a[a.length - 2]) + "\t"; // two last id's
    for (var i = 0; i < a.length; i++) { // i_beliefid=0,i_parentid=1,i_belieftext=2,i_consequence=3,i_attitudeyesopportunity=4,i_attitudenoopportunity=5,i_attitudeyesthreat=6,i_attitudenothreat=7
        var b6i = big6_i(a[i]);
        switch (i) {
            case 0: res += big6_Text(b6i, i_belieftext, ". "); break;  
        }
        res += big6_Text(b6i, i_belieftext , ". ") + big6_Text(b6i, i_consequence, ". ");
        // i_beliefid=0,i_parentid=1,i_belieftext=2,i_consequence
    }
    return res;
}

function big6_editTests_AsHtm_AddTest() { return "<button onclick='alert(\"Buy pro-version\");'>+</button>"; }
function big6_editTests_PromptsButton_Click(b, prompt) {
    // Create prompt from ID's'
    prompt = big6_prompt_FromIds(prompt.split(' '));
    // Add prompt to clipboard
    var textArea = document.createElement("textarea");
    textArea.value = prompt;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    // remove content from parent after button but keep the button and everything before it, add prompt
    b.parentNode.innerHTML = b.parentNode.innerHTML.substring(0, b.parentNode.innerHTML.indexOf(b.outerHTML) + b.outerHTML.length)
        + "<i>" + prompt + "</i>"; // add text to parent of clicked button
    // Change button color to random color
    b.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    // stop click event to propagate to parent
    event.stopPropagation();
    return true;
}
function big6_editTests_PromptsButton(promptStatus) {
    //return promptStatus.hasStatements ? ""
    //    : "<button onclick=\"big6_editTests_PromptsButton_Click('" + promptStatus.prompt + "');\">+</button>";
    return "<button onclick=\"big6_editTests_PromptsButton_Click(this, '" + promptStatus.prompt + "');\">+</button>";
    //<button onclick="big6_editTests_PromptsButton_Click(" 110000 = "" 111000 = "" 111100 = "" 111110 = "" 111111');' = "" > +</button >
}
function big6_children_AsHtm(parentid, parentStatus) {
    var ret = "";
    big6.forEach((child) => {
        if (child[i_parentid] == parentid) {
            var promptStatus = {
                hasStatements: parentStatus.hasStatements ? true : false,
                prompt: parentStatus.prompt + " " + child[i_beliefid]
            };
            ret += "<tr><td>";
            ret += "<b>" + child[i_belieftext] + " (" + child[i_beliefid] + ")</b><br>" + child[i_consequence];
            //promptStatus.prompt += child[i_belieftext] /*+ ", " + child[i_consequence]*/ + ". ";
            if (0 < child[i_attitudeyesopportunity].length + child[i_attitudenoopportunity].length + child[i_attitudeyesthreat].length + child[i_attitudenothreat].length) {
                promptStatus.hasStatements = true;
                ret += "<br><table><tr><td style='width:1px;border:0px'></td><td style='border:0px;background-color:green'>&#x2714;</td><td style='border:0px;background-color:red'>&#x2714;</td></tr>";
                ret += "<tr><td style='width:1px;border:0px'>&#x1F4CC;</td><td>" + child[i_attitudeyesopportunity] + "</td><td>" + child[i_attitudenoopportunity] + "</td></tr>";
                ret += "<tr><td style='width:1px;border:0px'>&#x1F6A8;</td><td>" + child[i_attitudeyesthreat] + "</td><td>" + child[i_attitudenothreat] + "</td></tr>";
                ret += "</table>";
            }
            ret += "<table>" + big6_children_AsHtm(child[i_beliefid], promptStatus) + "</table>";
            ret += big6_editTests_PromptsButton(promptStatus);
            ret += "</td></tr>";
        }
    });
    return ret;
}

function big6_editTests_ShowAsHtm(i) {
    if (i == null)
        i = big6_testIndex; // Show active all test (all if none selected)
    var ret = big6_test_AsHtm(i) + "<hr>";
    //var t = big6_i(i); // i_beliefid = 0, i_parentid = 1, i_belieftext = 2, i_consequence = 3, i_attitudeyesopportunity = 4, i_attitudenoopportunity = 5, i_attitudeyesthreat = 6, i_attitudenothreat = 7, i_time = 8;
    if (i == 0) { // show all tests
        ret += big6_editTests_AsHtm_AddTest(i);
        big6.forEach((test) => { if (test[i_parentid] == 0) ret += big6_editTests_ShowAsHtm(test[i_beliefid]); });
    }
    else { // Show test
        big6.forEach((test) => {
            if (test[i_parentid] == i) {
                var promptStatus = { prompt: test[i_parentid] + " " + test[i_beliefid], hasStatements: false };
                ret += "<table>";
                ret += big6_children_AsHtm(test[i_beliefid], promptStatus);
                ret += "<b>" + test[i_belieftext] + " (" + test[i_beliefid] + ")</b><br>" + test[i_consequence];
                if (!promptStatus.hasStatements)
                        ret += "<br><i>" + promptStatus.prompt + "</i>";  
                ret += "</table><hr>";
            }
        });
    }
    return ret;
}

document.addEventListener('keydown', function (event) { // Add event listener to the 'keydown' event on the document
    if (event.key === 'e') { // Check if the pressed key is 'e'
        editTestsTable.style.innerHTML='...';
        editTestsTable.style.display = 'table';
        editTestsDetail.innerHTML = big6_editTests_ShowAsHtm(big6_testIndex);
    }
});
