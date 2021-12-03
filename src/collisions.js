/**
 * Checks AABB - AABB collision
 * @param {} one 
 * @param {*} two 
 * @param {*} weight 
 */
function checkCollision(one, two, weight) {
    if (weight == -1) {
        return two < one
    } else {
        return two > one
    }
}

/**
 * Checks the collision in the environment
 */
function checkCollisionEnv() {
    var localPos = [cx, cy, cz, 1]

    return checkCollision(270, localPos[2], 1) || checkCollision(270, localPos[0], 1) ||
        checkCollision(-270, localPos[2], -1) || checkCollision(-270, localPos[0], -1);
}