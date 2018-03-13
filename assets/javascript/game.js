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