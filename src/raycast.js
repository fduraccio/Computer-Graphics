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

    //We need to go through the transformation pipeline in the inverse order so we invert the matrices
    var projInv = utils.invertMatrix(perspectiveMatrix);
    var viewInv = utils.invertMatrix(viewMatrix);

    //Find the point (un)projected on the near plane, from clip space coords to eye coords
    //z = -1 makes it so the point is on the near plane
    //w = 1 is for the homogeneous coordinates in clip space
    var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);

    //This finds the direction of the ray in eye space
    //Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0] 
    //w = 0 is because this is not a point anymore but is considered as a direction
    var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];


    //We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
    var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
    var normalisedRayDir = normaliseVector(rayDir);
    //The ray starts from the camera in world coordinates
    var rayStartPoint = [cx, cy, cz];


    var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, birdPosition[0], birdPosition[1]);
    alert(hit)
    if (hit) {
        winners(ev);
    }

}

function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius) {
    //Distance between sphere origin and origin of ray
    var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
    var l_squared = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];
    //If this is true, the ray origin is inside the sphere so it collides with the sphere
    if (l_squared < (sphereRadius * sphereRadius)) {
        return true;
    }
    //Projection of l onto the ray direction 
    var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];
    //The spere is behind the ray origin so no intersection
    if (s < 0) {
        return false;
    }
    //Squared distance from sphere centre and projection s with Pythagorean theorem
    var m_squared = l_squared - (s * s);
    //If this is true the ray will miss the sphere
    if (m_squared > (sphereRadius * sphereRadius)) {
        return false;
    }
    //Now we can say that the ray will hit the sphere 
    return true;

}

function winners(ev) {
    // alert("entro");
    timeOfWinner = (new Date).getTime();
    timeOfWinner = Math.round((timeOfWinner - startGame)/1000);
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
            ranking=ranking.concat(allText.slice(x-1,8))
            break;
        } 
        ranking.push(allText[x - 1]);
        ranking.push(allText[x]);
    }
    allText = ranking;
    let writeResult = '';
    for (x = 0; x < ranking.length; x++) {
        writeResult += x+1!=ranking.length ? ranking[x] + "-" : ranking[x];
    }

    //fare la scrittura sul file ed è fatta
    console.log(writeResult)
    //WriteToFile(writeResult)

}