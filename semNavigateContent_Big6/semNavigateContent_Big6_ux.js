function ux_Click_Button(b, cell) {
    if (big6_testIndex == 0) { // Menu click! set test and navigate to first choice!
        big6_SetTestIndex(big6_menu[b][i_beliefid]);
        showTestOverview();
        big6_Url_Set(big6_testIndex, 1);
        big6_TraitsPopulate();
        big6_SetButtons(); // populate the first statement
    }
    else {
        if (big6_bYes == b) big6_SetYN(cell, -1); // turn off yes
        else if (big6_bNo == b) big6_SetYN(cell, null, -1); // turn off no
        else if (big6_bYes == -1) big6_SetYN(cell, b); // set yes
        else if (big6_bNo == -1) big6_SetYN(cell, null, b); // set no
    }
    bNext.style.display = big6_bYes == -1 || big6_bNo == -1 ? "none" : "table";
    bSkip.style.display = big6_bYes != -1 || big6_bNo != -1 ? "none" : "table";
}
function ux_Click_Reset() {
    if (confirm("Reset;\nTop menu?") == true) {
        big6_Url_Set('', 1);
        bResults.style.display = 'none';
        testOverviewTable.style.display = 'none';
        big6_testIndex = 0;
        big6_SetButtons();
    }
}
function ux_Click_Next() {
    big6_Url_Set('!', 0);
    big6_TraitsUpdate();
    big6_SetButtons();
}
function ux_Click_Skip() {
    big6_Url_Set('-', 0);
    big6_TraitsUpdate();
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
    history.pushState(null, '', "?" + big6_gptGetKeysAsUrl("&") + "test=" + a);
    console.log("big6_Url_Set -> " + window.location.search);
}

function big6_Url_Simulate(a) { // window.location.search = "?test=300000,311000y0,332000n3,332000.1,332000.0,!,$";
    // new URLSearchParams(window.location.search).get('test').toString();// 300000,311000y0,332000n3,332000.1,332000.0,!,$ // Select test 30000, score 311000 yes to 0,332000 no to 3,332000 1 not chosen,332000 0 not chosen, press next
    try { a = a.split(",");} catch(e) { console.log(e);}
    var ignoreI = 3;
    for (var i=0;i<a.length;i++) {
        var v = a[i];
        var v_y = v.split("y"), v_n = v.split("n"), v_i = v.split(".");
        if (v_y.length == 2) { // agree! // console.log("yes " + v_y[0] + " " + v_y[1]);
            big6_menu[0] = big6_statements[big6_statements_i(v_y[0], v_y[1])];
            big6_SetButton(0, big6_menu[0]);
            big6_bNo = big6_bYes = -1;
            ux_Click_Button(0, b0);
        }
        else if (v_n.length == 2) { // disagree! // console.log("no " + v_n[0] + " " + v_n[1]);
            big6_menu[1] = big6_statements[big6_statements_i(v_n[0], v_n[1])];
            big6_SetButton(1, big6_menu[1]); 
            big6_bNo = -1;
            ux_Click_Button(1, b1);
        }
        else if (v_i.length == 2) { // not agree or disagree // console.log("ignore " + v_i[0] + " " + v_i[1])
            ignoreI = ignoreI == 2 ? 3 : 2; // swap ignore between 2 and 3
            big6_menu[ignoreI] = big6_statements[big6_statements_i(v_i[0], v_i[1])];
            big6_SetButton(ignoreI, big6_menu[ignoreI]); 
            testOverviewTable.style.display = 'none'; // hide test overview
        }
        else if (v == '!' || v == '-') { // commit or skip // console.log("commit");
            big6_TraitsUpdate();big6_SetButtons() 
        }
        else if (v == '$') { // console.log("show results");
            big6_traits_ShowAsHtm(null); 
        }
        else if (Number.isInteger(parseInt(v))) { // console.log("select test " + v);
            big6_SetTestIndex(v);
            showTestOverview();
            big6_TraitsPopulate();
            big6_SetButtons(); // populate the first statement
        }
    }
}

function big6_test_AsHtm(testIndex = big6_testIndex) {
    var i = big6_i(testIndex);
    return "<h2>" + big6[i][i_belieftext] + "</h2>" + "<p>" + big6[i][i_consequence] + "</p>";
}

