
// car steering dynamics
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
	}
	else {
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

//compute matrices
function computeWPV(vz, steeringDir) {
	var W, V, P;

	// compute time interval
	var deltaT;
	if (lastUpdateTime) {
		deltaT = (currentTime - lastUpdateTime) / 1000.0;
	} else {
		deltaT = 1 / 50;
	}
	//lastUpdateTime = currentTime;

	// computing player velocity
	playerLinVel = 0.7 * vz;

	// Magic for moving the player
	var steeringAngle = steeringDir * maxSteering;

	prevPlayerAngle = playerAngle;

	deltaPlayerAngle = -playerAngle;

	odom_offset = (2 / 2) * 0.8;

	ackermann(playerLinVel, steeringAngle);

	playerY = 1 / 300 * 3.5;



	P = utils.MakePerspective(fov, aspectRatio, 0.1, 1000.0);

	W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);

	deltaPlayerAngle += playerAngle;

	angle = (angle + deltaPlayerAngle + deltaCamAngle_1 + deltaCamAngle_2 + 180) % 360 - 180;
	if (angle <= -180) angle += 360;
	elevation += deltaCamElevation_1 + deltaCamElevation_2;
	camRoll = 0.0;

	var nLookRadius = lookRadius + deltaLookRadius;
	if ((nLookRadius >= 0.8) && (nLookRadius <= 1.5) && !firstPersonView) {
		lookRadius = nLookRadius;
	}

	var driverPos;

	// define camera (target) position

	var minElev = -60.0;
	var maxElev = 60.0;

	elevation = Math.min(Math.max(elevation, minElev), maxElev);


	var nC = utils.multiplyMatrixVector(W, [lookRadius * driverPosX, lookRadius * (driverPosY - lookAtPosY) + lookAtPosY, lookRadius * driverPosZ, 1.0]);



	// camera position

	cx = nC[0];
	cy = nC[1];
	cz = nC[2];




	V = utils.MakeView(cx, cy, cz, elevation, angle);



	return [W, V, P];


}

function computeMatrices() {
	let prevCx = cx;
	let prevCz = cz;

	let viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

	let viewMatrixTransposed = utils.transposeMatrix(viewMatrix);

	viewMatrixTransposed[12] = viewMatrixTransposed[13] = viewMatrixTransposed[14] = 0.0;
	let xaxis = [viewMatrixTransposed[0], viewMatrixTransposed[4], viewMatrixTransposed[8]];
	let yaxis = [viewMatrixTransposed[1], viewMatrixTransposed[5], viewMatrixTransposed[9]];
	let zaxis = [viewMatrixTransposed[2], viewMatrixTransposed[6], viewMatrixTransposed[10]];

	if (rvx || rvy) {
		let qx = Quaternion.fromAxisAngle(xaxis, utils.degToRad(rvx));
		let qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(rvy));
		let qz = Quaternion.fromAxisAngle(zaxis, utils.degToRad(rvz));
		let viewMatFromQuat = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(qy.toMatrix4(), qx.toMatrix4()), qz.toMatrix4()), viewMatrixTransposed);
		let R11 = viewMatFromQuat[10];
		let R12 = viewMatFromQuat[8];
		let R13 = viewMatFromQuat[9];
		let R21 = viewMatFromQuat[2];
		let R31 = viewMatFromQuat[6];

		if ((R31 < 1) && (R31 > -1)) {
			theta = -Math.asin(R31);
			psi = Math.atan2(R21 / Math.cos(theta), R11 / Math.cos(theta));
		} else if (R31 <= -1) {
			theta = Math.PI / 2;
			psi = Math.atan2(R12, R13);
		} else {
			theta = -Math.PI / 2;
			psi = Math.atan2(-R12, -R13);
		}

		theta = (theta >= MAX_ELEVATION_ANGLE) ? MAX_ELEVATION_ANGLE : (theta <= MIN_ELEVATION_ANGLE ? MIN_ELEVATION_ANGLE : theta);

		elevation = utils.radToDeg(theta);
		angle = -utils.radToDeg(psi);
	}


	let delta = utils.multiplyMatrixVector(viewMatrixTransposed, [vx, vy, vz, 0.0]);
	cx += delta[0] / 10;
	cz += delta[2] / 10;

	//Move is invalid
	if (prevVz !== vz && !is_valid_move([cx, cy, cz])) {
		cx = prevCx;
		cz = prevCz;
	}

	let camCoods = [cx, cy, cz];
}