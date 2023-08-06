
async function DbInitialize() {
    // Initialize Firebase var firebaseConfig = {apiKey: 'YOUR_API_KEY',authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',projectId: 'YOUR_PROJECT_ID',storageBucket: 'YOUR_PROJECT_ID.appspot.com',messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',appId: 'YOUR_APP_ID'};
    firebase.initializeApp({
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
        databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
        projectId: 'YOUR_PROJECT_ID',
        storageBucket: 'YOUR_PROJECT_ID.appspot.com',
        messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
        appId: 'YOUR_APP_ID'
    });
    var db = firebase.database(); // Get a reference to the database
    // Create tables if not exists user, trait, usersegment, attitude, segment, belief, segmentrule
    var snapshot = await db.ref('segmentrule').once('value');
    if (!snapshot.exists()) // Create tables user, trait, usersegment, attitude, segment, belief, segmentrule. Initialize with dummy data
        await Promise.all(
            db.ref('user').set({userid: '-1', beliefid: '-1', createdtime: '2000-01-01 00:00:00', lastaccess: '2000-01-01 00:00:00'})
            ,db.ref('trait').set({traitid: '-1', beliefid: '-1', attitudeavg: '-1', attitudecertainty: '-1', fearavg: '-1', fearcertainty: '-1'})
            ,db.ref('usersegment').set({usersegmentid: '-1', createdtime: '2000-01-01 00:00:00', modifiedtime: '2000-01-01 00:00:00', usercomment: '?'})
            ,db.ref('attitude').set({attitudeid: '-1', attitudetopid: '-1', beliefid: '-1', attitudeygngybnb: '-1', time: '2000-01-01 00:00:00'})
            ,db.ref('segment').set({segmentid: '-1', segmentname: '??', opositesegmentid: '-1', modifiedtime: '2000-01-01 00:00:00'})
            ,db.ref('belief').set({beliefid: '-1', parentid: '-1', belief: '???', consequence: '????', attitudeyesgood: '? ?', attitudenogood: '?? ?', attitudeyesbad: '? ??', attitudenobad: '?? ??'})
            ,db.ref('segmentrule').set({segmentruleid: '-1', segmentid: '-1', beliefid: '-1', attitudeavgmin: '-1', attitudeavgmax: '-1', attitudeavgdev: '-1', fearavgmin: '-1', fearavgmax: '-1', fearavgdev: '-1', modifiedtime: '2000-01-01 00:00:00'})
        ); // Wait for completion.
}
function UserInitialize(_name, _age) {
    DbInitialize().then(function() {
        var db = firebase.database(); // Get a reference to the database
        var ref = db.ref('users').push({name: _name, age: _age});
        ref.on('value', gotData, errData);
    });
}
function RegisterAttitude(){alert('RegisterAttitude');}
function RecalculateTraits(){alert('RecalculateTraits');}
function CreateSegments(){alert('CreateSegments');}
function DecideSegment(){alert('DecideSegment');}
function GetSegmentAndTraits(){alert('GetSegmentAndTraits');}
