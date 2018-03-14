"use strict";

// Initialize Firebase
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

(() => {
    const app = {
        validKeystrokes: ["r", "p", "s"],
        choices: { r: "👊", p: "🤚", s: "✌️" },
        p1: { color: "red" },
        p2: { color: "green" },
        turn: -1,
        load: () => {
            app.addDatabaseListeners();
            app.addButtonListeners();
        },
        addDatabaseListeners: () => {
            console.log("addDatabaseListeners")
            database.ref().on("value", (snapshot) => {
                console.log("database value triggered");
                // app.getPhase(snapshot);
            });
        },
        addButtonListeners: () => {
            console.log("addButtonListeners");
            $("#startBtn").on("click", (event) => {
                event.preventDefault();
                console.log("startBtn clicked");
                if (phase === 0) app.readyPlayerOne();
                else if (phase === 1) app.readyPlayerTwo();
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
        getPhase: (snapshot) => {
            console.log("getPhase");

        },
        readyPlayerOne: () => {
            console.log("readyPlayerOne");
        },
        readyPlayerTwo: () => {
            console.log("readyPlayerTwo");
        },
        sendChat: (px) => {
            console.log(`sendChat(${px})`);
            $("#chatbox").prepend(`${px}: ${$("#chatInput").val().trim()}<br>`)
        },
    }
    app.load();
})();