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
            big6_traits_AsHtm(null); 
        }
        else if (Number.isInteger(parseInt(v))) { // console.log("select test " + v);
            big6_SetTestIndex(v);
            TraitsPopulate();
            big6_SetButtons(); // populate the first statement
        }
    }
}

function big6_test_AsHtm() {
    var i=big6_i(big6_testIndex);
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

var big6_traits_AsHtm_lastShow = -1;
function big6_traits_AsHtm(i) {
    if (i == null) { // Show all traits
        var h = big6_test_AsHtm() + "<h1>&#x1F4C8;</h1>";
        for (var t=0;t<big6_scores.length;t++)
            h += "<hr>" + big6_score_AsHtm(big6_scores[t], 1);
        traitsDetail.innerHTML = h;
        traitDetailsTable.style.display='table';
    }
    else if (big6_traits_AsHtm_lastShow != i) { // trait clicked; show trait details and relevant statement chosen
        big6_traits_AsHtm_lastShow = i;
        traitsDetail.innerHTML = big6_score_AsHtm(big6_scores[i], 2);
        traitDetailsTable.style.display='table';
    }
    else { // second click; hide
        traitDetailsTable.style.display='none';
        big6_traits_AsHtm_lastShow = -1;
    }
}