function big6_reply_AsHtm(rep) {
    var i = big6_i(rep[i_beliefid]), iParent = big6_i(rep[i_parentid]);
    var agree = rep[i_answer] > 0;
    var yes = rep[i_attitudetype] % 2 == 0; // yesopportunity/noopportunity/yesthreat/,nothreat
    var opportunity = rep[i_attitudetype] / 2 == 0; // yesopportunity/noopportunity/yesthreat/,nothreat
    return '(' + (agree ? 'Positive' : 'Negative') + ' towards) ' + (yes ? 'belief' : 'disbelief') + (opportunity ? ', driven by opportunity' : ',  avoid the alternative');// + '(' + rep + ')';
}

function big6_score_AsHtm(trait) {
    var cols = 2;
    var h = "<h3>" + trait[i_trait][i_belieftext] + "</h3>";
    var len = trait[i_statements].length;
    h += "<b>&#x2714;:" + (len == 0 ? "?" : Math.trunc(50 + (50 * trait[i_yesno]) / len) + "% - &#x2717;") 
        + "</b><br>&#x1F4CC; " + (len == 0 ? "?" : Math.trunc(50 + (50 * trait[i_opportunityvsthreat]) / len) + "% -") + "&#x1F6A8;";
    h += "<p>" + trait[i_trait][i_consequence] + "</p>";
    h += "<table>";//<tr><th>Statement</th><th>Score</th><th>Attractiveness</th></tr>";
    var iAnswersGiven = 0;
    for (var i=0;i<len;i++) {
        var rep = trait[i_statements][i];
        //if (Math.abs(rep[i_answer]) != 0)
        { // Chosen yes or no
            if (iAnswersGiven % cols == 0) h += '<tr>' // two pr line
            h += '<td style="border-width: 5px;width:25%;border-color:' + (rep[i_answer] > .9 ? 'green' : (rep[i_answer] < -.9 ? 'red' : 'grey')) + '">'
                + rep[i_belieftext] + ')</td>'; // Result
            var yes = rep[i_attitudetype] % 2 == 0; // yesopportunity/noopportunity/yesthreat/,nothreat
            var opportunity = rep[i_attitudetype] / 2 == 0; // yesopportunity/noopportunity/yesthreat/,nothreat
            h += '<td style="border-width:0px; width:25%">' // &#x1F4C8;, ' // 
                + ' ' /* yes/no */ + (rep[i_answer] > .9 ? (yes ? '&#x2714' : '&#x2717;') // yn: green
                    : (yes ? '&#x2717' : '&#x2714;')) // yn: red
                + /* opportunity/threat */ (rep[i_answer] > .9 ? (opportunity ? '&#x1F4CC' : '&#x1F6A8;') // ot: green
                    : (opportunity ? '&#x1F6A8' : '&#x1F4CC;')) // ot: red
                + '<br>' /* inverting/disagree-answer */
                + (rep[i_answer] > .9 ? '<br>'
                    : ('<span style="border: 2px solid red; padding: 1px;">'
                        + (yes ? '&#x2714;' : '&#x2717;')
                        + (opportunity ? '&#x1F4CC;' : '&#x1F6A8;')
                        + '</span>'))
                //+ /* explaining text */ '<br>' + big6_reply_AsHtm(rep)
                + '</td>'; // end of cell
            if ((iAnswersGiven++) % cols == cols - 1)
                h += '</tr>' // end of row
        }
    }
    //if (len % cols == 1) h += '<td style="border-width: 0px;"></td></tr>'
    h += "</table>";
    return h;
} 

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
    res = res.replace(/&shy;/g, "").replace(/&nbsp;/g, "").replace(/&amp;/g, "&");
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
    res = res.replace(/"/g, '\'');
    return res;
}
function big6_prompt_FromIds(a, aPrompts, bUseChat)
{ // create prompts to ask open ai
    var parentid = a.length == 0 ? 0 : a.length == 1 ? a[0] : a[a.length - 2];
    var newid = big6_i_nextfree(parseInt(parentid == 0 ? 0 : a[a.length - 1]) + 1); // last id or parent + 1 -- or next free

    var root = big6[big6_i(a.length == 0 ? 0 : a[0])];
    if (bUseChat) aPrompts.push('{"role":"system","content":"Find statements that uncover traits within \''
            + big6_Text(big6_i(a[1]), i_belieftext, '. ') + big6_Text(big6_i(a[1]), i_consequence, '. ') + '\'"}'); //alert(root); // ultimate parent (to be scored)
    else aPrompts.push('Find statements that uncover traits within \''
            + big6_Text(big6_i(a[1]), i_belieftext, '. ') + big6_Text(big6_i(a[1]), i_consequence, '. ') + '\'');
    var res = '';
    for (var i = a.length - 1; (i > 1 && i > a.length - 4) || res.length == 0; i--) { // item and max 3 ancestors
        var b6i = big6_i(a[i]); // i_beliefid=0,i_parentid=1,i_belieftext=2,i_consequence=3,i_attitudeyesopportunity=4,i_attitudenoopportunity=5,i_attitudeyesthreat=6,i_attitudenothreat=7
        res += big6_Text(b6i, i_belieftext , ". ") + big6_Text(b6i, i_consequence, ". ");
    }//alert(res);
    if (bUseChat) {
        aPrompts.push('{"role":"user","content": ' + JSON.stringify(res + '\n\n' + root[i_attitudeyesopportunity]) + '}');
        aPrompts.push('{"role":"user","content": ' + JSON.stringify(res + '\n\n' + root[i_attitudenoopportunity]) + '}');
        aPrompts.push('{"role":"user","content": ' + JSON.stringify(res + '\n\n' + root[i_attitudeyesthreat]) + '}');
        aPrompts.push('{"role":"user","content": ' + JSON.stringify(res + '\n\n' + root[i_attitudenothreat]) + '}');//
    }
    else {
        aPrompts.push(JSON.stringify(res + '\n\n' + root[i_attitudeyesopportunity] + '\n\n'));
        aPrompts.push(JSON.stringify(res + '\n\n' + root[i_attitudenoopportunity] + '\n\n'));
        aPrompts.push(JSON.stringify(res + '\n\n' + root[i_attitudeyesthreat] + '\n\n'));
        aPrompts.push(JSON.stringify(res + '\n\n' + root[i_attitudenothreat] + '\n\n'));
    }
    aPrompts.push(newid);
    aPrompts.push(parentid);
    return res;
}

