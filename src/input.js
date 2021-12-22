var keyFunctionDown = function(e) {
    if (!keys[e.keyCode]) {
        keys[e.keyCode] = true;
        switch (e.keyCode) {
            case KEY_CODE.A:
                if (enableMovement) steeringDir = 1;
                break;
            case KEY_CODE.D:
                if (enableMovement) steeringDir = -1;
                break;
            case KEY_CODE.W:
                if (enableMovement) vz = vz + 1.0;
                break;
            case KEY_CODE.S:
                if (enableMovement) vz = vz - 1.0;
                break;
            case KEY_CODE.LEFT:
                deltaCamAngle += 1.0;
                break;
            case KEY_CODE.L:
                enableSpotLight = !enableSpotLight;
                break;
            case KEY_CODE.RIGHT:
                deltaCamAngle -= 1.0;
                break;
            case KEY_CODE.UP:
                deltaCamElevation += 1.0;
                break;
            case KEY_CODE.DOWN:
                deltaCamElevation -= 1.0;
                break;
            case KEY_CODE.R:
                angle = playerAngle % 360 - 180;
                elevation = 0.0;
                deltaCamAngle = 0.0;
                deltaCamElevation = 0.0;
                lookRadius = 1.0;
                deltaLookRadius = 0.0;
                break;
            case KEY_CODE.HELPPANEL:
                helpPanel = document.getElementById("help-panel");
                helpPanel.style.display = "block";
                break;
            case KEY_CODE.SHIFT:
                simpleMotion = false;
                break;
        }
    }
}

var keyFunctionUp = function(e) {
    if (keys[e.keyCode]) {
        keys[e.keyCode] = false;
        switch (e.keyCode) {
            case KEY_CODE.L:
            case KEY_CODE.A:
            case KEY_CODE.D:
                steeringDir = 0;
                break;
            case KEY_CODE.W:
            case KEY_CODE.S:
                vz = 0.0;
                break;
            case KEY_CODE.LEFT:
            case KEY_CODE.RIGHT:
                deltaCamAngle = 0.0;
                break;
            case KEY_CODE.UP:
            case KEY_CODE.DOWN:
                deltaCamElevation = 0.0;
                break;
            case KEY_CODE.X:
            case KEY_CODE.Z:
                deltaLookRadius = 0.0;
                break;
            case KEY_CODE.SHIFT:
                simpleMotion = true;
                break;
            case KEY_CODE.HELPPANEL:
                helpPanel = document.getElementById("help-panel");
                helpPanel.style.display = "none";
                break;
        }
    }
}

var keyPanelFunction = function(e) {
    //if (checkKey(e.keyCode)) {
    switch (e.keyCode) {
        case KEY_CODE.INVIO:
            helpPanel = document.getElementById("help-panel");
            helpPanel.style.display = "none";
            winnerPanel = document.getElementById("winner-panel");
            winnerPanel.style.display = "none";
            e.preventDefault();
            break;
        case KEY_CODE.HELPPANEL:
            helpPanel = document.getElementById("help-panel");
            helpPanel.style.display = "block";
            e.preventDefault();
            break;
    }
    //}
}


function startGame() {
    namePlayer = document.getElementById("namePlayer").value;
    if (namePlayer[0] == ' ' || namePlayer == '') {
        alert("Inserire nome senza lasciare spazi all'inizio")
    } else {
        //cambia qui per aumentare e diminuire il timer
        time_minutes = 0; // Value in minutes
        time_seconds = 5; // Value in seconds

        duration = time_minutes * 60 + time_seconds;
        var element = document.querySelector('#count-down-timer');
        element.textContent = `${paddedFormat(time_minutes)}:${paddedFormat(time_seconds)}`;
        startCountDown(--duration, element);
        namePlayerPanel = document.getElementById("namePlayer-panel");
        namePlayerPanel.style.display = "none";
        cvContainer = document.getElementById("cv-container");
        cvContainer.style.display = "none";
        helpPanel = document.getElementById("help-panel");
        helpPanel.style.display = "block";
        timerPanel = document.getElementById("timer-panel");
        timerPanel.style.display = "block";
        audioButton = document.getElementById("audio-button");
        audioButton.style.display = "block";
        init();

    }
}

function paddedFormat(num) {
    return num < 10 ? "0" + num : num;
}

function startCountDown(duration, element) {
    let secondsRemaining = duration;
    let min = 0;
    let sec = 0;

    let countInterval = setInterval(function() {

        min = parseInt(secondsRemaining / 60);
        sec = parseInt(secondsRemaining % 60);

        element.textContent = `${paddedFormat(min)}:${paddedFormat(sec)}`;

        secondsRemaining = secondsRemaining - 1;
        if (secondsRemaining == 0) {
            timerPanel = document.getElementById("timer-panel");
            timerPanel.style.display = "none";
            looser_sound = document.getElementById('looser_sound');
            looser_sound.play();
            looserPanel = document.getElementById("looser-panel");
            looserPanel.style.display = "block";
            enableMovement = false;

        }
        if (secondsRemaining < 0) { clearInterval(countInterval) };

    }, 1000);
}

