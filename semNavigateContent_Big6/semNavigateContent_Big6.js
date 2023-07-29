var big6 = new Array(), i_beliefid=0,i_parentid=1,i_belieftext=2,i_consequence=3,i_attitudeyesopportunity=4,i_attitudenoopportunity=5,i_attitudeyesthreat=6,i_attitudenothreat=7,i_time=8;
var big6_menu = new Array(4);
var big6_testIndex = 0;
var big6_scores = new Array(), i_trait=0, i_statements = 1, i_yesno=2, i_opportunitythreat=3; //big6_scores.push([[210000,...],[210001,210003,210002],0.0,0.0])
var big6_statements = new Array() /*, i_beliefid=0 */, i_belieftoscoreid=1/*, i_belieftext=2*/, i_attitudetype=3/*yesopportunity/noopportunity/yesthreat/,nothreat*/, i_attractiveness=4, i_shown=5, i_answer=6; //big6_statements.push([241000,3,'abc',0.98,0]);big6_statements.push([221000,3,'adg',-0.19,0]);big6_statements.push([212000,3,'sreg',0.47,0]);big6_statements.push([232000,3,'strhgd',0.38,0]);big6_statements.push([232000,1,'shtd',-0.38,0]);

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

function big6_Url(a, clear) { // history.pushState(nextState, nextTitle, nextURL);
    console.log("big6_Url " + a + " " + clear);
    if (a == '!' || a == '-') // Add values of the choices made
        a = big6_menu[0][i_beliefid] + (bYes == 0 ? "y" : (bNo == 0 ? "n" : ".")) + big6_menu[0][i_attitudetype] + ","
          + big6_menu[1][i_beliefid] + (bYes == 1 ? "y" : (bNo == 1 ? "n" : ".")) + big6_menu[1][i_attitudetype] + "," 
          + big6_menu[2][i_beliefid] + (bYes == 2 ? "y" : (bNo == 2 ? "n" : ".")) + big6_menu[2][i_attitudetype] + "," 
          + big6_menu[3][i_beliefid] + (bYes == 3 ? "y" : (bNo == 3 ? "n" : ".")) + big6_menu[3][i_attitudetype] + "," 
          + a; // 311000y0,332000n3,332000.1,332000.0,! 
    if (!clear) {
        console.log(a);
        if (a.length == 0) a = new URLSearchParams(window.location.search).get('test').toString();
        else a = new URLSearchParams(window.location.search).get('test').toString() + "," + a;
    }
    history.pushState(null, '', "?test=" + a);
    console.log("big6_Url -> " + window.location.search);
}

function big6_Navigate(a) { // window.location.search = "?test=300000,311000y0,332000n3,332000.1,332000.0,!,$";
    // new URLSearchParams(window.location.search).get('test').toString();// 300000,311000y0,332000n3,332000.1,332000.0,!,$ // Select test 30000, score 311000 yes to 0,332000 no to 3,332000 1 not chosen,332000 0 not chosen, press next
    try { a = a.split(",");} catch(e) { console.log(e);}
    var ignoreI = 3;
    for (var i=0;i<a.length;i++) {
        var v = a[i];
        var v_y = v.split("y"), v_n = v.split("n"), v_i = v.split(".");
        if (v_y.length == 2) { // console.log("yes " + v_y[0] + " " + v_y[1]);
            big6_menu[0] = big6_statements[big6_statements_i(v_y[0], v_y[1])];
            StatementReset(0, big6_menu[0]);
            bNo = bYes = -1;
            selectButton(0, b0);
        }
        else if (v_n.length == 2) { // console.log("no " + v_n[0] + " " + v_n[1]);
            big6_menu[1] = big6_statements[big6_statements_i(v_n[0], v_n[1])];
            StatementReset(1, big6_menu[1]); 
            bNo = -1;
            selectButton(1, b1);
        }
        else if (v_i.length == 2) { // console.log("ignore " + v_i[0] + " " + v_i[1])
            ignoreI = ignoreI == 2 ? 3 : 2; // swap ignore between 2 and 3
            big6_menu[ignoreI] = big6_statements[big6_statements_i(v_i[0], v_i[1])];
            StatementReset(ignoreI, big6_menu[ignoreI]); 
        }
        else if (v == '!' || v == '-') { // console.log("commit");
            TraitsUpdate();StatementPopulate() 
        }
        else if (v == '$') { // console.log("show results");
            ShowTraits(null); 
        }
        else if (Number.isInteger(parseInt(v))) { // console.log("select test " + v);
            big6_SetTestIndex(v);
            TraitsPopulate();
            StatementPopulate(); // populate the first statement
        }
    }
}

