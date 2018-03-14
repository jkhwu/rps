"use strict";
var config = { // Initialize Firebase
    apiKey: "AIzaSyD-hi5qrPHcSZFbTbuwcRGvr2RVLJAJxs0",
    authDomain: "rps-app-be56e.firebaseapp.com",
    databaseURL: "https://rps-app-be56e.firebaseio.com",
    projectId: "rps-app-be56e",
    storageBucket: "",
    messagingSenderId: "1086164440538"
};
firebase.initializeApp(config);
var database = firebase.database();
(() => {
    const app = {
        p1Ref: database.ref("/players/1"),
        p2Ref: database.ref("/players/2"),
        phsRef: database.ref("/phase"),
        you: "tbd",
        opp: "tbd",

        load: () => {
            app.decrementPhase();
            app.addDatabaseListeners();
            app.addButtonListeners();
        },
        addDatabaseListeners: () => {
            // console.log("addDatabaseListeners")
            database.ref().on("value", (snap) => {
                // console.log("Database ref changed value");
            });
            database.ref(".info/connected").on("value", (snap) => {
                if (snap.val()) { // If they are connected...
                    // console.log("Connected ref changed value");
                }
            });
        },
        addButtonListeners: () => {
            // console.log("addButtonListeners");
            $("#startBtn").on("click", (event) => {
                event.preventDefault();
                console.log("startBtn clicked");
                app.readyPlayer();
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
        incrementPhase: () => {
            console.log("incrementPhase triggered");
            app.phsRef.transaction(function(currentPhase) {
                if (currentPhase === null) return 1
                else return currentPhase + 1;
            });
        },
        decrementPhase: () => {
            console.log("decrementPhase triggered");
            app.phsRef.transaction(function(currentPhase) {
                if (currentPhase === null) return 1
                else return currentPhase - 1;
            });
        },
        readyPlayer: (num) => {
            console.log("readyPlayer(" + num + ")");
            p1.push({

            });
        },
        sendChat: (px) => {
            console.log(`sendChat(${px})`);
            $("#chatbox").prepend(`${px}: ${$("#chatInput").val().trim()}<br>`)
        },
    }
    app.load();
})();