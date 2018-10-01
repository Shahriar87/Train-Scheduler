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

// Validation Functions - - - - - - - - - - - - - - - - - - - - - - - - - - -
function checkTime(){
var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($("#startTime").val());
if (isValid) {
    $("#startTime").addClass("bg-success")
    setTimeout(function(){
    $("#startTime").removeClass("bg-success")
    }, 2000);
} else {
    $("#startTime").addClass("bg-danger");
    setTimeout(function(){
    $("#startTime").removeClass("bg-danger")
    }, 750);
}
return isValid;
};
function notEmpty(){
var checkName;
var checkDest;
var checkArrival;
if ($("#trainName").val() != "") {
    $("#trainName").addClass("bg-success")
    setTimeout(function(){$("#trainName").removeClass("bg-success")}, 2000);
    checkName = true;
} else {
    $("#trainName").addClass("bg-danger");
    setTimeout(function(){
    $("#trainName").removeClass("bg-danger")
    }, 750);
    checkName = false;
}
if ($("#destination").val() != "") {
    $("#destination").addClass("bg-success")
    setTimeout(function(){$("#destination").removeClass("bg-success")}, 2000);
    checkDest = true;
} else {
    $("#destination").addClass("bg-danger");
    setTimeout(function(){
    $("#destination").removeClass("bg-danger")
    }, 750);
    checkDest = false;
}
if ($("#trainFreq").val() != "") {
    $("#trainFreq").addClass("bg-success")
    setTimeout(function(){$("#trainFreq").removeClass("bg-success")}, 2000);
    checkArrival = true;
} else {
    $("#trainFreq").addClass("bg-danger");
    setTimeout(function(){
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
//#submitButton onclick
$(document).on("click", "#buttonSub", function() {
if(checkTime() && notEmpty()) {
    trainName = $("#trainName").val().trim();
    trainDest = $("#destiNation").val().trim();
    firstTime = $("#startTime").val().trim();
    trainFreq = $("#trainFreq").val();

dataRef.ref().push({
    trainName: trainName,
    trainDest: trainDest,
    firstTime: firstTime,
    trainFreq: trainFreq
});
}
$("#form").modal("close");
});
dataRef.ref().on("child_added", function(childSnapshot) {
    var displayName = childSnapshot.val().trainName;
    var displayDest = childSnapshot.val().trainDest;
    var firstArr = childSnapshot.val().firstTime;
    var frequent = childSnapshot.val().trainFreq;
    var convertedTime = moment(firstArr, "HH:mm").subtract(1, "years");
    var timeDiff = moment().diff(moment(convertedTime), "minutes");
    var remTime = timeDiff % frequent;
    var timeTill = frequent - remTime;
    var nextTime = moment().add(timeTill, "minutes");
    $("#appendHere").append("<div class='chip row center-align'><div class='new name col s3'>" + displayName + "</div><div class='new dest col s3'>" + displayDest + "</div><div class='new freq col s2'>" + frequent + "</div><div class='new next col s2'>" + moment(nextTime).format("HH:mm") + "</div><div class='new away col s2'>" + timeTill + "</div></div>");
});      
setInterval(function(){
location.reload(true);
$(".current").html(moment().format("HH:mm"));
}, 60000);