function big6_editTests_AsHtm_AddTest() { return "<button onclick='alert(\"Buy pro-version\");'>+</button>"; }
function big6_clipboardTaCopy(s) {
    var textArea = document.createElement("textarea");
    textArea.value = s; //  promptText;
    textArea.style.position = "fixed";
    textArea.style.top = "-100vh"; // Move above the viewport
    textArea.style.left = "0";
    textArea.style.opacity = "0"; // Make it invisible
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

function big6_gptQuestionsResults(txt, q, useChat) {
    //&#x2714; &#x2714; &#x1F4CC; &#x1F6A8;
    var item = [
        i_beliefid, i_parentid, i_belieftext, i_consequence
        , big6_gptResult('&#x1F4CC;&#x2714; <i>' + txt + '</i>', q[0] + ', ' + q[1], useChat)
        , big6_gptResult('&#x1F4CC;&#x2717; <i>' + txt + '</i>', q[0] + ', ' + q[2], useChat)
        , big6_gptResult('&#x1F6A8;&#x2714; <i>' + txt + '</i>', q[0] + ', ' + q[3], useChat)
        , big6_gptResult('&#x1F6A8;&#x2717; <i>' + txt + '</i>', q[0] + ', ' + q[4], useChat)
        , i_time
    ];
    return big6_children_AsHtm_YNOT(item);
}

function big6_editTests_PromptsButton_Click(b, prompt, useChat) { // Create prompt from ID's' //alert(prompt);
    var aPrompts = new Array();
    var promptText = big6_prompt_FromIds(prompt.split(','), aPrompts, useChat); // alert(promptText); // promptText = aPrompts;

    big6_clipboardTaCopy(aPrompts); // Add prompt to clipboard

    // remove content from parent after button but keep the button and everything before it, add promptText
    b.parentNode.innerHTML += ''// b.parentNode.innerHTML.substring(0, b.parentNode.innerHTML.indexOf(b.outerHTML) + b.outerHTML.length)
        // + big6_gptResult(promptText, aPrompts); // add text to parent of clicked button
        + big6_gptQuestionsResults(promptText, aPrompts, useChat); // add text to parent of clicked button

    b.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Change button color to random color
    event.stopPropagation(); // stop click event to propagate to parent
    return true;
}
/*
function z_big6_editTests_PromptsButton_Click(b, prompt) { // Create prompt from ID's' //alert(prompt);
    var aPrompts = new Array();
    var promptText = big6_prompt_FromIds(prompt.split(','), aPrompts); // alert(promptText); // promptText = aPrompts;
    big6_clipboardTaCopy(aPrompts); // Add prompt to clipboard
    // remove content from parent after button but keep the button and everything before it, add promptText
    b.parentNode.innerHTML = b.parentNode.innerHTML.substring(0, b.parentNode.innerHTML.indexOf(b.outerHTML) + b.outerHTML.length)
        // + big6_gptResult(promptText, aPrompts); // add text to parent of clicked button
        + big6_gptQuestionsResults(promptText, aPrompts); // add text to parent of clicked button
    b.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Change button color to random color
    event.stopPropagation(); // stop click event to propagate to parent
    return true;
}*/

function big6_editTests_PromptsButton(promptStatus) {
    return "<button onclick=\"big6_editTests_PromptsButton_Click(this, '" + promptStatus.prompt + "', true);\">*</button>"
        + "<button onclick=\"big6_editTests_PromptsButton_Click(this, '" + promptStatus.prompt + "', false);\">+</button>";
}
function big6_children_AsHtm_YNOT(item) { // i_beliefid = 0, i_parentid = 1, i_belieftext = 2, i_consequence = 3, i_attitudeyesopportunity = 4, i_attitudenoopportunity = 5, i_attitudeyesthreat = 6, i_attitudenothreat = 7, i_time = 8;
    var ret = "<br><table><tr><td style='width:1px;border:0px'></td><td style='border:0px;background-color:green'>&#x2714;</td><td style='border:0px;background-color:red'>&#x2717;</td></tr>";
    ret += "<tr><td style='width:1px;border:0px'>&#x1F4CC;</td><td>" + item[i_attitudeyesopportunity] + "</td><td>" + item[i_attitudenoopportunity] + "</td></tr>";
    ret += "<tr><td style='width:1px;border:0px'>&#x1F6A8;</td><td>" + item[i_attitudeyesthreat] + "</td><td>" + item[i_attitudenothreat] + "</td></tr>";
    ret += "</table>";
    return ret;
}
function big6_children_AsHtm(parentid, parentStatus) {
    var ret = "";
    big6.forEach((child) => {
        if (child[i_parentid] == parentid) {
            var promptStatus = {
                hasStatements: parentStatus.hasStatements ? true : false,
                prompt: [...parentStatus.prompt, child[i_beliefid]] //prompt: parentStatus.prompt + "," + child[i_beliefid]
            };
            ret += "<tr><td>";
            ret += "<b>" + child[i_belieftext] + " (" + child[i_beliefid] + ")</b><br>" + child[i_consequence];
            //promptStatus.prompt += child[i_belieftext] /*+ ", " + child[i_consequence]*/ + ". ";
            if (0 < child[i_attitudeyesopportunity].length + child[i_attitudenoopportunity].length + child[i_attitudeyesthreat].length + child[i_attitudenothreat].length) {
                promptStatus.hasStatements = true;
                ret += "<br>" + big6_children_AsHtm_YNOT(child);
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
        ret = "<table>" + big6_children_AsHtm(i, { prompt: [i], hasStatements: false }) + "</table>";
    }
    return ret;
}

function big6_showDb_Add(big6_testIndex) {
    showDbDetail.innerHTML = "test index: " + big6_testIndex;
}

function big6_edit_Toggle(visible) {
    if (visible == null) visible = (editTestsTable.style.display == 'none');
    if (!visible) editTestsTable.style.display = 'none';
    else {
        editTestsTable.style.innerHTML = '...';
        editTestsTable.style.display = 'table';
        editTestsDetail.innerHTML = big6_editTests_ShowAsHtm(big6_testIndex);
    }
}

function big6_data_Toggle(visible) {
    if (visible == null) visible = (showDbTable.style.display == 'none');
    if (!visible) showDbTable.style.display = 'none';
    else {
        //showDbTable.style.innerHTML = '...';
        showDbTable.style.display = 'table';
        //showDbTable.innerHTML = big6_editTests_ShowAsHtm(big6_testIndex);
    }
}


document.addEventListener('keydown', function (event) { // Add event listener to the 'keydown' event on the document
    if (event.key === 'e') big6_edit_Toggle(); // Get into or out of edit-mode
    else if (event.key === 'r') ux_Click_Results(); // Show results
    else if (event.key === 'd') big6_data_Toggle(); // Show all database actions
});

var ux_touchTimerEvent;
document.addEventListener('touchstart', ()=> {
    ux_touchTimerEvent = setTimeout(() => {
        clearTimeout(ux_touchTimerEvent);
        big6_edit_Toggle();
        ux_Click_Results();
        big6_data_Toggle();
    }, 1000); /* 1000 milliseconds (1 second) for long press*/
});

document.addEventListener('touchend', () => { clearTimeout(ux_touchTimerEvent); });