function changeState() {
    mainPanel = document.getElementById("main-panel");
    mainPanel.style.display = "none";
    namePlayerPanel = document.getElementById("input-name-panel");
    namePlayerPanel.style.display = "block";

    if (environment === 'woodland') {
        initialPage()
        return;
    }
    if (environment === 'winterland') {
        initialPageWinter()
        return;
    }
    if (environment === 'desert') {
        initialPageDesert()
        return;
    }
}

function reload() {
    window.location.reload();
	audio = document.getElementById('theme_music');
	audio.pause();
}

function changeSettings() {
    optionPanel = document.getElementById("change-settings-panel");
    optionPanel.style.display = "block";

}

function changeLevel(level) {
    if (level === 'easy') {
        document.getElementById("easy").classList.add("selected")
        document.getElementById("medium").classList.remove("selected")
        document.getElementById("hard").classList.remove("selected")
        difficulty = 1;
        return;
    }
    if (level === 'medium') {
        document.getElementById("medium").classList.add("selected")
        document.getElementById("easy").classList.remove("selected")
        document.getElementById("hard").classList.remove("selected")
        difficulty = 2;
        return;
    }
    if (level === 'hard') {
        document.getElementById("hard").classList.add("selected")
        document.getElementById("medium").classList.remove("selected")
        document.getElementById("easy").classList.remove("selected")
        difficulty = 3;
        return;
    }

}

function changeEnvironment(env) {
    if (env === 'woodland') {
        environment = "woodland";
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("winter", "main");
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("desert", "main");
        document.getElementById("wood").classList.add("selected")
        document.getElementById("winter").classList.remove("selected")
        document.getElementById("desert").classList.remove("selected")

        audio = document.getElementById("theme_music")
        audio.src = "audio/theme_music.mp3"
        startMusic(audio)

        return;
    }
    if (env === 'winterland') {
        environment = "winterland";
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("main", "winter");
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("desert", "winter");
        document.getElementById("winter").classList.add("selected")
        document.getElementById("desert").classList.remove("selected")
        document.getElementById("wood").classList.remove("selected");

        audio = document.getElementById("theme_music")
        audio.src = "audio/theme_music_winterland.mp3"
        startMusic(audio)

        return;
    }
    if (env === 'desertland') {
        environment = "desert";
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("main", "desert");
        document.getElementById("main-panel").className =
            document.getElementById("main-panel").className.replace("winter", "desert");
        document.getElementById("desert").classList.add("selected")
        document.getElementById("winter").classList.remove("selected")
        document.getElementById("wood").classList.remove("selected")

        audio = document.getElementById("theme_music")
        audio.src = "audio/theme_music_desert.mp3"
        startMusic(audio)

        return;
    }

}

function goBack() {
    classificaPanel = document.getElementById("classifica-panel");
    classificaPanel.style.display = "none";
    optionPanel = document.getElementById("change-settings-panel");
    optionPanel.style.display = "none";
}

function showLeaderboard() {
    classificaPanel = document.getElementById("classifica-panel");
    classificaPanel.style.display = "block";
    // console.log(allText[0])
    document.getElementById("firstPlayer").innerHTML = allText[0];
    document.getElementById("scoreFirst").innerHTML = allText[1];
    document.getElementById("secondPlayer").innerHTML = allText[2]
    document.getElementById("scoreSecond").innerHTML = allText[3];
    document.getElementById("thirdPlayer").innerHTML = allText[4]
    document.getElementById("scoreThird").innerHTML = allText[5];
    document.getElementById("fourthPlayer").innerHTML = allText[6]
    document.getElementById("scoreFourth").innerHTML = allText[7];
    document.getElementById("fifthPlayer").innerHTML = allText[8];
    document.getElementById("scoreFifth").innerHTML = allText[9];

}

function checkKey(keyCode) {
    for (i = 0; i < keys.length; i++) {
        if (keyCode == keys[i]) {
            return true;
        }
    }
    return false;
}

var mouseState = false;
var lastMouseX = -100,
    lastMouseY = -100;

function doMouseDown(event) {
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    mouseState = true;
}

function doMouseUp(event) {
    lastMouseX = -100;
    lastMouseY = -100;
    mouseState = false;
    myOnMouseUp(event);
}

function doMouseMove(event) {
    if (mouseState) {
        var dx = event.pageX - lastMouseX;
        var dy = lastMouseY - event.pageY;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;

        if ((dx != 0) || (dy != 0)) {
            angle = angle + 0.5 * dx;
            elevation = elevation + 0.5 * dy;
        }
    }
}

function doMouseWheel(event) {
    var nLookRadius = lookRadius + event.wheelDelta / 200.0;
    if ((nLookRadius > 2.0) && (nLookRadius < 100.0)) {
        lookRadius = nLookRadius;
    }
}

function toggleFullScreen() {
    var canvas = document.getElementById("canvas");
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function startMusic(audio) {
    audio = document.getElementById('theme_music');
    if (audio.paused) {
        document.getElementById("audio_disabled").style.display = "none";
        document.getElementById("audio").style.display = "block";
        document.getElementById("audio_disabled_2").style.display = "none";
        document.getElementById("audio_2").style.display = "block";
        audio.play();
    } else {
        document.getElementById("audio").style.display = "none";
        document.getElementById("audio_disabled").style.display = "block";
        document.getElementById("audio_2").style.display = "none";
        document.getElementById("audio_disabled_2").style.display = "block";
        audio.currentTime = 0
        audio.pause();

    }

}

function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
}