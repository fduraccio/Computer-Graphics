function normaliseVector(vec) {
    var magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    var normVec = [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
    return normVec;
}


function myOnMouseUp(ev) {
    //These commented lines of code only work if the canvas is full screen
    var normX = (2 * ev.clientX) / gl.canvas.width - 1;
    var normY = 1 - (2 * ev.clientY) / gl.canvas.height;

    //This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
    /*var top = 0.0, left = 0.0;
    canvas = gl.canvas;
    while (canvas && canvas.tagName !== 'BODY') {
        top += canvas.offsetTop;
        left += canvas.offsetLeft;
        canvas = canvas.offsetParent;
    }
    var x = ev.clientX - left;
    var y = ev.clientY - top;
        
    //Here we calculate the normalised device coordinates from the pixel coordinates of the canvas
    var normX = (2*x)/ gl.canvas.width - 1;
    var normY = 1 - (2*y) / gl.canvas.height;*/

    var projInv = utils.invertMatrix(perspectiveMatrix);
    var viewInv = utils.invertMatrix(viewMatrix);
    var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);

    var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];

    var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
    var normalisedRayDir = normaliseVector(rayDir);
    var rayStartPoint = [cx, cy, cz];


    var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, birdPosition[0], birdPosition[1]);
    //alert(hit)
    if (hit) {
        winners(ev);
    }

}

function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius) {

    var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
    var l_squared = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];

    if (l_squared < (sphereRadius * sphereRadius)) {
        return true;
    }

    var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];

    if (s < 0) {
        return false;
    }

    var m_squared = l_squared - (s * s);

    if (m_squared > (sphereRadius * sphereRadius)) {
        return false;
    }

    return true;

}

function winners(ev) {
    // alert("entro");
    timeOfWinner = (new Date).getTime();
    timeOfWinner = Math.round((timeOfWinner - startGame) / 1000);
    enableMovement = false;
    winnerPanel = document.getElementById("winner-panel");
    winnerPanel.style.display = "block";
    document.getElementById("winner-time").innerHTML = timeOfWinner
    updateRanking(timeOfWinner);
}

function updateRanking(time) {
    let ranking = [];
    for (x = 1; x < 10; x += 2) {
        if (allText[x] >= time) {
            ranking.push(namePlayer);
            ranking.push(time)
            ranking = ranking.concat(allText.slice(x - 1, 8))
            break;
        }
        ranking.push(allText[x - 1]);
        ranking.push(allText[x]);
    }
    allText = ranking;
    let writeResult = '';
    for (x = 0; x < ranking.length; x++) {
        writeResult += x + 1 != ranking.length ? ranking[x] + "-" : ranking[x];
    }

    //fare la scrittura sul file ed è fatta
    // console.log(writeResult)
    //WriteToFile(writeResult)

}