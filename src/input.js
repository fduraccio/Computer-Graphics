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
                if (firstPersonView) {
                    deltaCamAngle_1 += 1.0;
                } else {
                    deltaCamAngle_2 -= 1.0;
                }
                break;
            case KEY_CODE.RIGHT:
                if (firstPersonView) {
                    deltaCamAngle_1 -= 1.0;
                } else {
                    deltaCamAngle_2 += 1.0;
                }
                break;
            case KEY_CODE.UP:
                if (firstPersonView) {
                    deltaCamElevation_1 += 1.0;
                } else {
                    deltaCamElevation_2 -= 1.0;
                }
                break;
            case KEY_CODE.DOWN:
                if (firstPersonView) {
                    deltaCamElevation_1 -= 1.0;
                } else {
                    deltaCamElevation_2 += 1.0;
                }
                break;
            case KEY_CODE.R:
                angle = playerAngle % 360 - 180;
                elevation = 0.0;
                deltaCamAngle_1 = 0.0;
                deltaCamElevation_1 = 0.0;
                deltaCamAngle_2 = 0.0;
                deltaCamElevation_2 = 0.0;
                lookRadius = 1.0;
                deltaLookRadius = 0.0;
                break;
            case KEY_CODE.F:
                toggleFullScreen();
                break;
            case 84:
                if (easterEggPresses < 5) {
                    easterEggPresses += 1;
                } else {
                    alert("Tropp fort");
                    easterEggPresses = 0;
                }
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
                deltaCamAngle_1 = 0.0;
                deltaCamAngle_2 = 0.0;
                break;
            case KEY_CODE.UP:
            case KEY_CODE.DOWN:
                deltaCamElevation_1 = 0.0;
                deltaCamElevation_2 = 0.0;
                break;
            case KEY_CODE.X:
            case KEY_CODE.Z:
                deltaLookRadius = 0.0;
                break;
            case KEY_CODE.SHIFT:
                simpleMotion = true;
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


function changeState() {
	init();
    mainPanel = document.getElementById("main-panel");
    mainPanel.style.display = "none";
    helpPanel = document.getElementById("help-panel");
    helpPanel.style.display = "block";
}

function changeSettings() {
	classificaPanel= document.getElementById("classifica-panel");
	classificaPanel.style.display = "block";
	console.log(allText[0])
	document.getElementById("firstPlayer").innerHTML = allText[0]+ "    " + allText[1];
	document.getElementById("secondPlayer").innerHTML = allText[2]+ "    " + allText[3];
	document.getElementById("thirdPlayer").innerHTML = allText[4]+ "    " + allText[5];
	document.getElementById("fourthPlayer").innerHTML = allText[6]+ "    " + allText[7];
	document.getElementById("fifthPlayer").innerHTML = allText[8]+ "    " + allText[9];
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