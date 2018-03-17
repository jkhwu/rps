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
    var connectedRef = database.ref("/.info/connected");
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
            $("#gif").hide();
            app.addDatabaseListeners();
            app.addButtonListeners();
            app.addChatListeners();
        },
        addDatabaseListeners: () => {
            database.ref().on("value", (snap) => {
                if (snap.child("turn").val() !== null && player == undefined) $(".container").html("<h2>There are already two players. Please refresh in a few minutes to check if they're finished.</h2>");
            });
            playersRef.on("child_added", (childsnap) => {
                var num = childsnap.key;
                name[num] = childsnap.val().name;
                $(`#p${num}Header`).html(`<strong>${name[num]}</strong>`);
                $(`#p${num}Tally`).text(`${childsnap.val().wins} wins | ${childsnap.val().losses} losses`);
            });
            playersRef.once("child_removed", (childsnap) => {
                var num = childsnap.key;
                app.sendDisconnect(num);
                $("#narrationText").text("Please wait for other player to connect.");
                $(`#p${num}Header`).text(`Waiting for Player ${num}...`).removeClass("bg-info");
                $(".card-body").empty();
                $(".card-footer").text("0 wins | 0 losses");
            });
            turnRef.on("value", (snap) => {
                var turnNum = snap.val();
                if (turnNum == 1) app.turn1();
                else if (turnNum == 2) app.turn2();
                else if (turnNum == 3) app.turn3();
            });
            playersRef.child(1).on("child_changed", (childsnap) => {
                if (childsnap.key == "wins") wins1 = childsnap.val();
                else if (childsnap.key == "losses") losses1 = childsnap.val();
                $("#p1Tally").text(`${wins1} wins | ${losses1} losses`);
            });
            playersRef.child(2).on("child_changed", (childsnap) => {
                if (childsnap.key == "wins") wins2 = childsnap.val();
                else if (childsnap.key == "losses") losses2 = childsnap.val();
                $("#p2Tally").text(`${wins2} wins | ${losses2} losses`);
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
                if ($("#chatInput").val() !== "") {
                    app.sendChat($("#chatInput").val());
                    $("#chatInput").val("");
                }
            });
        },
        addChatListeners: () => chatRef.on("child_added", (childsnap) => app.showChat(childsnap.val().name, childsnap.val().message)),
        readyPlayer: () => {
            playersRef.once("value", (snap) => {
                if (!snap.child("1").exists()) {
                    player = 1;
                } else if (!snap.child("1").exists() && snap.child("2").exists()) {
                    player = 1;
                    turnRef.set(1);
                } else {
                    player = 2;
                    turnRef.set(1);
                }
                app.addPlayer();
            });
        },
        addPlayer: () => {
            var playerName = $("#nameInput").val();
            $("#playerGreeting").text(`Hi, ${playerName}. You are Player ${player}.`);
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
            $("#gif").show();
            $("#results").hide();
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
            app.updateVars();
        },
        turnMessage: (playTurn) => {
            otherPlayer = player == 1 ? 2 : 1;
            if (playTurn == player) $("#narrationText").text("It's your turn!");
            else if (playTurn == otherPlayer) $("#narrationText").text(`Please wait for ${name[otherPlayer]} to choose.`);
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
            turnRef.once("value", (snap) => {
                var turnNum = snap.val();
                turnNum++;
                turnRef.set(turnNum);
            });
        },
        updateVars: () => {
            playersRef.once("value", function(snap) {
                var snap1 = snap.val()[1];
                var snap2 = snap.val()[2];
                choice1 = snap1.choice;
                wins1 = snap1.wins;
                losses1 = snap1.losses;
                choice2 = snap2.choice;
                wins2 = snap2.wins;
                losses2 = snap2.losses;
                var textChoice = otherPlayer == 1 ? choice1 : choice2;
                $(`#p${otherPlayer}Choices`).empty().html(`<h1>${textChoice}</h1>`);
                app.figureWinner();
            });
        },
        figureWinner: () => {
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
        winner: (num) => {
            var results, wins, losses;
            if (num == 0) results = "Tie Game!"
            else {
                results = name[num] + " wins!";
                if (num == 1) {
                    wins = wins1;
                    losses = losses2;
                } else {
                    wins = wins2;
                    losses = losses1;
                }
                wins++;
                losses++;
                var otherNum = num == 1 ? 2 : 1;
                playersRef.child(num).update({ wins: wins });
                playersRef.child(otherNum).update({ losses: losses });
            }
            $("#gif").hide();
            $("#results").html(`<h3 class="card-title">${results}</h3>`).show();
            setTimeout(() => {
                turnRef.set(1);
                $("#results").empty();
            }, 3000);
        },
        sendChat: (msg) => {
            if (player !== undefined) chatRef.push({ name: name[player], message: msg });
        },
        sendDisconnect: (num) => chatRef.push({ name: name[num], message: " has disconnected." }),
        showChat: (playerName, message) => {
            var line = $("<p>").html(`${playerName}: ${message}`);
            if (name[1] == playerName) line.css("color", "turquoise");
            else if (name[2] == playerName) line.css("color", "red");
            $("#chatbox").prepend(line);
        },
    }
    app.load();
});