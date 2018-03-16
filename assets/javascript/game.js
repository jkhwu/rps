$(document).ready(function() {
    //Initialize Firebase
    var config = {
        apiKey: "AIzaSyD-hi5qrPHcSZFbTbuwcRGvr2RVLJAJxs0",
        authDomain: "rps-app-be56e.firebaseapp.com",
        databaseURL: "https://rps-app-be56e.firebaseio.com",
        projectId: "rps-app-be56e",
        storageBucket: "",
        messagingSenderId: "1086164440538"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    var presenceRef = database.ref("/.info/connected");
    var playersRef = database.ref("/players");
    var turnRef = database.ref("/turn");
    var chatRef = database.ref("chat");
    var player, otherPlayer, userRef, wins1, wins2, losses1, losses2;
    var name = {};
    var choices = ["👊", "🤚", "✌️"];
    turnRef.onDisconnect().remove();
    chatRef.onDisconnect().remove();

    const app = {
        load: () => {
            console.log("loaded?")
            app.addDatabaseListeners();
            app.addButtonListeners();
            app.addChatListeners();
        },
        addDatabaseListeners: () => {
            console.log("addDatabaseListeners")
            database.ref().on("value", (snapshot) => {
                var turnVal = snapshot.child("turn").val();
                if (turnVal !== null && player == undefined) {
                    console.log("too many players");
                    $(".container").empty();
                    var message = $("<div>").addClass("container").html("<h2>There are already two players. Please refresh in a few minutes to check if they're finished.</h2>");
                    $("body").append(message);
                }
            });
            playersRef.on("child_added", (childSnapshot) => {
                var key = childSnapshot.key();
                name[key] = childSnapshot.val().name;
                var waiting = $(`#p${key}Header`).text(`name[key]`);
                var wins = childSnapshot.val().wins;
                var losses = childSnapshot.val().losses;
                $(`#p${key}Tally`).text(`${wins} wins | ${losses} losses`);
            });
            playersRef.on("child_removed", (childSnapshot) => {
                var key = childSnapshot.key();
                app.sendDisconnect(key);
                $(`#p${key}Header`).text(`Waiting for Player ${key}...`);
                $(".card-body").empty();
                $(".card-footer").text("0 wins | 0 losses");
            });
            turnRef.on("value", (snapshot) => {
                var turnNum = snapshot.val();
                if (turnNum == 1) {
                    $(".card-body #results").empty();
                    app.turn1();
                } else if (turnNum == 2) {
                    app.turn2();
                } else if (turnNum == 3) {
                    app.turn3();
                }
            });
            playersRef.child(1).on("child_changed", (childSnapshot) => {
                if (childSnapshot.key() == "wins") {
                    wins1 = childSnapshot.val();
                } else if (childSnapshot.key() == "losses") {
                    losses1 = childSnapshot.val();
                }
                if (wins1 !== undefined) {
                    $("#p1Tally").text(`${wins1} wins | ${losses1} losses`)
                }
            });
            playersRef.child(2).on("child_changed", (childSnapshot) => {
                if (childSnapshot.key() == "wins") {
                    wins2 = childSnapshot.val();
                } else if (childSnapshot.key() == "losses") {
                    losses2 = childSnapshot.val();
                }
                if (wins1 !== undefined) {
                    $("#p1Tally").text(`${wins2} wins | ${losses2} losses`)
                }
            });
        },
        addButtonListeners: () => {
            console.log("addButtonListeners");
            $("#startBtn").one("click", (event) => {
                event.preventDefault();
                app.readyPlayer(); // add if statement for blanks
            });
            $("#sendBtn").on("click", (event) => {
                event.preventDefault();
                console.log("sendBtn clicked");
                if ($("#chatInput").val() !== "") {
                    app.sendChat("p1");
                    $("#chatInput").val("");
                }
            });
        },
        addChatListeners: () => {
            console.log("addChatListeners");
        },
        incrementPhase: () => { //done
            console.log("incrementPhase triggered");
            app.phsRef.transaction(function(currentPhase) {
                if (currentPhase === null) return 1
                else return currentPhase + 1;
            });
        },
        decrementPhase: () => { //done
            console.log("decrementPhase triggered");
            app.phsRef.transaction(function(currentPhase) {
                if (currentPhase === null) return 1
                else return currentPhase - 1;
            });
        },
        readyPlayer: () => { //in progress
            console.log("readyPlayer triggered");
            database.once("value", (snapshot) => {
                var playerObj = snapshot.child("playersRef");
                var num = playerObj.numChildren();
                if (num == 0) {
                    player = 1;
                    app.addPlayer(player); // try refactoring this
                } else if (num == 1 && playerObj.val()[2] !== undefined) {
                    player = 1;
                    app.addPlayer(player);
                    turnRef.set(1);
                } else if (num == 1) {
                    player = 2;
                    app.addPlayer(player);
                    turnRef.set(1);
                }
            });
        },
        addPlayer: (count) => { // is count needed?
            var playerName = $("#nameInput").val();
            $("#narrationText").text(`Hi ${playerName}. You are Player ${player}.`).removeClass("invisible");
            userRef = playersRef.child(count);
            userRef.onDisconnect().remove();
            userRef.set({
                name: playerName,
                wins: 0,
                losses: 0
            });
        },
        turn1: () => {
            console.log("turn1");

        },
        turn2: () => {
            console.log("turn1");

        },
        turn3: () => {
            console.log("turn1");

        },
        turnMessage: (playTurn) => {
            otherPlayer = player == 1 ? 2 : 1;
            if (playTurn == player) {
                $("#narrationText").text("It's your turn!");
            } else if (playTurn == otherPlayer) {
                $("#narrationText").text(`Waiting for name[otherPlayer] to choose.`);
            } else {
                $("#narrationText").addClass("invisible");
            }
        },
        showChoice: () => { //add an s
            for (var i in choices) {
                $(`#p{player}Choices`).append(`<a href="#" class="choice btn btn-lg btn-secondary mb-1" value="${i}">${i}</a>`);
            }
            $(document).one("click", "a", app.setChoice);
        },
        setChoice: function() {
            var selection = $(this).val();
            userRef.update({ choice: selection });
        },
        sendChat: (px) => { // done for now
            console.log(`sendChat(${px})`);
            $("#chatbox").prepend(`${px}: ${$("#chatInput").val().trim()}<br>`)
        },
        sendDisconnect: (num) => {

        }
    }
    app.load();
});

// // Initialize Firebase
// var config = { 
//     apiKey: "AIzaSyD-hi5qrPHcSZFbTbuwcRGvr2RVLJAJxs0",
//     authDomain: "rps-app-be56e.firebaseapp.com",
//     databaseURL: "https://rps-app-be56e.firebaseio.com",
//     projectId: "rps-app-be56e",
//     storageBucket: "",
//     messagingSenderId: "1086164440538"
// };
// firebase.initializeApp(config);
// var database = firebase.database();
// (() => {
//     const app = {
//         p1Ref: database.ref("/players/1"),
//         p2Ref: database.ref("/players/2"),
//         phsRef: database.ref("/phase"),
//         you: "tbd",
//         opp: "tbd",

//         load: () => {
//             console.log(app.incrementPhase());
//             app.addDatabaseListeners();
//             app.addButtonListeners();
//         },
//         addDatabaseListeners: () => {
//             // console.log("addDatabaseListeners")
//             database.ref().on("value", (snap) => {
//                 // console.log("Database ref changed value");
//             });
//             database.ref(".info/connected").on("value", (snap) => {
//                 if (snap.val()) { // If they are connected...
//                     // console.log("Connected ref changed value");
//                 }
//             });
//         },
//         addButtonListeners: () => {
//             // console.log("addButtonListeners");
//             $("#startBtn").on("click", (event) => {
//                 event.preventDefault();
//                 // console.log("startBtn clicked");
//                 app.readyPlayer();
//             });
//             $("#sendBtn").on("click", (event) => {
//                 event.preventDefault();
//                 console.log("sendBtn clicked");
//                 if ($("#chatInput").val() !== "") {
//                     app.sendChat("p1");
//                     $("#chatInput").val("");
//                 }
//             });
//         },
//         incrementPhase: () => { //done
//             console.log("incrementPhase triggered");
//             app.phsRef.transaction(function(currentPhase) {
//                 if (currentPhase === null) return 1
//                 else return currentPhase + 1;
//             });
//         },
//         decrementPhase: () => { //done
//             console.log("decrementPhase triggered");
//             app.phsRef.transaction(function(currentPhase) {
//                 if (currentPhase === null) return 1
//                 else return currentPhase - 1;
//             });
//         },
//         readyPlayer: () => { //in progress
//             console.log("readyPlayer triggered");
//             console.log(app.phsRef.phase);
//         },
//         sendChat: (px) => { // come back to this
//             console.log(`sendChat(${px})`);
//             $("#chatbox").prepend(`${px}: ${$("#chatInput").val().trim()}<br>`)
//         },
//     }
//     app.load();
// })();