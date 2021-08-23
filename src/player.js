
// car steering dynamics
function ackermann(v, steering_angle) {
	
	var old_theta = playerAngle / 180 * Math.PI;

	steering_angle *= Math.PI / 180;
	
	if(steering_angle != 0) {
		var r = distance / Math.tan(steering_angle);
		var d_theta = (v * Math.sin(steering_angle)) / distance;
		var _d_x = r * Math.sin(d_theta);
		var _d_y = r * (1 - Math.cos(d_theta));
		var d_x = _d_x*Math.cos(old_theta) - _d_y*Math.sin(old_theta);
		var d_y = _d_x*Math.sin(old_theta) + _d_y*Math.cos(old_theta);
	}
	else {
		var d_x = v * Math.cos(old_theta);
		var d_y = v * Math.sin(old_theta);
		var d_theta = 0.0;
	}
	
	playerAngle = (playerAngle + d_theta / Math.PI * 180 + 180) % 360 - 180;
	if(playerAngle <= -180) playerAngle += 360;
	
	var new_theta = playerAngle / 180 * Math.PI;
	
	playerX += odom_offset*(Math.sin(new_theta)-Math.sin(old_theta)) + d_y;
	playerZ += odom_offset*(Math.cos(new_theta)-Math.cos(old_theta)) + d_x;
}

//compute matrices
function computeWPV() {
    var W, V, P;

    // compute time interval
	//var currentTime = (new Date).getTime();
	var deltaT;
	if(lastUpdateTime){
		deltaT = (currentTime - lastUpdateTime) / 1000.0;
	} else {
		deltaT = 1/50;
	}
	//lastUpdateTime = currentTime;
	
    // computing player velocity
    if (false) {
        playerLinVel = 0.7 * vz;
    }
    else {
        if (vz > 0.1) {
            if (preVz > 0.1) {
                playerLinAcc = playerLinAcc + ATur * deltaT;
                if (playerLinAcc > mAT) playerLinAcc = mAT;
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
        }
        else {
            playerLinVel = 0.0;
            playerLinAcc = 0.0;
        }
    }

    // Magic for moving the player
	var steeringAngle = steeringDir * maxSteering;
	
	prevCarAngle = playerAngle;
	
	deltaCarAngle = -playerAngle;
	
	odom_offset = (playerLength[playerIndex] / 2) * 0.8;
	
	ackermann(playerLinVel, steeringAngle);
	
	
	

    P = utils.MakePerspective(fov, aspectRatio, 0.1, 1000.0);
	
	W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);
	
	deltaCarAngle += playerAngle;
	
	angle = (angle + deltaCarAngle + deltaCamAngle_1 + deltaCamAngle_2 + 180) % 360 - 180;
	if(angle <= -180) angle += 360;
	elevation += deltaCamElevation_1 + deltaCamElevation_2;
	camRoll = 0.0;
	
	var nLookRadius = lookRadius + deltaLookRadius;
	if((nLookRadius >= 0.8) && (nLookRadius <= 1.5) && !firstPersonView) {
		lookRadius = nLookRadius;
	}
	
    var driverPos;

    // define camera (target) position
	if(firstPersonView) {
		var minElev = -60.0;
		var maxElev = 60.0;
		
		elevation = Math.min(Math.max(elevation, minElev), maxElev);
	}
	else {
		var minElev = -90.0;
		var maxElev = 0.0;
		
		if(elevation <= -90.0) deltaCamElevation_2 += minElev - elevation;
		if(elevation >= 0.0) deltaCamElevation_2 += maxElev - elevation;
		
		elevation = Math.min(Math.max(elevation, minElev), maxElev);
		
		var quat = new Quaternion.fromAxisAngle([Math.cos(utils.degToRad(angle - playerAngle + 180)), 0.0, -Math.sin(utils.degToRad(angle - playerAngle + 180))], -utils.degToRad(deltaCamElevation_2));
		var driverRotMat = utils.multiplyMatrices(quat.toMatrix4(), utils.MakeRotateYMatrix(deltaCamAngle_2));
		var newDriverPos = utils.multiplyMatrixVector(driverRotMat, [driverPosX, driverPosY-lookAtPosY, driverPosZ, 1.0]);
		driverPosX = newDriverPos[0];
		driverPosY = newDriverPos[1] + lookAtPosY;
		driverPosZ = newDriverPos[2];
	}
	var nC = utils.multiplyMatrixVector(W, [lookRadius*driverPosX, lookRadius*(driverPosY-lookAtPosY)+lookAtPosY, lookRadius*driverPosZ, 1.0]);
	
	// camera position
	if(simpleCam) {
		cx = nC[0];
		cy = nC[1];
		cz = nC[2];
	}
	else {
		// distance from target	
		deltaCam = [cx - nC[0], cy - nC[1], cz - nC[2]];
		camAcc = [-fSk * deltaCam[0] - fDk * camVel[0], -fSk * deltaCam[1] - fDk * camVel[1], -fSk * deltaCam[2] - fDk * camVel[2]];
		camVel = [camVel[0] + camAcc[0] * deltaT, camVel[1] + camAcc[1] * deltaT, camVel[2] + camAcc[2] * deltaT];
		
		cx += camVel[0] * deltaT;
		cy += camVel[1] * deltaT;
		cz += camVel[2] * deltaT;
	}
	
	if(firstPersonView) {
		V = utils.MakeView(cx, cy, cz, elevation, angle);
	}
	else {
		var camRotMat = utils.multiplyMatrices(utils.MakeRotateYMatrix(angle - playerAngle + 180), utils.MakeRotateXMatrix(elevation));
		V = utils.multiplyMatrices(utils.invertMatrix(camRotMat), utils.MakeView(cx, cy, cz, 0.0, playerAngle + 180));
	}
	
	return [W, V, P];


}

