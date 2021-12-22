// player steering dynamics
function ackermann(v, steering_angle) {

    var old_theta = playerAngle / 180 * Math.PI;

    steering_angle *= Math.PI / 180;

    if (steering_angle != 0) {
        var r = distance / Math.tan(steering_angle);
        var d_theta = (v * Math.sin(steering_angle)) / distance;
        var _d_x = r * Math.sin(d_theta);
        var _d_y = r * (1 - Math.cos(d_theta));
        var d_x = _d_x * Math.cos(old_theta) - _d_y * Math.sin(old_theta);
        var d_y = _d_x * Math.sin(old_theta) + _d_y * Math.cos(old_theta);
    } else {
        var d_x = v * Math.cos(old_theta);
        var d_y = v * Math.sin(old_theta);
        var d_theta = 0.0;
    }

    playerAngle = (playerAngle + d_theta / Math.PI * 180 + 180) % 360 - 180;
    if (playerAngle <= -180) playerAngle += 360;

    var new_theta = playerAngle / 180 * Math.PI;

    playerX += odom_offset * (Math.sin(new_theta) - Math.sin(old_theta)) + d_y;
    playerZ += odom_offset * (Math.cos(new_theta) - Math.cos(old_theta)) + d_x;
}

/**
 * Computes matrices to make the moving logic of the player
 * @param {*} vz 
 * @param {*} steeringDir 
 */
function computeWPV(vz, steeringDir) {

    // compute time interval
    var deltaT;
    if (lastUpdateTime) {
        deltaT = (currentTime - lastUpdateTime) / 1000.0;
    } else {
        deltaT = 1 / 50;
    }

    // computing player velocity
    if (simpleMotion) {
        playerLinVel = 0.7 * vz;
    } else {
        if (vz > 0.1) {
            if (preVz > 0.1) {
                playerLinAcc = playerLinAcc + ATur * deltaT;
                if (playerLinAcc > mAT) playerLinAcc = mAT * 2;
            } else if (playerLinAcc < sAT) playerLinAcc = sAT;
        } else if (vz > -0.1) {
            playerLinAcc = playerLinAcc - ATdr * deltaT * Math.sign(playerLinAcc);
            if (Math.abs(playerLinAcc) < 0.001) playerLinAcc = 0.0;
        } else {
            if (preVz < 0.1) {
                playerLinAcc = playerLinAcc - BTur * deltaT;
                if (playerLinAcc < -mBT) playerLinAcc = -mBT;
            } else if (playerLinAcc > -sBT) playerLinAcc = -sBT;
        }
        preVz = vz;

        if ((Math.abs(playerLinVel) > 1e-3) || (vz != 0.0)) {
            playerLinVel = playerLinVel * Math.exp(Tfric * deltaT) + deltaT * playerLinAcc;
        } else {
            playerLinVel = 0.0;
            playerLinAcc = 0.0;

        }

    }
    var collisionDetected = checkCollisionEnv([cameraX, cameraY, cameraZ, 1]);
    if (collisionDetected) {
        playerLinVel = -5.0;
    }

    // magic for moving the player
    var steeringAngle = steeringDir * maxSteering;
    prevPlayerAngle = playerAngle;
    deltaPlayerAngle = -playerAngle;

    ackermann(playerLinVel, steeringAngle);

    playerY = playerY + deltaY
    P = utils.MakePerspective(fov, aspectRatio, 0.1, 1000.0);

    W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);

    deltaPlayerAngle += playerAngle;

    angle = (angle + deltaPlayerAngle + deltaCamAngle + 180) % 360 - 180;
    if (angle <= -180) angle += 360;
    elevation += deltaCamElevation;
    camRoll = 0.0;


    var minElev = -60.0;
    var maxElev = 60.0;

    elevation = Math.min(Math.max(elevation, minElev), maxElev);


    var nC = utils.multiplyMatrixVector(W, [viewPosX, viewPosY, viewPosZ, 1.0]);

    // camera position
    cameraX = nC[0];
    cameraY = nC[1];
    cameraZ = nC[2];

    if (!collisionDetected) {
        V = utils.MakeView(cameraX, cameraY, cameraZ, elevation, angle);
    }

    return [W, V, P];
}