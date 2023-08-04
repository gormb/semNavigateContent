var big6 = new Array(), i_beliefid=0,i_parentid=1,i_belieftext=2,i_consequence=3,i_attitudeyesopportunity=4,i_attitudenoopportunity=5,i_attitudeyesthreat=6,i_attitudenothreat=7,i_time=8;
var big6_menu = new Array(4);
var big6_testIndex = 0;
var big6_scores = new Array(), i_trait=0, i_statements = 1, i_yesno=2, i_opportunitythreat=3; //big6_scores.push([[210000,...],[210001,210003,210002],0.0,0.0])
var big6_scores_scoreForNotSelected = -.0001;
var big6_statements = new Array() /*, i_beliefid=0 */, i_belieftoscoreid=1/*, i_belieftext=2*/, i_attitudetype=3/*yesopportunity/noopportunity/yesthreat/,nothreat*/, i_attractiveness=4, i_shown=5, i_answer=6; //big6_statements.push([241000,3,'abc',0.98,0]);big6_statements.push([221000,3,'adg',-0.19,0]);big6_statements.push([212000,3,'sreg',0.47,0]);big6_statements.push([232000,3,'strhgd',0.38,0]);big6_statements.push([232000,1,'shtd',-0.38,0]);
var big6_bYes = -1, big6_bNo = -1;

function big6_SetTestIndex(i) {
    big6_testIndex = i;
    big6_scores = new Array();
    big6_statements = new Array();
    big6.forEach((belief) => {
        if (belief[i_parentid] == big6_testIndex) { // alert(belief[i_beliefid]);
            big6_scores.push([belief,[],0.0, 0.0]); //     //big6_scores.push([[210000,...],[210001,210003,210002],0.0,0.0])
            big6_Addstatements(belief[i_beliefid], belief[i_beliefid]);
        }
    });
}

function big6_i(beliefid) {
    for (var i=0;i<big6.length;i++)
        if (big6[i][i_beliefid] == beliefid)
            return i;
    return 0;
}

function big6_SetYN(cell, y, n) {
    if (y != null) {
        big6_bYes = y;
        cell.classList.toggle("yes");
    }
    if (n != null) {
        big6_bNo = n;
        cell.classList.toggle("no");
    }
}

function big6_statements_i(beliefid, ynot) {
    // console.log("big6_statements_i " + beliefid + " " + ynot);
    // console.log(big6_statements[2]);
    for (var i=0;i<big6_statements.length;i++)
        if (big6_statements[i][i_beliefid] == beliefid)
            if (big6_statements[i][i_attitudetype] == ynot)    
                return i;
    console.log("not found big6_statements_i " + beliefid + " " + ynot);
    return 0;
}

function big6_UpdateScore(iB, isY, isN) {
    var statement = big6_menu[iB];
    var beliefid=statement[i_beliefid], belieftoscoreid=statement[i_belieftoscoreid], attitudetype=statement[i_attitudetype];
    var score = isY ? 1.0 : isN ? -1 : big6_scores_scoreForNotSelected; // score: 1:agree, -0.99:disagree, -0.0001:not chosen
    big6_statements.forEach((stat) => { // update statement count //document.write(beliefid + " " + score + "<br>");
        stat[i_shown]++;
        if (stat[i_beliefid] == beliefid) {
            if (attitudetype == stat[i_attitudetype]) { // score this statement
                stat[i_attractiveness]+=Math.abs(score);
            }
            else stat[i_attractiveness]+=Math.abs(score*.01); // score the other statements for same beliefid a percentage of the score
        }
        else if (stat[i_belieftoscoreid] == belieftoscoreid) stat[i_attractiveness]+=Math.abs(score*0.001); // score the other statements for same i_belieftoscoreid a thousand of the score
    });
    //if (isY | isN) // update trait i_trait=0, i_statements = 1, i_yesno=2, i_opportunitythreat=3;
    big6_scores.forEach((trait) => { // update score // document.write("Maybe trait " + trait[i_trait][i_beliefid] + "<br>");
        if (trait[i_trait][i_beliefid] == belieftoscoreid) { // score (yes or no)
            if (isY) 
                statement[i_answer] = 1;
            else if (isN)
                statement[i_answer] = -1; // 1:agree, -1:disagree, 0:not chosen
            trait[i_statements].push(statement); //attitudeyesopportunity	attitudenoopportunity	attitudeyesthreat	attitudenothreat
            trait[i_yesno] += statement[i_attitudetype]%1 == 0 ? score : -score; // if it's the positive, added score, if it's the negative, subtracted score
            trait[i_opportunitythreat] += statement[i_attitudetype]%2 == 0 ? score : -score; // if it's the positive, added score, if it's the negative, subtracted score
        }
    });
}

function big6_UpdateScores(iY, iN) {
    for (var i=0;i<4;i++)
        big6_UpdateScore(i, i == iY, i == iN); //big6_GetStatements().forEach((statement) => document.write(statement + "<br>"));
}

function big6_Addstatement(belief, idscore, attitudeid, attitudetype) {//big6_statements.push([241000,3,'abc',0.98]);big6_statements.push([221000,3,'adg',-0.19]);big6_statements.push([212000,3,'sreg',0.47]);big6_statements.push([232000,3,'strhgd',0.38]);big6_statements.push([232000,1,'shtd',-0.38]);
    if (belief[attitudeid].length > 0) // data for this attitude on node, add it to list with neutral score!
        big6_statements.push([belief[i_beliefid],idscore,belief[attitudeid],attitudetype,0.0, 0, 0]); //attitudeyesopportunity	attitudenoopportunity	attitudeyesthreat	attitudenothreat	
}

function big6_Addstatements(idscore, id) { // also recurse through children
    big6.forEach((belief) => {
        if (belief[i_beliefid] == id) { // Add statements if they are found
            big6_Addstatement(belief, idscore, i_attitudeyesopportunity, 0);
            big6_Addstatement(belief, idscore, i_attitudenoopportunity, 1);
            big6_Addstatement(belief, idscore, i_attitudeyesthreat, 2);
            big6_Addstatement(belief, idscore, i_attitudenothreat, 3);
        }
        else if (belief[i_parentid] == id) // Recurse for children
            big6_Addstatements(idscore, belief[i_beliefid]);
    });
}

function big6_GetChildren(parentid) {
    var ret = new Array();
    for (var i=0;i<big6.length;i++)
        if (big6[i][i_parentid]==parentid)
            ret.push(big6[i]);
    return ret;
}

function big6_GetStatements() {
    var shuffledStatements = big6_statements.slice();
    shuffledStatements.sort((a, b) => { // Push the most used and most attractive to the bottom
            if (b[i_shown] != a[i_shown]) return a[i_shown]-b[i_shown];
            else if (a[i_attractiveness] != b[i_attractiveness]) return a[i_attractiveness]-b[i_attractiveness];
            else return Math.random() - 0.5; 
        });
    return shuffledStatements;
}

//big6.push([200000,0,'Big 5 Mini - personality test','The Big Five Personality Test, also known as the Five-Factor Model (FFM), is a widely used framework in psychology to measure and describe personality traits.  The traits are considered to represent broad dimensions of personality and are used to describe and understand individual differences in personality characteristics. It\'s important to note that individuals can possess a combination of high and low scores on each trait, resulting in unique personality profiles.','','','','']);
