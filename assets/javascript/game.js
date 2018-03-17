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
    var chatRef = database.ref("/chat");
    var player, otherPlayer, userRef, wins1, wins2, losses1, losses2;
    var name = {};
    var choices = ["👊", "🤚", "✌️"];
    turnRef.onDisconnect().remove();
    chatRef.onDisconnect().remove();

    const app = {
        load: () => {
            app.addDatabaseListeners();
            app.addButtonListeners();
            app.addChatListeners();
        },
        addDatabaseListeners: () => {
            database.ref().on("value", (snapshot) => {
                var turnVal = snapshot.child("turn").val();
                if (turnVal !== null && player == undefined) {
                    $(".container").empty();
                    var message = $("<div>").addClass("container").html("<h2>There are already two players. Please refresh in a few minutes to check if they're finished.</h2>");
                    $("body").append(message);
                }
            });
            playersRef.on("child_added", (childSnapshot) => {
                var key = childSnapshot.key;
                name[key] = childSnapshot.val().name;
                $(`#p${key}Header`).html(`<strong>${name[key]}</strong>`);
                var wins = childSnapshot.val().wins;
                var losses = childSnapshot.val().losses;
                $(`#p${key}Tally`).text(`${wins} wins | ${losses} losses`);
            });
            playersRef.on("child_removed", (childSnapshot) => {
                var key = childSnapshot.key;
                app.sendDisconnect(key);
                $("#narrationText").text("Please wait for other player to connect.");
                $(`#p${key}Header`).text(`Waiting for Player ${key}...`).removeClass("bg-info");
                $(".card-body").empty();
                $(".card-footer").text("0 wins | 0 losses");
            });
            turnRef.on("value", (snapshot) => { //verified
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
            playersRef.child(1).on("child_changed", (childSnapshot) => { //verified
                if (childSnapshot.key == "wins") {
                    wins1 = childSnapshot.val();
                } else if (childSnapshot.key == "losses") {
                    losses1 = childSnapshot.val();
                }
                $("#p1Tally").text(`${wins1} wins | ${losses1} losses`);
            });
            playersRef.child(2).on("child_changed", (childSnapshot) => {
                if (childSnapshot.key == "wins") {
                    wins2 = childSnapshot.val();
                } else if (childSnapshot.key == "losses") {
                    losses2 = childSnapshot.val();
                }
                $("#p2Tally").text(`${wins2} wins | ${losses2} losses`)
            });
        },
        addButtonListeners: () => {
            $("#startBtn").one("click", (event) => {
                event.preventDefault();
                if ($("#nameInput").val() !== "") {
                    app.readyPlayer();
                    $("#nameInput").val("");
                }
            });
            $("#sendBtn").on("click", (event) => {
                event.preventDefault();
                console.log("sendBtn clicked");
                if ($("#chatInput").val() !== "") {
                    var message = $("#chatInput").val();
                    $("#chatInput").val("");
                    app.sendChat(message);
                }
            });
        },
        addChatListeners: () => {
            console.log("addChatListeners");
            chatRef.on("child_added", (childSnapshot) => {
                var playerName = childSnapshot.val().name;
                var message = childSnapshot.val().message;
                app.showChat(playerName, message);
            });
        },
        readyPlayer: function() { //in progress
            playersRef.once("value", function(snapshot) {
                if (!snapshot.child("1").exists()) {
                    player = 1;
                } else if (!snapshot.child("1").exists() && snapshot.child("2").exists()) {
                    player = 1;
                    turnRef.set(1);
                } else {
                    player = 2;
                    turnRef.set(1);
                }
                app.addPlayer();
            });
        },
        addPlayer: function() { // is count needed?
            var playerName = $("#nameInput").val();
            $("#playerGreeting").text("Hi, " + playerName + ". You are Player " + player + ".");
            userRef = playersRef.child(player);
            userRef.onDisconnect().remove();
            userRef.set({
                name: playerName,
                wins: 0,
                losses: 0
            });
        },
        turn1: () => {
            $(".card-body").empty();
            $(`#p1Header`).addClass("bg-info");
            app.turnMessage(1);
            if (player == 1) app.showChoices();
        },
        turn2: () => {
            $("#p1Header").removeClass("bg-info");
            $("#p2Header").addClass("bg-info");
            app.turnMessage(2);
            if (player == 2) app.showChoices();
        },
        turn3: () => {
            $("#p2Header").removeClass("bg-info");
            app.turnMessage(3);
            app.outcome();
        },
        turnMessage: (playTurn) => {
            otherPlayer = player == 1 ? 2 : 1;
            if (playTurn == player) {
                $("#narrationText").text("It's your turn!");
            } else if (playTurn == otherPlayer) {
                $("#narrationText").text(`Please wait for ${name[otherPlayer]} to choose.`);
            }
        },
        showChoices: () => {
            for (var i in choices) {
                $(`#p${player}Choices`).append(`<a href="#" class="choice btn btn-lg btn-secondary mb-1 mr-1" data-choice="${choices[i]}">${choices[i]}</a>`);
            }
            $(document).one("click", "a", app.setChoice);
        },
        setChoice: function() {
            var selection = $(this).attr("data-choice");
            userRef.update({ choice: selection });
            $(`#p${player}Choices`).html(`<h1>${selection}</h1>`);
            turnRef.once("value", (snapshot) => {
                var turnNum = snapshot.val();
                turnNum++;
                turnRef.set(turnNum);
            });
        },
        outcome: () => {
            playersRef.once("value", function(snapshot) {
                var snap1 = snapshot.val()[1];
                var snap2 = snapshot.val()[2];
                choice1 = snap1.choice;
                wins1 = snap1.wins;
                losses1 = snap1.losses;
                choice2 = snap2.choice;
                wins2 = snap2.wins;
                losses2 = snap2.losses;
                var textChoice = otherPlayer == 1 ? choice1 : choice2;
                $(`#p${otherPlayer}Choices`).empty().html(`<h1>${textChoice}</h1>`);
                app.logic();
            });
        },
        logic: () => {
            if (choice1 == choice2) app.winner(0);
            else if (choice1 == "👊") {
                if (choice2 == "🤚") app.winner(2);
                else if (choice2 == "✌️") app.winner(1);
            } else if (choice1 == "🤚") {
                if (choice2 == "👊") app.winner(1);
                else if (choice2 == "✌️") app.winner(2);
            } else if (choice1 == "✌️") {
                if (choice2 == "👊") app.winner(2);
                else if (choice2 == "🤚") app.winner(1);
            }
        },
        winner: (playerNum) => {
            var results;
            var wins;
            var losses;
            if (playerNum == 0) results = "Tie Game!"
            else {
                results = name[playerNum] + " Wins!";
                if (playerNum == 1) {
                    wins = wins1;
                    losses = losses2;
                } else {
                    wins = wins2;
                    losses = losses1;
                }
                wins++;
                losses++;
                var otherPlayerNum = playerNum == 1 ? 2 : 1;
                setTimeout(() => {
                    playersRef.child(playerNum).update({ wins: wins });
                    playersRef.child(otherPlayerNum).update({ losses: losses });
                }, 500);
            }
            setTimeout(() => $("#results").html(`<h3 class="card-title">${results}</h3>`), 500);
            setTimeout(() => {
                turnRef.set(1);
                $("#results").empty();
            }, 2000);
        },
        sendChat: (msg) => {
            if (player !== undefined) {
                chatRef.push({ name: name[player], message: msg });
            }
        },
        sendDisconnect: (num) => {
            chatRef.push({ name: name[num], message: " has disconnected." });
        },
        showChat: (playerName, message) => {
            var line = $("<p>").html(`${playerName}: ${message}`);
            if (name[1] == playerName) {
                line.css("color", "turquoise");
            } else if (name[2] == playerName) {
                line.css("color", "red");
            }
            $("#chatbox").prepend(line);
        },
        // logVars: () => {
        //     console.log("--------------");
        //     console.log(`Player: ${player}, otherPlayer: ${otherPlayer}, userRef: ${userRef}, wins1: ${wins1}, wins2: ${wins2}, losses1: ${losses1}, losses2: ${losses2}, name: ${name}`);
        //     console.log("--------------");
        // }
    }
    app.load();
});