function big6_i(beliefid) {
    for (var i=0;i<big6.length;i++)
        if (big6[i][i_beliefid] == beliefid)
            return i;
    return 0;
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

function AsHtm_big6_test() {
    var i=big6_i(big6_testIndex);
    return "<h2>" + big6[i][i_belieftext] + "</h2>" + "<p>" + big6[i][i_consequence] + "</p>";
} 

function AsHtm_big6_score(trait) {
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

var lastShowTraits = -1;
function ShowTraits(i) {
    if (i == null) { // Show all traits
        var h = AsHtm_big6_test() + "<h1>&#x1F4C8;</h1>";
        for (var t=0;t<big6_scores.length;t++)
            h += "<hr>" + AsHtm_big6_score(big6_scores[t], 1);
        traitsDetail.innerHTML = h;
        traitDetailsTable.style.display='table';
    }
    else if (lastShowTraits != i) { // trait clicked; show trait details and relevant statement chosen
        lastShowTraits = i;
        traitsDetail.innerHTML = AsHtm_big6_score(big6_scores[i], 2);
        traitDetailsTable.style.display='table';
    }
    else { // second click; hide
        traitDetailsTable.style.display='none';
        lastShowTraits = -1;
    }
}

function big6_UpdateScore(iB, isY, isN) {
    var statement = big6_menu[iB];
    var beliefid=statement[i_beliefid], belieftoscoreid=statement[i_belieftoscoreid], attitudetype=statement[i_attitudetype];
    var score = isY ? 1.0 : isN ? -1 : -0.0001; // score: 1:agree, -0.99:disagree, -0.0001:not chosen
    big6_statements.forEach((stat) => { // update statement count //document.write(beliefid + " " + score + "<br>");
        if (stat[i_beliefid] == beliefid) {
            if (attitudetype == stat[i_attitudetype]) { // score this statement
                stat[i_shown]++;
                stat[i_attractiveness]+=score;
            }
            else stat[i_attractiveness]+=score*0.01; // score the other statements for same beliefid a percentage of the score
        }
        else if (stat[i_belieftoscoreid] == belieftoscoreid) stat[i_attractiveness]+=score*0.001; // score the other statements for same i_belieftoscoreid a thousand of the score
    });
    if (isY | isN) // update trait i_trait=0, i_statements = 1, i_yesno=2, i_opportunitythreat=3;
        big6_scores.forEach((trait) => { // update score // document.write("Maybe trait " + trait[i_trait][i_beliefid] + "<br>");
            if (trait[i_trait][i_beliefid] == belieftoscoreid) { // score (yes or no)
                statement[i_answer] = isY ? 1 : -1; // 1:agree, -1:disagree, 0:not chosen
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
    shuffledStatements.sort((a, b) => { // Push the most used and least attractive to the bottom
            if (b[i_shown] != a[i_shown]) return a[i_shown]-b[i_shown];
            else if (a[i_attractiveness] != b[i_attractiveness]) return b[i_attractiveness]-a[i_attractiveness];
            else return Math.random() - 0.5; 
        });
    return shuffledStatements;
}

//big6.push([200000,0,'Big 5 Mini - personality test','The Big Five Personality Test, also known as the Five-Factor Model (FFM), is a widely used framework in psychology to measure and describe personality traits.  The traits are considered to represent broad dimensions of personality and are used to describe and understand individual differences in personality characteristics. It''s important to note that individuals can possess a combination of high and low scores on each trait, resulting in unique personality profiles.','','','','']);

big6.push([0,-1,'Velg test','','','','','']);
big6.push([100000,0,'Drivkrefter som påvirker offentlig sektor mot 2030 (2023)','Vurdering av drivkreftene kan gjøre det enklere å ta valg og forberede seg.','','','','']);
big6.push([110000,100000,'Polititrait','Politiske strømninger','','','','']);
big6.push([111000,110000,'Politisk polarisering','Demokratisk svekkelse og økte kontraster preger den politiske utviklingen i verden','','','','']);
big6.push([111100,111000,'Demokratisk svekkelse internasjonalt','','','','','']);
big6.push([111110,111100,'','Andel av verdens befolkning som lever i et velfungerende demokrati har falt med 56 % fra 2008 til 2021, og mer enn 1/3 av verdens befolkning lever i et autoritært regime','','','','']);
big6.push([111120,111100,'','Pandemien trekkes frem som en av årsakene til at demokratiets stilling i verden ble forverret for 15. år på rad','','','','']);
big6.push([111130,111100,'','Nye målemetoder, muliggjort av rikere datagrunnlag, avdekker sterkere polarisering i nordiske land enn tidligere antatt','','','','']);
big6.push([111140,111100,'','Angrep på Kongressen i USA omtales som et så nært kuppforsøk som landet har sett av tidligere politisjef i Washington','','','','']);
big6.push([111200,111000,'Statlig suverenitet blir truet','','','','','']);
big6.push([111210,111200,'','Russland angrep nabolandet Ukraina 24. februar, med over 11 000 sivile drepte og sårede så langt i krigen2','','','','']);
big6.push([111220,111200,'','Økt polarisering også i norsk politikk','','','','']);
big6.push([111230,111200,'','Andel velgere som misliker politiske partier har økt med 22 % fra 2013- 2017','','','','']);
big6.push([111300,111000,'Fremvekst av ekkokamre','','','','','']);
big6.push([111310,111300,'','Desinformasjon kan bidra til økende polarisering og politikerforakt','','','','']);
big6.push([111320,111300,'','EU har forsøkt å presse frem mer åpenhet fra teknologigiganter som Facebook og Google, samt ber dem håndtere falske profiler og «bots»','','','','']);
big6.push([112000,110000,'Krav til politisk responstid','Kortsiktighet vinner over langsiktighet når agendaen settes av medier og digital kommunikasjon med befolkningen','','','','']);
big6.push([112100,112000,'Mediene setter den politiske dagsorden','','','','','']);
big6.push([112200,112000,'Medieinnholdet må tilpasses for å fange oppmerksomhet','','','','','']);
big6.push([112300,112000,'Departementene opplever økt mediepress','','','','','']);
big6.push([113000,110000,'Innovasjon blir viktigere','Offentlig sektor er under press. Innovasjon er ikke lenger en opsjon, men en nødvendighet for å møte utfordringene','','','','']);
big6.push([113100,113000,'Norge har et godt utgangspunkt og satser på innovasjon','','','','','']);
big6.push([113200,113000,'Norge har en vei å gå når det gjelder innovasjon','','','','','']);
big6.push([113300,113000,'Store forskjeller i kommune-Norge','','','','','']);
big6.push([120000,100000,'Økonotrait','Fokus på økonomi','','','','']);
big6.push([121000,120000,'Mindre økonomisk handlingsrom','Norge er et av verdens rikeste land, men fremover blir det større press på statsfinansene','','','','']);
big6.push([121100,121000,'Større gap i det norske budsjettet','','','','','']);
big6.push([121200,121000,'Forsørgerbyrden øker som følge av aldrende befolkning','','','','','']);
big6.push([121300,121000,'Vi risikerer at flere faller utenfor arbeidslivet','','','','','']);
big6.push([122000,120000,'Teknologigigantene tar nye posisjoner','Vinneren tar alt og beveger seg mot nye tjenesteområder','','','','']);
big6.push([122100,122000,'De nye gigantene er teknologiselskaper','','','','','']);
big6.push([122200,122000,'Digitalisering forskyver makt til teknologigigantene','','','','','']);
big6.push([122300,122000,'Europa investerer mindre','','','','','']);
big6.push([122400,122000,'Krevende å lage egne teknologiløsninger på andres plattformer','','','','','']);
big6.push([123000,120000,'Nye samarbeidsmodeller','Stadig nye samarbeidsformer fremmer innovasjon, og brukeren settes i sentrum','','','','']);
big6.push([123100,123000,'Nye samarbeidsformer vokser frem','','','','','']);
big6.push([123200,123000,'Innbyggerne bidrar på nye måter','','','','','']);
big6.push([123300,123000,'Innovative kommuner samarbeider med eksterne','','','','','']);
big6.push([130000,100000,'Sosiokutrait','Befolknings behov og kultur','','','','']);
big6.push([131000,130000,'Mer utenforskap','Utenforskapet i Norge vokser selv om de økonomiske forskjellene er blant de minste i verden','','','','']);
big6.push([131100,131000,'Norge har små økonomiske forskjeller, men ulikhetene vokser','','','','','']);
big6.push([131200,131000,'Andel i jobb, lønn og arbeidsledighet henger tett sammen med utdanningsnivået','','','','','']);
big6.push([131300,131000,'Flere faller utenfor','','','','','']);
big6.push([132000,130000,'Økt mangfold','Mangfoldet i befolkningen øker og det blir flere komplekse hensyn å ta','','','','']);
big6.push([132100,132000,'Befolkningen består i økende grad av innvandrere','','','','','']);
big6.push([132200,132000,'Det settes strengere krav til universell utforming slik at flest mulig har tilgang til hele samfunnet','','','','','']);
big6.push([132300,132000,'Seksuelle minoriteter mer synlige i det offentlige rom','','','','','']);
big6.push([133000,130000,'Flere bor sentralt og flere bor alene','Sentraliseringstendensen fortsetter. Norge er et individorientert samfunn med høyt antall single og aleneboere','','','','']);
big6.push([133100,133000,'Vi ser økt sentralisering','','','','','']);
big6.push([133200,133000,'Det er forventet nedgang i folketallet i de minst sentrale kommunene','','','','','']);
big6.push([133300,133000,'Norge på verdenstoppen i antall aleneboere','','','','','']);
big6.push([134000,130000,'Nye kompetansebehov','Høy omstillingstakt i arbeidslivet grunnet teknologisk utvikling, globalisering og det grønne skiftet, stiller nye kompetansekrav','','','','']);
big6.push([134100,134000,'Automatisering og digitalisering medfører at de enkle jobbene som krever lav kompetanse forsvinner','','','','','']);
big6.push([134200,134000,'Behov for ny læring og læring hele livet','','','','','']);
big6.push([134400,134000,'I tillegg til digital kompetanse blir fire fremtidskompetanser viktigere','','','','','']);
big6.push([135000,130000,'Økte forventninger fra innbyggere','Forventningene til gode og sammenhengende offentlige tjenester øker','','','','']);
big6.push([135100,135000,'Innbyggerne har høye forventninger','','','','','']);
big6.push([135200,135000,'Ny teknologi og algoritmer analyserer tilgjengelige data og øker muligheten for persontilpasning','','','','','']);
big6.push([135400,135000,'Bedre offentlige tjenester gir økt tillit','','','','','']);
big6.push([140000,100000,'Teknotrait','Teknologisk skifte','','','','']);
big6.push([141000,140000,'Akselerert digitalisering','En høy digital endringstakt, forsterket av koronapandemien, gir både økt gevinstpotensial og sårbarhet','','','','']);
big6.push([141100,141000,'Eksplosjon av data tilgjengelig med store økonomiske verdier','','','','','']);
big6.push([141110,141100,'','Sensorer og IoT-teknologier har gitt oss dataoverflod i verden og annethvert år fordobles verdens samlede datamengde','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141120,141100,'','«Moores law» - Evnen til å prosessere data dobles hver 18 måned','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141130,141100,'','Den datadrevne økonomien er den delen av BNP i verden som vokser raskest, og årlig skapes verdier for 150 mrd. NOK fra den norske dataøkonomien','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141140,141100,'','Nettbutikker som Komplett.no og Amazon har opplevd gylne tider','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141200,141000,'Allerede sterk digital endringstakt ble ytterligere forsterket av koronapandemien','','','','','']);
big6.push([141210,141200,'','Digitaliseringen stod for 30% av produktivitetsutviklingen i Norge i perioden 1995–2005 og 50% i perioden 2006–2013','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141220,141200,'','Skatteetaten, med bidrag fra Digdir, Bits og DNB, utviklet kompensasjonsordninga for næringslivet på 3 uker','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:']);
big6.push([141230,141200,'','Østre Toten kommune utviklet på 7 dager en digital verktøykasse basert på bla. løsninger fra norske oppstartselskaper','','','','']);
big6.push([141231,141230,'dette inntreffer, og det er bra','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er bra for miljø, samfunn og folk:','','','','']);
big6.push([141232,141230,'dette inntreffer ikke, og det er bra at det ikke inntreffer','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er bra for digitalisering, miljø, samfunn og folk at det ikke skjer:','','','','']);
big6.push([141233,141230,'dette inntreffer, og det er ikke bra','p:Explain in 20 words or less hvorfor dette skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det skjer:','','','','']);
big6.push([141234,141230,'dette inntreffer ikke, og det er ikke bra at det ikke inntreffer','p:Explain in 20 words or less hvorfor dette ikke skjer, og hvorfor det er skadelig for digitalisering, miljø, samfunn og folk at det ikke skjer:','','','','']);
big6.push([142000,140000,'Økt samhandling menneske-maskin','Maskinene blir våre samarbeidspartnere, både i arbeidslivet og privatlivet','','','','']);
big6.push([142100,142000,'Økt samhandling mellom mennesket og maskinen','','','','','']);
big6.push([142200,142000,'I arbeidslivet blir maskinene våre nye kollegaer','','','','','']);
big6.push([142300,142000,'Samhandlingen fremover blir også mer personlig','','','','','']);
big6.push([150000,100000,'Miljøtrait','Bidrag til miljø','','','','']);
big6.push([151000,150000,'Kostbar klimatilpasning','Klimaendringene medfører risiko og store økonomiske konsekvenser, og får kraftig politisk respons','','','','']);
big6.push([151100,151000,'Betydelig klimarisiko som følger av klimaendringene','','','','','']);
big6.push([151200,151000,'Betydelig klimarisiko med store økonomiske konsekvenser','','','','','']);
big6.push([151300,151000,'Betydelig klimarisiko og store protester','','','','','']);
big6.push([151400,151000,'De fleste store utslippsland konkretiserer mål om utslipp','','','','','']);
big6.push([151500,151000,'Stormakter ser på klimaomstilling som en konkurranse om markedsandeler','','','','','']);
big6.push([151600,151000,' FNs klimamål blir mer styrende for planleggings- og økonomiarbeid','','','','','']);
big6.push([152000,150000,'Grønn vekst','Smart bærekraft og klimaholdning gir klimahandling','','','','']);
big6.push([152100,152000,'Vår klimaholdning gir klimahandling','','','','','']);
big6.push([152100,152000,'Innovativ teknologi anvendes for å skape smartere og mer bærekraftige løsninger','','','','','']);
big6.push([152200,152000,'Næringslivet er en betydelig driver for det grønne skiftet','','','','','']);
big6.push([152300,152000,'Politikerne følger opp med investeringsmidler for annvendelse av innovativ teknologi','','','','','']);
big6.push([160000,100000,'Juritrait','Juridiske endringer','','','','']);
big6.push([161000,160000,'Strengere personvern','GDPR styrker personvernet, men vanskelig balansegang mellom å utnytte muligheter og agere i tråd med direktivet','','','','']);
big6.push([161100,161000,'GDPR styrker personvernet på tvers av EU/EØS, men regelverket er komplisert','','','','','']);
big6.push([161200,161000,'Offentlig sektor med stor mobilisering','','','','','']);
big6.push([161300,161000,'GDPR styrker personvernet på tvers av EU/EØS, men regelverket er komplisert','','','','','']);
big6.push([161400,161000,'Offentlig sektor med stor mobilisering','','','','','']);
big6.push([161500,161000,'Myndighetene kan gjøre mer for å legge til rette','','','','','']);
big6.push([161600,161000,'Stiller også nye krav til bevisstgjøring blant innbyggerne','','','','','']);
big6.push([161700,161000,'Datadeling er et viktig premiss for fremtidens offentlige tjenester','','','','','']);
big6.push([162000,160000,'Ny teknologi gjør regulering mer kompleks','Krevende for regulerende myndighet å holde tritt med den teknologiske utviklingen','','','','']);
big6.push([162100,162000,'Fare for misbruk av teknologi kan lede til forbud','','','','','']);
big6.push([162200,162000,'Behov for nye regelverk','','','','','']);
big6.push([162300,162000,'Nytt regelverk må utvikles raskt, og være i nærmest kontinuerlig utvikling','','','','','']);
big6.push([200000,0,'Big 5 Mini - personality test','The Big Five Personality Test, also known as the Five-Factor Model (FFM), is a widely used framework in psychology to measure and describe personality traits.  The traits are considered to represent broad dimensions of personality and are used to describe and understand individual differences in personality characteristics. It\'s important to note that individuals can possess a combination of high and low scores on each trait, resulting in unique personality profiles.','','','','']);
big6.push([210000,200000,'Open&shy;ness to Experi&shy;ence','This trait reflects a person\'s inclination towards novelty, imagination, creativity, and intellectual curiosity. Individuals high in openness tend to be imaginative, open-minded, adventurous, and appreciate art and beauty. Those low in openness are more conventional, practical, and prefer routine and familiarity.','','','','']);
big6.push([211000,210000,'','','Endless possibilities inspire me to explore new ideas and push the boundaries of what is known','I prefer sticking to what I know and feel comfortable with, as it provides a sense of security and predictability','The desire to embrace life\'s possibilities drives me to constantly seek new experiences and adventures, ensuring I have no regrets','The uncertainty surrounding the unknown inhibits me from venturing outside of my comfort zone and exploring new things']);
big6.push([212000,210000,'','','Embracing novel ideas and unconventional thinking expands my perspective and fosters personal growth','I find comfort in sticking to familiar routines and established methods, as they provide a sense of stability and security','Venturing into unexplored territories fuels my desire for constant self-improvement and discovery','The fear of the unknown prevents me from stepping outside of my comfort zone and trying new things']);
big6.push([220000,200000,'Conscien&shy;tiousness','Conscientiousness refers to the degree of organization, responsibility, dependability, and self-discipline in an individual. Highly conscientious individuals are diligent, reliable, organized, and self-motivated, while those low in conscientiousness may be more spontaneous, laid-back, and less focused on details.','','','','']);
big6.push([221000,220000,'','','Setting high standards and striving for excellence allows me to achieve remarkable results and reach my full potential','Being less focused on details and rules allows me the freedom to explore different approaches and embrace spontaneity','The drive to excel and meet others\' expectations fuels my determination to meticulously plan and execute tasks flawlessly','The aversion to constraints and inflexible systems makes me reluctant to adhere to rules and rigid schedules']);
big6.push([222000,220000,'','','Being organized and detail-oriented allows me to stay on top of my responsibilities and achieve desired outcomes','I value flexibility and spontaneity, as they allow me to adapt and respond effectively to changing circumstances','Striving for perfection and meeting high standards propels me to excel in various aspects of life','The fear of restrictions and rigid structures makes me resist following rules and adhering to strict schedules']);
big6.push([230000,200000,'Extra&shy;version','This trait captures a person\'s sociability, assertiveness, talkativeness, and level of outgoingness. Extroverted individuals tend to be energetic, enthusiastic, and seek social interactions. They are often described as outgoing and gain energy from being around others. Introverted individuals, on the other hand, prefer solitude, tend to be more reserved, and may feel drained by extensive social interactions.','','','','']);
big6.push([231000,230000,'','','The excitement of social interactions and the potential for new connections energize and inspire me to constantly seek out others','Solitude and introspection provide the necessary space to unleash my creativity and delve deeper into my thoughts and ideas','The preference to avoid feelings of loneliness and the fear of missing out on social opportunities motivate me to constantly seek the company of others','The discomfort associated with social interactions and overwhelming stimuli causes me to withdraw and steer clear of situations that may lead to unease']);
big6.push([232000,230000,'','','Engaging in social activities energizes me and helps me thrive in dynamic and collaborative environments','I find solace in solitude and introspection, which provide the space for self-reflection and recharge','The fear of missing out on social opportunities drives me to seek the company of others and engage in social interactions','The fear of overwhelming social interactions and stimuli leads me to withdraw and avoid situations that may cause discomfort']);
big6.push([240000,200000,'Agree&shy;able&shy;ness','Agreeableness reflects a person\'s tendency to be compassionate, cooperative, empathetic, and considerate of others. Those high in agreeableness are typically friendly, helpful, trusting, and prioritize harmonious relationships. Individuals low in agreeableness may be more skeptical, competitive, and assertive.','','','','']);
big6.push([241000,240000,'','','The belief in the power of cooperation and compassion motivates me to create harmony and make a positive impact on others','Asserting my own needs and boundaries allows me the freedom to pursue my goals and desires without feeling restricted','The preference to maintain harmony and avoid conflict and disapproval drives me to prioritize peaceful interactions and steer clear of confrontations','The inclination to protect myself from vulnerability and dependency results in guardedness and prioritizing self-preservation over forming close relationships']);
big6.push([242000,240000,'','','Valuing harmony and empathy allows me to build strong and meaningful connections with others','Asserting my opinions and boundaries enables me to maintain my individuality and personal growth','The fear of conflict and disapproval drives me to prioritize maintaining peace and avoiding any confrontations','The fear of vulnerability and dependence leads me to be guarded and prioritize self-preservation over building close relationships']);
big6.push([250000,200000,'Emotional Stability','This trait refers to the degree of emotional stability and reactivity in an individual. Neuroticism encompasses traits such as anxiety, moodiness, irritability, and susceptibility to stress. Highly neurotic individuals may experience negative emotions more intensely and frequently, whereas those low in neuroticism tend to be more emotionally stable and resilient.','','','','']);
big6.push([251000,250000,'','','Being highly attuned to my emotions enables me to explore the depths of my feelings and gain valuable self-insight','A calm and resilient demeanor allows me to navigate life\'s challenges with composure and maintain a positive outlook','The heightened sensitivity to uncertainty and potential threats intensifies my emotional response, making me more prone to anxiety and stress','The motivation to avoid emotional turmoil and distress drives me to steer clear of situations that might trigger negative emotions, seeking stability and tranquility instead']);
big6.push([252000,250000,'','','Being in touch with my emotions allows me to navigate and understand the complexities of human experience','Maintaining a calm and composed demeanor helps me cope with life\'s challenges and maintain emotional well-being','The fear of uncertainty and potential threats heightens my sensitivity to negative emotions, making me more prone to anxiety and stress','The fear of emotional turmoil and distress motivates me to avoid situations that may trigger negative emotions and seek stability and tranquility']);
big6.push([300000,0,'Big 5 Mini - personlighetstest','Big Five-personlighetstesten, også kjent som Femfaktormodellen (FFM), er en mye brukt ramme i psykologien for å måle og beskrive personlighetstrekk. Disse trekkene betraktes som bredt dimensjoner av personlighet og brukes til å beskrive og forstå individuelle forskjeller i personlighetstrekk. Det er viktig å merke seg at enkeltpersoner kan ha en kombinasjon av høye og lave scorer på hvert trekk, noe som resulterer i unike personlighetsprofiler.','','','','']);
big6.push([310000,300000,'Åpenhet for erfaring','Dette trekket gjenspeiler en persons tiltrekning mot nyhet, fantasi, kreativitet og intellektuell nysgjerrighet. Personer som er høye på åpenhet, har en tendens til å være fantasifulle, åpensinnede, eventyrlystne og sette pris på kunst og skjønnhet. De som er lave på åpenhet, er mer konvensjonelle, praktiske og foretrekker rutine og kjennskap.','','','','']);
big6.push([311000,310000,'','','Endeløse muligheter inspirerer meg til å utforske nye ideer og utfordre grensene for det som er kjent','Foretrekker å holde meg til det jeg vet og føler meg komfortabel med, da det gir en følelse av sikkerhet og forutsigbarhet','Ønsket om å omfavne livets muligheter driver meg til stadig å søke nye opplevelser og eventyr, og sikre at jeg ikke har noen angrende tanker','Usikkerheten rundt det ukjente hindrer meg i å våge utenfor komfortsonen og utforske nye ting']);
big6.push([312000,310000,'','','Å omfavne nye ideer og ukonvensjonell tenkning utvider perspektivet mitt og fremmer personlig vekst','Jeg finner trøst i å holde meg til kjente rutiner og etablerte metoder, da de gir en følelse av stabilitet og trygghet','Våge inn i uutforskede områder gir næring til mitt ønske om kontinuerlig selvforbedring og oppdagelse','Frykten for det ukjente hindrer meg i å trå utenfor komfortsonen og prøve nye ting']);
big6.push([320000,300000,'Samvittig&shy;hetsfullhet','Samvittighetsfullhet refererer til graden av organisasjon, ansvar, pålitelighet og selvdisiplin hos en person. Personer med høy samvittighetsfullhet er flittige, pålitelige, organiserte og selvmotiverte, mens de som er lave på samvittighetsfullhet kan være mer spontane, avslappede og mindre opptatt av detaljer.','','','','']);
big6.push([321000,320000,'','','Å sette høye standarder og strebe etter ekspertise gjør at jeg kan oppnå bemerkelsesverdige resultater og nå mitt fulle potensial','Å være mindre opptatt av detaljer og regler gir meg friheten til å utforske ulike tilnærminger og omfavne spontanitet','Motivasjonen for å utmerke seg og møte andres forventninger driver min besluttsomhet til å planlegge og utføre oppgaver feilfritt','Motviljen mot begrensninger og stive systemer gjør meg motvillig til å følge regler og overholde strenge tidsplaner']);
big6.push([322000,320000,'','','Å være organisert og detaljorientert gjør at jeg kan holde styr på mine ansvarsområder og oppnå ønskede resultater','Jeg verdsetter fleksibilitet og spontanitet, da det gir meg muligheten til å tilpasse meg og reagere effektivt på endrede omstendigheter','Streben etter perfeksjon og oppfyllelse av høye standarder driver meg til å utmerke meg på ulike områder i livet','Frykten for begrensninger og rigide strukturer gjør at jeg motsetter meg å følge regler og holde meg til strenge rutiner']);
big6.push([330000,300000,'Ekstro&shy;versjon','Dette trekket fanger opp en persons sosialitet, pågåenhet, pratelyst og grad av utadvendthet. Utadvendte personer har en tendens til å være energiske, entusiastiske og søke sosiale interaksjoner. De blir ofte beskrevet som utadvendte og får energi av å være sammen med andre. Introverte personer foretrekker derimot å være alene, har en tendens til å være mer reserverte og kan føle seg utmattet av omfattende sosiale interaksjoner.','','','','']);
big6.push([331000,330000,'','','Spenningen ved sosiale interaksjoner og muligheten for nye forbindelser energiserer og inspirerer meg til stadig å søke etter andre','Ensomhet og introspeksjon gir nødvendig plass for å utfolde min kreativitet og dykke dypere inn i mine tanker og ideer','Ønsket om å unngå følelsen av ensomhet og frykten for å gå glipp av sosiale muligheter motiverer meg til stadig å søke selskap av andre','Ubekvemheten knyttet til sosiale interaksjoner og overveldende stimuli får meg til å trekke meg tilbake og unngå situasjoner som kan føre til ubehag']);
big6.push([332000,330000,'','','Å engasjere seg i sosiale aktiviteter gir meg energi og hjelper meg å trives i dynamiske og samarbeidsorienterte miljøer','Jeg finner trøst i ensomhet og introspeksjon, som gir rom for selvrefleksjon og gjenopplading','Frykten for å gå glipp av sosiale muligheter driver meg til å søke selskap av andre og engasjere meg i sosiale interaksjoner','Frykten for overveldende sosiale interaksjoner og stimuli får meg til å trekke meg tilbake og unngå situasjoner som kan føre til ubehag']);
big6.push([340000,300000,'Vennlighet','Vennlighet gjenspeiler en persons tendens til å være medfølende, samarbeidsvillig, empatisk og hensynsfull overfor andre. De som er høye på vennlighet er vanligvis vennlige, hjelpsomme, tillitsfulle og prioriterer harmoniske relasjoner. Personer som er lave på vennlighet kan være mer skeptiske, konkurransedyktige og pågående.','','','','']);
big6.push([341000,340000,'','','Troen på samarbeid og medfølelse motiverer meg til å skape harmoni og ha en positiv innvirkning på andre','Å hevde mine egne behov og grenser gir meg friheten til å forfølge mine mål og ønsker uten å føle meg begrenset','Ønsket om å opprettholde harmoni og unngå konflikt og misbilligelse motiverer meg til å prioritere fredelige interaksjoner og unngå konfrontasjoner','Tendensen til å beskytte meg selv mot sårbarhet og avhengighet resulterer i forsiktighet og prioritering av selvbevaring fremfor å danne nære relasjoner']);
big6.push([342000,340000,'','','Å verdsette harmoni og empati gjør at jeg kan bygge sterke og meningsfulle forbindelser med andre','Å hevde mine meninger og grenser gjør det mulig for meg å opprettholde min individualitet og personlig vekst','Frykten for konflikt og misbilligelse motiverer meg til å prioritere å opprettholde fred og unngå konfrontasjoner','Frykten for sårbarhet og avhengighet fører til forsiktighet og prioritering av selvbevaring fremfor å danne nære relasjoner']);
big6.push([350000,300000,'Emosjonell stabilitet','Dette trekket refererer til graden av emosjonell stabilitet og reaktivitet hos en person. Neurotisisme omfatter trekk som angst, humørsvingninger, irritabilitet og sårbarhet for stress. Personer med høy neurotisisme kan oppleve negative følelser mer intensivt og hyppigere, mens de som er lave på neurotisisme har en tendens til å være mer emosjonelt stabile og motstandsdyktige.','','','','']);
big6.push([351000,350000,'','','Å være sterkt knyttet til mine følelser gjør at jeg kan utforske dybden av mine følelser og få verdifull selvforståelse','En rolig og motstandsdyktig væremåte gjør at jeg kan håndtere utfordringene i livet med fatning og opprettholde et positivt syn på fremtiden','Den økte følsomheten for usikkerhet og potensielle trusler intensiverer min emosjonelle respons og gjør meg mer sårbar for angst og stress','Motivasjonen for å unngå emosjonell uro og lidelse får meg til å holde meg til kjente og trygge rutiner og situasjoner']);
big6.push([352000,350000,'','','Dyp refleksjon over mine følelser og indre tilstander gir meg innsikt og muligheten til å vokse personlig og følelsesmessig','Evnen til å holde meg rolig og håndtere stressende situasjoner uten å miste fatningen hjelper meg med å opprettholde en balansert tilstand av sinnsro og velvære','Den økte sårbarheten for emosjonelle utfordringer gjør meg oppmerksom på mine reaksjoner og gir meg muligheten til å utvikle mestringsstrategier og støtte','Tendensen til å unngå emosjonell uro og negativitet fører meg til å holde meg til det kjente og forutsigbare']);
big6.push([111110,111100,'Klimaomstillingskonkurransen utløser offentlige satsninger','','','','','']);
big6.push([111210,111200,' Mediene har blitt mer opptatt av personer enn av sakene','','','','','']);
big6.push([111310,111300,' 8 av 10 norske politikere har vært utsatt for trusler og hat','','','','','']);
big6.push([111320,111300,' Oppmerksomhet i media får følger','','','','','']);
big6.push([112210,112200,' Unge har i økende grad sin oppmerksomhet på nett','','','','','']);
big6.push([112220,112200,' Digitale medier blir en viktigere kilde til nyheter','','','','','']);
big6.push([112230,112200,' Politikerne bygger merkevare i sosiale medier. Gir rom for dialog, ikke bare enveisformidling','','','','','']);
big6.push([112240,112200,' Sosiale medier og digitale verktøy har endret hvordan politisk påvirkning og valgkamper gjennomføres','','','','','']);
big6.push([112310,112300,' Stor vekst i antallet henvendelser fra media til departementene','','','','','']);
big6.push([112320,112300,' 6 av 10 departementsansatte sier at mediepress har påvirket beslutningsprosesser i eget departement','','','','','']);
big6.push([112310,112300,' Sterk vektlegging av sekretariatsfunksjonen for politisk ledelse','','','','','']);
big6.push([112320,112300,' Kortsiktige hensyn fortrenger den helhetlige og langsiktige politikkutviklingen og styringen','','','','','']);
big6.push([113110,113100,' Gode grunndataregistre, godt utbygd digital infrastruktur og høy digital kompetanse i befolkningen','','','','','']);
big6.push([113120,113100,' Regjeringen la i 2020 fram en stortingsmelding for innovasjon, med undertittel «kultur, ledelse og kompetanse».','','','','','']);
big6.push([113210,113200,' En gjennomgang av de nordiske landenes strategier for innovasjon i offentlig sektor viser at Norges innsats til nå er konsentrert rundt enkeltprosjekter','','','','','']);
big6.push([113220,113200,' Krevende å prioritere innovasjons- og utviklingsprosjekter, særlig de som krever samarbeid på tvers av sektorer, og hvor utgiftene og gevinstene kommer på ulike områder','','','','','']);
big6.push([113230,113200,' Norge faller på innovasjonsranking og er bak andre nordiske land','','','','','']);
big6.push([113310,113300,' De mest innovative kommunene er mellomstore eller relativt store. Små kommuner med store avstander har mindre kapasitet til innovasjon','','','','','']);
big6.push([121110,121100,' Vekst i offentlig konsum og investeringer','','','','','']);
big6.push([121120,121100,' Trenden er ytterligere forsterket av koronakrisen: Bevilgningene økt ytterligere, 7.000,- pr person pr måned trukket fra Oljefondet (jan, -21)','','','','','']);
big6.push([121130,121100,' Fremover vil statens utgifter øke raskere enn inntektene','','','','','']);
big6.push([121210,121200,' Befolkningen har totalt sett økt med 9,6 %, mens aldersgruppen 67- 79 år har økt med 47,5 % og gruppen 90 år og eldre har økt med 20,5 % i perioden 2011-2021 og utviklingen er forventet å fortsette','','','','','']);
big6.push([121220,121200,' NAV forventer økning av mottakere av alderspensjon og hjelpemidler med 40 % til 2035','','','','','']);
big6.push([121310,121300,' I Norge er en av fire i alderen 20-66 år ikke i arbeid (per 2018), og det er en lavere gjennomsnittlig arbeidstid per sysselsatt i Norge sammenlignet med våre naboland. I 2019 jobbet hver snitt-nordmann 2 ukesverk mindre en snitt-svensken og 4 ukesverk mindre enn snitt-finnen','','','','','']);
big6.push([121320,121300,' Andelen menn (25-54 år) utenfor arbeidsstyrken dobbelt så høy nå som på 80-tallet','','','','','']);
big6.push([122110,122100,' I 2008 var verdien av de frem største selskapene i verden 1 600 mrd. dollar – i dag er Microsoft alene verdt 2 000 mrd. Dollar','','','','','']);
big6.push([122120,122100,' Syv av ti største selskaper i verden målt etter børsverdi, er teknologiselskaper','','','','','']);
big6.push([122210,122200,' Plattformselskapene får naturlig monopol når de når en viss størrelse og makten forsterkes av tilgang på store datamengder','','','','','']);
big6.push([122220,122200,' Det kinesiske fintech-selskapet Ant Group har 700 millioner månedlige brukere på sine betalings- og finansieringsløsninger','','','','','']);
big6.push([122230,122200,' Plattformselskapene inntar nye markeder, eks helse ',' GAFAM1 investert 6.8 mrd USD i helseteknologi (2020 - H121), nær 280x statsbudsjettets investering i digital samhandling i helsesektoren','','','','']);
big6.push([122240,122200,' Google med 186 helserelaterte patenter fra 2013-2017 ',' Apple sin smartklokke vil identifisere hjertesykdom og følge med på Parkinsons sykdom','','','','']);
big6.push([122310,122300,' De 20 største teknologiselskapene i verden kommer enten fra USA eller fra Kina','','','','','']);
big6.push([122310,122300,' Det finnes 175 plattformselskaper med verdsettelse over 1 mrd. dollar. Kun 4 % av disse er fra Europa','','','','','']);
big6.push([122410,122400,' Google og Apple sine operativsystemer inneholder begrensninger og komplekse strukturer som gir dem konkurransefortrinn. Regjeringens første versjon av appen «Smittestopp» ble stoppet fordi den ikke ivaretok personvernet som følge av begrensningene i operativsystemene','','','','','']);
big6.push([123110,123100,' At offentlige virksomheter må søke nye former for samarbeid er et av regjeringens prinsipper for økt innovasjon i innovasjonsmeldingen','','','','','']);
big6.push([123120,123100,' Digital Samhandling Offentlig og Privat (DSOP) med deltakere fra Digitaliseringsdirektoratet, Brønnøysundregistrene, Skatteetaten og Bits (bankene), jobber med konkrete digitaliseringsområder som er forventet å ha innsparingspotensial i milliardklassen','','','','','']);
big6.push([123130,123100,' Offentlige selskap etableres for å fremme innovasjon og løse floker, eks. Nye Veier','','','','','']);
big6.push([123210,123200,' Helsesektoren utvikler løsninger der pasienter selv kan ta prøver og analysere dem hjemme, herunder Sykehuset Østfold sitt prosjekt for sikker prøvetakning og analyse i hjemmet','','','','','']);
big6.push([123220,123200,' Plattformer som kobler frivillige ressurser og kommunale hjelpebehov vokste under koronatiden, f.eks Nyby og Luado','','','','','']);
big6.push([123230,123200,' Kommune 3.0: Ansatte, politikere, innbyggere og næringsliv finner sammen ut hvordan et behov eller en utfordring skal løses. Fokus på mestring i alle livets faser og ansvarliggjøring av egne innbyggere','','','','','']);
big6.push([123310,123300,' Mer enn åtte av ti som har innført innovasjon har samarbeidet med én eller flere aktører utenfor egen arbeidsplass under utviklingen av den nyeste innovasjonen','','','','','']);
big6.push([123320,123300,' Mer enn sju av ti av de nyeste innovasjonene har ført til bedre kvalitet på tjenestene','','','','','']);
big6.push([131110,131100,' I perioden 2011-19 har Gini-koeffisienten1 økt med 4,5 % i Norge','','','','','']);
big6.push([131120,131100,' Også forskjeller mellom innvandrerbefolkningen og befolkningen generelt','','','','','']);
big6.push([131210,131200,' Forskjellen mellom menn og kvinners utdanningsnivå blir større år for år – til kvinners fordel','','','','','']);
big6.push([131220,131200,' To av tre innvandrere har ikke den formell kompetansen for å lykkes i norsk arbeidsliv','','','','','']);
big6.push([131310,131300,' 10,7 % i aldersgruppen 18-67 år var uføre i 2021, og det har vært en økning i alle aldersgrupper siden 2015, unntatt de mellom 62 og 67 år','','','','','']);
big6.push([131320,131300,' Andelen av de under 30 år som mottar helserelaterte ytelser øker','','','','','']);
big6.push([131330,131300,' Innvandrere opplever i større grad ensomhet','','','','','']);
big6.push([131340,131300,' 600 000 nordmenn er ikke-digitale. Eldre og folk med lavere utdanning står i fare for å bli utestengt fra samfunnslivet.','','','','','']);
big6.push([132110,132100,' Dobling av antall kvinnelige ordførere siste 20 år og etter kommunevalget i 2019 er 35 % av landets ordførere kvinner (des. 2020)','','','','','']);
big6.push([132210,132200,' Innvandrere som andel av befolkningen har økt, men antall innvandrere forventes å øke med 23 % fra 2020 til 2035, mot tidligere antatt 25 % fra 2019 til 2030','','','','','']);
big6.push([132220,132200,' Per 1. januar 2020 består befolkningen i Oslo av om lag 26 prosent innvandrere. Nordland har færrest innvandrere sett i forhold til folketallet, med om lag 9 prosent.','','','','','']);
big6.push([132310,132300,' EUs webdirektiv om universell utforming av offentlige nettsteder og mobilapplikasjoner (WAD), er nå en del av norsk rett, med nye krav f.o.m 1. januar 2023','','','','','']);
big6.push([132410,132400,' Vest-Europa anses som det beste stedet å leve for LHBT+-grupper2, mens situasjonen er annerledes i mange land i Øst-Europa','','','','','']);
big6.push([132420,132400,' I 2020 endret regjeringen retningslinjene slik at overføringsflyktninger som er faller inn i gruppen LHBT+ skal prioriteres ved uttak','','','','','']);
big6.push([133110,133100,' Storbykommunene har hatt betydelig vekst, med Oslo, og nærliggende kommuner som de store vekstvinnerne','','','','','']);
big6.push([133120,133100,' …mens småkommunene i distriktene tømmes','','','','','']);
big6.push([133130,133100,' Befolkningsveksten forventes å komme primært i og rundt byene','','','','','']);
big6.push([133210,133200,' Andelen eldre er størst i de små kommunene og det er også her fraflyttingen er størst','','','','','']);
big6.push([133220,133200,' En av tre er over 70 år i mange distriktskommuner og vår distrikts-aldring er blant det høyeste i Europa','','','','','']);
big6.push([133310,133300,' Ca. 974 000 lever alene og dermed består 39 % av alle norske husholdninger av én person','','','','','']);
big6.push([134110,134100,' Hvis trenden fortsetter, vil om lag 35 % av dagens jobber forsvinne i løpet av en 20-årsperiode','','','','','']);
big6.push([134120,134100,' OECD anslår at 6 % av jobbene i Norge er under risiko for full automatisering, mens 1/3 av jobbene kan forvente store endringer','','','','','']);
big6.push([134130,134100,' Den største mangelen på arbeidskraft ventes å bli blant yrkesfagutdannede, særlig blant fagarbeidere innen helsefag og håndverksfag. Det ventes også mangel på sykepleiere.','','','','','']);
big6.push([134210,134200,' Rask endring i sysselsetting gir behov for ny læring','','','','','']);
big6.push([134220,134200,' Halveringstiden for undervist kunnskap er nede i fem år. I 2020 endret Lånekassen reglene knyttet til studiebelastning for å få flere til å ta ansvar for egen læring gjennom hele livet','','','','','']);
big6.push([134230,134200,' Behov for ny læring stiller krav til blant annet helsepersonell','','','','','']);
big6.push([134240,134200,' Fremvekst av digitale læringsmidler: Mikrograder, digital teknologi, god effekt av f.eks nettkurs','','','','','']);
big6.push([134250,134200,' Tverrfaglighet og kombinasjonsutdanninger blir viktigere, eks i USA med helsespesialisering i teknoutdanningen og master i sykepleie og IKT og på NTNU har de Master helseinformatikk for helse- el. IT-utdannede, med bl.a metoder for flerfaglig samhandling','','','','','']);
big6.push([134310,134300,' Skaperkraft','','','','','']);
big6.push([134320,134300,' Fordypningsevne','','','','','']);
big6.push([134310,134300,' Informasjonskyndighet','','','','','']);
big6.push([134320,134300,' Sosial kompetanse','','','','','']);
big6.push([135110,135100,' Antallet folkeaksjoner har økt i takt med bedre økonomi','','','','','']);
big6.push([135120,135100,' Brukernes forventninger vil i større grad bli formet av private digitale tjenester. Hele 49 % av befolkningen svarer at deres forventninger til digitale tjenester fra offentlig sektor påvirkes av digitaliseringen av tjenester i privat sektor','','','','','']);
big6.push([135210,135200,' Dette åpner opp for å skape en mer målrettet og effektiv kommunikasjon og «skreddersydde» tjenester','','','','','']);
big6.push([135310,135300,' Økt tillit','','','','','']);
big6.push([151110,151100,' Klimarelatert risiko for helse, liv, matsikkerhet, vanntilgang, sikkerhet og økonomisk vekst øker ved global oppvarming','','','','','']);
big6.push([151210,151200,' Behovet for skred- og flomsikring vil være på minst 700 millioner kroner per år de neste ti årene','','','','','']);
big6.push([151220,151200,' Et stort vedlikeholds- og oppgraderingsbehov for å sikre mer klimarobuste bygg og infrastruktur i norske kommuner og fylker','','','','','']);
big6.push([151310,151300,' De «gule vestene» i Frankrike protesterte mot avgifter på bensin','','','','','']);
big6.push([151320,151300,' 40.000 nederlandske bønder tok til gatene for å protestere mot regjeringens mål om å kutte nitrogen og ammoniakk med 50%','','','','','']);
big6.push([151410,151400,' USA, EU, Japan og Sør-Korea har mål om nullutslipp i 2050','','','','','']);
big6.push([151410,151400,' Kina ønsker å nå netto nullutslipp innen 2060','','','','','']);
big6.push([151420,151400,' Norge med ambisiøs plan om omstilling av samfunnet for 2021-2030, hvor de skal oppfylle klimamålet og skape grønn vekst.','','','','','']);
big6.push([151510,151500,' Kina og USA konkurrerer om å bli verdensledende i grønn teknologi','','','','','']);
big6.push([151520,151500,' EU-kommisjonens «grønne giv» er kjernen i Europas vekststrategi','','','','','']);
big6.push([151610,151600,' Klimamål blir mer styrende','','','','','']);
big6.push([152110,152100,' Økt anvendelse av smartere og mer bærekraftige løsninger','','','','','']);
big6.push([152210,152200,' Klimahandling','','','','','']);
big6.push([152310,152300,' NHO peker på betydelige muligheter for norske bedrifter til å levere løsninger med samfunnsmessige positive effekter','','','','','']);
big6.push([152320,152300,' Långivere, både private og offentlige, har makt til å påvirke selskaper til å endre seg i en mer bærekraftig retning. De siste årene har klima fått stadig større oppmerksomhet i finansmiljøene, globalt og i Norge. Tilbydere av finansiering er opptatt av klimarisiko - men også de kommersielle mulighetene i klimaomstilling','','','','','']);
big6.push([152330,152300,' EU med felles definisjon på hva som kan klassifiseres som bærekraftig innen finansmarkedet','','','','','']);
big6.push([152410,152400,' Økte investeringer til innovativ teknologi','','','','','']);
big6.push([152510,152500,' I løpet av 2020 ble 26 ferjesamband elektrifiserte, og i 2022 vil det trolig være rundt 70 el-ferger i drift. Et resultat av godt samspill mellom støtteordninger og offentlige krav og anbud for å stimulere teknologiutvikling','','','','','']);
big6.push([161110,161100,' To år etter at GDPR ble innført, fastslo en evaluering at håndhevingen har gått tregt','','','','','']);
big6.push([161210,161200,' Alle offentlige myndigheter må ha et personvernombud og nye løsninger skal ha innebygget personvern fra og med juli 2018','','','','','']);
big6.push([161220,161200,' Ambisjonen om økt digitalisering i offentlig sektor betyr at styrking av personvern og informasjonssikkerhet blir viktigere','','','','','']);
big6.push([161310,161300,' To år etter at GDPR ble innført, fastslo en evaluering at håndhevingen har gått tregt','','','','','']);
big6.push([161410,161400,' Alle offentlige myndigheter må ha et personvernombud og nye løsninger skal ha innebygget personvern fra og med juli 2018','','','','','']);
big6.push([161420,161400,' Ambisjonen om økt digitalisering i offentlig sektor betyr at styrking av personvern og informasjonssikkerhet blir viktigere','','','','','']);
big6.push([161510,161500,' Norge scorer lavt i EUs eGovernment benchmark på å gi brukerne oversikt over dataene som blir brukt og hva de brukes til','','','','','']);
big6.push([161520,161500,' Kommunene har kommet relativt kort i å tilrettelegge for god dataforvaltning, gjenbruk og videre bruk.','','','','','']);
big6.push([161610,161600,' Vår «digitale tvilling» er svært ettertraktet på digitale reklamebørser','','','','','']);
big6.push([161620,161600,' Krevende å få oversikt og informasjon om hva appen vet om oss','','','','','']);
big6.push([161630,161600,' Flertallet er ikke villig til å dele personlig data','','','','','']);
big6.push([161710,161700,' Regulatoriske sandkasser tillater testing uten fulle godkjenningskrav','','','','','']);
big6.push([161720,161700,' Datatilsynet skal etablere et testmiljø for kunstig intelligens som tar i bruk personopplysninger','','','','','']);
big6.push([162110,162100,' Den amerikanske kongressen har bedt Facebook stoppe arbeidet med sin digitale valuta da det er for stor usikkerhet om regulering','','','','','']);
big6.push([162110,162100,' Ansiktsgjenkjenning har mange fordeler men har også stort potensial for å bli misbrukt. Bl.a San Fransisco har forbudt offentlig bruk','','','','','']);
big6.push([162210,162200,' Nasjonal sikkerhetsmyndighet trekker frem 5G og IoT, adopsjon av moderne virtualisering og skyteknologier som krevende områder','','','','','']);
big6.push([162220,162200,' Stortinget vedtok å endre Bioteknologiloven på flere punkter sommeren 2020','','','','','']);
big6.push([162230,162200,' Selvkjørende kjøretøy allerede er i bruk, og det er nødvendig å utvikle et lovverk som tydeligere fordeler ansvar når ulykker skjer','','','','','']);
big6.push([162310,162300,' Samfunnsområdene som regelverket skal regulere, er i mye raskere omstilling enn tidligere','','','','','']);
big6.push([162320,162300,' Kompensasjonsordningen for næringslivet under covid-19 ble utviklet på tre uker. Regelverksutvikling, faglige avklaringer og teknisk utvikling forgikk samtidig','','','','','']);
big6.push([162330,162300,' Behov for god sammenheng i regelverksutviklingen på tvers av sektorene for gode og effektive tjenester','','','','','']);