// function computeMatrices() {
//     let prevCx = cx;
//     let prevCz = cz;

//     let viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

//     let viewMatrixTransposed = utils.transposeMatrix(viewMatrix);

//     viewMatrixTransposed[12] = viewMatrixTransposed[13] = viewMatrixTransposed[14] = 0.0;
//     let xaxis = [viewMatrixTransposed[0], viewMatrixTransposed[4], viewMatrixTransposed[8]];
//     let yaxis = [viewMatrixTransposed[1], viewMatrixTransposed[5], viewMatrixTransposed[9]];
//     let zaxis = [viewMatrixTransposed[2], viewMatrixTransposed[6], viewMatrixTransposed[10]];

//     if (rvx || rvy) {
//         let qx = Quaternion.fromAxisAngle(xaxis, utils.degToRad(rvx));
//         let qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(rvy));
//         let qz = Quaternion.fromAxisAngle(zaxis, utils.degToRad(rvz));
//         let viewMatFromQuat = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(qy.toMatrix4(), qx.toMatrix4()), qz.toMatrix4()), viewMatrixTransposed);
//         let R11 = viewMatFromQuat[10];
//         let R12 = viewMatFromQuat[8];
//         let R13 = viewMatFromQuat[9];
//         let R21 = viewMatFromQuat[2];
//         let R31 = viewMatFromQuat[6];

//         if ((R31 < 1) && (R31 > -1)) {
//             theta = -Math.asin(R31);
//             psi = Math.atan2(R21 / Math.cos(theta), R11 / Math.cos(theta));
//         } else if (R31 <= -1) {
//             theta = Math.PI / 2;
//             psi = Math.atan2(R12, R13);
//         } else {
//             theta = -Math.PI / 2;
//             psi = Math.atan2(-R12, -R13);
//         }

//         theta = (theta >= MAX_ELEVATION_ANGLE) ? MAX_ELEVATION_ANGLE : (theta <= MIN_ELEVATION_ANGLE ? MIN_ELEVATION_ANGLE : theta);

//         elevation = utils.radToDeg(theta);
//         angle = -utils.radToDeg(psi);
//     }


//     let delta = utils.multiplyMatrixVector(viewMatrixTransposed, [vx, vy, vz, 0.0]);
//     cx += delta[0] / 10;
//     cz += delta[2] / 10;

//     //Move is invalid
//     if (prevVz !== vz && !is_valid_move([cx, cy, cz])) {
//         cx = prevCx;
//         cz = prevCz;
//     }

//     let camCoods = [cx, cy, cz];
// }