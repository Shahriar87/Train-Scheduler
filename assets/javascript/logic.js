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

$(".content").hide();

// Authentication Initialization
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.addScope('profile');
provider.addScope('email');

setInterval(function () {
    $("#currentTime").html("<h4>" + moment().format("HH:mm:ss") + "<h4>");
    // location.reload(true);
}, 1000);

//Google Sign in
$(document).on("click", "#signIn", function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        $(".content").show();

        loggedIn();

        $("#signIn").removeAttr("id")
            .attr("id", "signOut")
            .html("Sign Out");

    });
});

//Google Sign out
$(document).on("click", "#signOut", function () {
    firebase.auth().signOut().then(function () {
        $('.content').hide();
    }, function (error) {
        // An error happened.
    });
    $("#signOut").removeAttr("id")
        .attr("id", "signIn")
        .html("Sign In With Google");
    location.reload(true);
});


// Time input format check
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

// Checking input values to be not empty
function notEmpty() {
    var checkName;
    var checkDest;
    var checkArrival;
    if ($("#trainName").val() != "") {
        $("#trainName").addClass("bg-success")
        setTimeout(function () {
            $("#trainName").removeClass("bg-success")
        }, 2000);
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
        setTimeout(function () {
            $("#destination").removeClass("bg-success")
        }, 2000);
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
        setTimeout(function () {
            $("#trainFreq").removeClass("bg-success")
        }, 2000);
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

function loggedIn() {

    var dataRef = firebase.database();
    var trainName = "";
    var trainDest = "";
    var firstTime = "";
    var trainFreq = 0;
    var editKey = "";
    var currentTime = moment();

    // Debugging double appending for sign out and sign in
    $(".tr").remove();


    // Submitting Data to Firebase
    $(document).on("click", "#buttonSub", function () {

        if (checkTime() && notEmpty()) {
            trainName = $("#trainName").val().trim();
            trainDest = $("#destination").val().trim();
            firstTime = $("#startTime").val().trim();
            trainFreq = $("#trainFreq").val();

            if (editKey == "") {
                dataRef.ref().push({
                    trainName: trainName,
                    trainDest: trainDest,
                    firstTime: firstTime,
                    trainFreq: trainFreq
                });
            } else if (editKey != "") {
                dataRef.ref(editKey).update({
                    trainName: trainName,
                    trainDest: trainDest,
                    firstTime: firstTime,
                    trainFreq: trainFreq
                });
            }

            $("#trainName").val("");
            $("#destination").val("");
            $("#startTime").val("");
            $("#trainFreq").val("");
        }
    });

    // Clearing input values on Cancel
    $(document).on("click", "#buttonCan", function () {
        $("#trainName").val("");
        $("#destination").val("");
        $("#startTime").val("");
        $("#trainFreq").val("");
    });

    // Appending Newly Entered Train information in the Display
    dataRef.ref().on("child_added", function (childSnapshot) {
        var displayName = childSnapshot.val().trainName;
        var displayDest = childSnapshot.val().trainDest;
        var firstArr = childSnapshot.val().firstTime;
        var frequent = childSnapshot.val().trainFreq;
        var convertedTime = moment(firstArr, "HH:mm").subtract(1, "years");
        var trainId = childSnapshot.key;
        // console.log(convertedTime);
        // console.log(childSnapshot.key);
        var timeDiff = moment().diff(moment(convertedTime), "minutes");
        var remTime = timeDiff % frequent;
        var timeTill = frequent - remTime;
        var nextTime = moment().add(timeTill, "minutes");
        $("#appendHere").append("<tr id='" + trainId + "' class='bg-light text-dark tr'><td class='col s2'><p>" + displayName + "</p></td><td class='col s2'><p>"
            + displayDest + "</p></td><td class='col s2'><p>" + frequent + "</p></td><td class='col s2'><p>" + moment(nextTime).format("HH:mm")
            + "</p></td><td class='col s2'><p>" + timeTill + "</p></td><td class='col s1'><button class='delete btn' data-train=" + trainId
            + "><i class='material-icons' style='font-size:30px; color: red'>delete_forever</i></button></td><td class='col s1'><button class='edit btn' data-train="
            + trainId + "><i class='material-icons' style='font-size:30px; color: blue'>edit</i></button></td></tr>");
    });

    // Update Train Schedule every minutes instead of page reloading, which used to log the user out on every page refresh
    setInterval(function () {
        $(".tr").remove();

        dataRef.ref().on("child_added", function (childSnapshot) {
            var displayName = childSnapshot.val().trainName;
            var displayDest = childSnapshot.val().trainDest;
            var firstArr = childSnapshot.val().firstTime;
            var frequent = childSnapshot.val().trainFreq;
            var convertedTime = moment(firstArr, "HH:mm").subtract(1, "years");
            var trainId = childSnapshot.key;
            var timeDiff = moment().diff(moment(convertedTime), "minutes");
            var remTime = timeDiff % frequent;
            var timeTill = frequent - remTime;
            var nextTime = moment().add(timeTill, "minutes");
            $("#appendHere").append("<tr id='" + trainId + "' class='bg-light text-dark tr'><td class='col s2'><p>" + displayName + "</p></td><td class='col s2'><p>"
                + displayDest + "</p></td><td class='col s2'><p>" + frequent + "</p></td><td class='col s2'><p>" + moment(nextTime).format("HH:mm")
                + "</p></td><td class='col s2'><p>" + timeTill + "</p></td><td class='col s1'><button class='delete btn' data-train=" + trainId
                + "><i class='material-icons' style='font-size:30px; color: red'>delete_forever</i></button></td><td class='col s1'><button class='edit btn' data-train="
                + trainId + "><i class='material-icons' style='font-size:30px; color: blue'>edit</i></button></td></tr>");
        });
    }, 60000);

    // Update updated Train information in the Display
    dataRef.ref().on('child_changed', function (childSnapshot) {
        var displayName = childSnapshot.val().trainName;
        var displayDest = childSnapshot.val().trainDest;
        var firstArr = childSnapshot.val().firstTime;
        var frequent = childSnapshot.val().trainFreq;
        var convertedTime = moment(firstArr, "HH:mm").subtract(1, "years");
        var trainId = childSnapshot.key;
        var timeDiff = moment().diff(moment(convertedTime), "minutes");
        var remTime = timeDiff % frequent;
        var timeTill = frequent - remTime;
        var nextTime = moment().add(timeTill, "minutes");
        $("#" + trainId).empty();
        $("#" + trainId).html("<td class='col s2'><p>" + displayName + "</p></td><td class='col s2'><p>"
            + displayDest + "</p></td><td class='col s2'><p>" + frequent + "</p></td><td class='col s2'><p>" + moment(nextTime).format("HH:mm")
            + "</p></td><td class='col s2'><p>" + timeTill + "</p></td><td class='col s1'><button class='delete btn' data-train=" + trainId
            + "><i class='material-icons' style='font-size:30px; color: red'>delete_forever</i></button></td><td class='col s1'><button class='edit btn' data-train="
            + trainId + "><i class='material-icons' style='font-size:30px; color: blue'>edit</i></button></td>");
    });

    // Delete an entire row
    $(document).on('click', '.delete', function () {
        var trainKey = $(this).attr('data-train');
        dataRef.ref(trainKey).remove();
        $("#" + trainKey).remove();
        // location.reload(true);
    });

    // Edit a row
    $(document).on('click', '.edit', function () {
        editKey = $(this).attr('data-train');
        dataRef.ref(editKey).once('value').then(function (childSnapshot) {
            $("#trainName").val(childSnapshot.val().trainName);
            $("#destination").val(childSnapshot.val().trainDest);
            $("#startTime").val(childSnapshot.val().firstTime);
            $("#trainFreq").val(childSnapshot.val().trainFreq);
        });
    });

    // Showing current time
    $("#currentTime").html("<h4>" + moment().format("HH:mm:ss") + "<h4>");

    // Reload time each second
    setInterval(function () {
        $("#currentTime").html("<h4>" + moment().format("HH:mm:ss") + "<h4>");
        // location.reload(true);
    }, 1000);

};


// Code for entire page reload. Not using anymore. 



    // Prevent page reloading when Data is being entered and starting another interval
    // document.onkeyup = function (e) {
    //     clearInterval(timeout);

    //     timeout = setInterval(function () {
    //         location.reload(true);
    //     }, 60000);
    // };
