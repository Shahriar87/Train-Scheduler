// Firebase Initialization
var config = {
    apiKey: "AIzaSyC1XHduHYE7HBonDI3vL0xoCegu26hBCE0",
    authDomain: "train-scheduler-f6b95.firebaseapp.com",
    databaseURL: "https://train-scheduler-f6b95.firebaseio.com",
    projectId: "train-scheduler-f6b95",
    storageBucket: "train-scheduler-f6b95.appspot.com",
    messagingSenderId: "904168757222"
};
firebase.initializeApp(config);


var dataRef = firebase.database();
var trainName = "";
var trainDest = "";
var firstTime = "";
var trainFreq = 0;
var currentTime = moment();


function checkTime() {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($("#startTime").val());
    if (isValid) {
        $("#startTime").addClass("bg-success")
        setTimeout(function () {
            $("#startTime").removeClass("bg-success")
        }, 2000);
    } else {
        $("#startTime").addClass("bg-danger");
        setTimeout(function () {
            $("#startTime").removeClass("bg-danger")
        }, 750);
    }
    return isValid;
};
function notEmpty() {
    var checkName;
    var checkDest;
    var checkArrival;
    if ($("#trainName").val() != "") {
        $("#trainName").addClass("bg-success")
        setTimeout(function () { $("#trainName").removeClass("bg-success") }, 2000);
        checkName = true;
    } else {
        $("#trainName").addClass("bg-danger");
        setTimeout(function () {
            $("#trainName").removeClass("bg-danger")
        }, 750);
        checkName = false;
    }
    if ($("#destination").val() != "") {
        $("#destination").addClass("bg-success")
        setTimeout(function () { $("#destination").removeClass("bg-success") }, 2000);
        checkDest = true;
    } else {
        $("#destination").addClass("bg-danger");
        setTimeout(function () {
            $("#destination").removeClass("bg-danger")
        }, 750);
        checkDest = false;
    }
    if ($("#trainFreq").val() != "") {
        $("#trainFreq").addClass("bg-success")
        setTimeout(function () { $("#trainFreq").removeClass("bg-success") }, 2000);
        checkArrival = true;
    } else {
        $("#trainFreq").addClass("bg-danger");
        setTimeout(function () {
            $("#trainFreq").removeClass("bg-danger")
        }, 750);
        checkArrival = false;
    }
    if (checkName && checkDest && checkArrival) {
        return true;
    } else {
        return false;
    }
};

$(document).on("click", "#buttonSub", function () {

    if (checkTime() && notEmpty()) {
        trainName = $("#trainName").val().trim();
        trainDest = $("#destination").val().trim();
        firstTime = $("#startTime").val().trim();
        trainFreq = $("#trainFreq").val();

        dataRef.ref().push({
            trainName: trainName,
            trainDest: trainDest,
            firstTime: firstTime,
            trainFreq: trainFreq
        });
    }
});

$(document).on("click", "#buttonCan", function () {

    $("#trainName").val("");
    $("#destination").val("");
    $("#startTime").val("");
    $("#trainFreq").val("");

});

dataRef.ref().on("child_added", function (childSnapshot) {
    var displayName = childSnapshot.val().trainName;
    var displayDest = childSnapshot.val().trainDest;
    var firstArr = childSnapshot.val().firstTime;
    var frequent = childSnapshot.val().trainFreq;
    var convertedTime = moment(firstArr, "HH:mm").subtract(1, "years");
    console.log(convertedTime);
    var timeDiff = moment().diff(moment(convertedTime), "minutes");
    var remTime = timeDiff % frequent;
    var timeTill = frequent - remTime;
    var nextTime = moment().add(timeTill, "minutes");
    $("#appendHere").append("<tr class='bg-light text-dark'><td class='col s3'><p>" + displayName + "</p></td><td class='col s3'><p>" + displayDest + "</p></td><td class='col s3'><p>" + frequent + "</p></td><td class='col s3'><p>" + moment(nextTime).format("HH:mm") + "</p></td><td class='col s3'><p>" + timeTill + "</p></td></tr>");
});

$("#currentTime").html(moment().format("HH:mm"));

timeout = setInterval(function () {
    location.reload(true);
}, 60000);


document.onkeyup = function (e) {
    clearInterval(timeout);

    timeout = setInterval(function () {
        location.reload(true);
    }, 60000);
};
