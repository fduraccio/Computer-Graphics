/**
 * Main function of the game
 */
async function main() {

    if (difficulty == 3) {
        difficulty = 2;
        var tmp = true;
    }
    startGame = (new Date).getTime();
    var randomPosBird = Math.round(Math.random() * 150 * difficulty)

    for (i = 0; i < 200 * difficulty; i++) {
        randomPosition[i] = Math.round(Math.random() * 5);
        randomPositionDesert[i] = Math.round(Math.random() * 3);
        randomPositionRockDesert[i] = Math.round(Math.random() * 7)

    }

    var dirLightAlpha = -utils.degToRad(-60);
    var dirLightBeta = -utils.degToRad(120);
    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
        Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
    ];
    var directionalLightColor = [0.8, 1.0, 1.0];


    //SET Global states (viewport size, viewport background color, Depth test)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // set memory locations defined in the shaders
    var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
    var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
    var textLocation = gl.getUniformLocation(program, "u_texture");

    var matrixLocation = gl.getUniformLocation(program, "matrix");
    var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
    var vertexMatrixPositionHandle = gl.getUniformLocation(program, 'pMatrix');

    var eyePositionHandle = gl.getUniformLocation(program, 'eyePosition');
    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    var spotLightPos1Handle = gl.getUniformLocation(program, 'spotLightPos1');
    var spotLightDirHandle = gl.getUniformLocation(program, 'spotLightDir');

    var materialSpecPowerHandle = gl.getUniformLocation(program, 'mSpecPower');
    var ambientCoeffHandle = gl.getUniformLocation(program, 'ambCoeff');
    var ambientAlphaHandle = gl.getUniformLocation(program, 'ambAlpha');
    var spotLightTargetHandle = gl.getUniformLocation(program, 'spotLightTarget');
    var spotLightDecayHandle = gl.getUniformLocation(program, 'spotLightDecay');
    var outerConeHandle = gl.getUniformLocation(program, 'outerCone');
    var innerConeHandle = gl.getUniformLocation(program, 'innerCone');

    var materialEmissColorHandle = gl.getUniformLocation(program, 'mEmissColor');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    var materialSpecColorHandle = gl.getUniformLocation(program, 'mSpecColor');
    var spotLightColorHandle = gl.getUniformLocation(program, 'spotLightColor');


    var objectAll = []

    var img = loadTextures();
    let sceneConfig = await (await fetch(`json/config.json`)).json();
    for (let model of sceneConfig.models) {
        if (model.type == "bird") {
            bird = await loadAsset(model.obj, img[0])
        }

        if (model.type == "tree") {
            tree.push([await loadAsset(model.obj, img[1]), model.name])
        }

        if (model.type == "winter-tree") {
            winterTree.push([await loadAsset(model.obj, img[6]), model.name])
        }

        if (model.type == "winter-rock") {
            winterRock.push(await loadAsset(model.obj, img[6]))
        }

        if (model.type == "winter-plant") {
            winterPlant.push(await loadAsset(model.obj, img[6]))
        }

        if (model.type == "snowman") {
            winterPlant.push(await loadAsset(model.obj, img[6]))
        }

        if (model.type == "rock") {
            rock.push(await loadAsset(model.obj, img[1]))
        }

        if (model.type == "floor") {
            floor = environment == "winterland" ? await loadAsset(model.obj, img[5]) :
                environment == "desert" ? await loadAsset(model.obj, img[8]) : await loadAsset(model.obj, img[3]);
        }

        if (model.type == "cloud") {
            cloud = await loadAsset(model.obj, img[5])
        }

        if (model.type == "flower") {
            flower = await loadAsset(model.obj, img[1])
        }

        if (model.type == "desert-rock") {
            desertRock.push(await loadAsset(model.obj, img[7]))
        }

        if (model.type == "desert-plant" || model.type == "desert-rock" || model.name == "rock02") {
            desertTree.push([await loadAsset(model.obj, img[7]), model.name])
        }


    }




    //Define the scene Graph

    var W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);

    var nC = utils.multiplyMatrixVector(W, [viewPosX, viewPosY, viewPosZ, 1.0]);

    cameraX = nC[0];
    cameraY = nC[1];
    cameraZ = nC[2];

    requestAnimationFrame(drawScene);

    function animate() {
        currentTime = (new Date).getTime();
        if (lastUpdateTime) {

            var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;

            sunRise = ((sunRise + deltaC / 500 + Math.PI) % (2 * Math.PI)) - Math.PI;

            directionalLightDir = [-Math.sin(sunRise), -Math.cos(sunRise), 0.0];

            if (Math.abs(sunRise) < utils.degToRad(60.0) || !enableSpotLight) {
                spotLight = [0.0, 0.0, 0.0];
            } else {
                spotLight = spotLightColor;
            }

            var WVP = computeWPV(vz, steeringDir);

            worldMatrix = WVP[0];
            viewMatrix = WVP[1];
            perspectiveMatrix = WVP[2];

            // generateMap();
        }

        lastUpdateTime = currentTime;
    }

    /**
     * Draws the scene
     * @param {*} time 
     */
    function drawScene(time) {
        time *= 0.001;

        animate();

        // sky color that changes with time
        skyAlpha = Math.min(Math.max((Math.cos(sunRise) / Math.cos(utils.degToRad(60.0)) + 1) / 2, 0.0), 1.0);

        var th = 0.5;
        if (skyAlpha < th) {
            skyColor[0] = (skyAlpha * sunsetLightColor[0] + (th - skyAlpha) * darkLightColor[0]) / th;
            skyColor[1] = (skyAlpha * sunsetLightColor[1] + (th - skyAlpha) * darkLightColor[1]) / th;
            skyColor[2] = (skyAlpha * sunsetLightColor[2] + (th - skyAlpha) * darkLightColor[2]) / th;
        } else {
            skyColor[0] = ((1 - skyAlpha) * sunsetLightColor[0] + (skyAlpha - th) * dayLightColor[0]) / (1 - th);
            skyColor[1] = ((1 - skyAlpha) * sunsetLightColor[1] + (skyAlpha - th) * dayLightColor[1]) / (1 - th);
            skyColor[2] = ((1 - skyAlpha) * sunsetLightColor[2] + (skyAlpha - th) * dayLightColor[2]) / (1 - th);
        }
        ambientLightAlpha = 1.0;

        gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));

        lDir = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), directionalLightDir);

        var spotLightMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeWorld(cameraX, cameraY, cameraZ, playerAngle, 0.0, 0.0, 1.0));
        var spotLightMatrix_inv_t = utils.invertMatrix(utils.transposeMatrix(spotLightMatrix));

        var spotPos1 = utils.multiplyMatrixVector(spotLightMatrix, [spotLightPos1[0], spotLightPos1[1], spotLightPos1[2], 1.0]);
        spotDir = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(spotLightMatrix_inv_t), spotLightDir);

        lightAlpha = Math.min(Math.max((Math.cos(sunRise) - Math.sin(utils.degToRad(-10.0))) / (Math.sin(utils.degToRad(30.0)) - Math.sin(utils.degToRad(-10.0))), 0.0), 1.0);
        dirLightColor = [lightAlpha * directionalLightColor[0], lightAlpha * directionalLightColor[1], lightAlpha * directionalLightColor[2]];

        // set uniforms
        gl.uniform3fv(lightDirectionHandle, lDir);
        gl.uniform3fv(lightColorHandle, dirLightColor);
        gl.uniform3fv(materialSpecColorHandle, specularColor);
        gl.uniform1f(materialSpecPowerHandle, specularPower);
        gl.uniform3fv(eyePositionHandle, [0.0, 0.0, 0.0]);
        gl.uniform3fv(spotLightColorHandle, spotLight);
        gl.uniform3fv(spotLightPos1Handle, [spotPos1[0], spotPos1[1], spotPos1[2]]);
        //gl.uniform3fv(spotLightPos2Handle, [spotPos2[0], spotPos2[1], spotPos2[2]]);
        gl.uniform3fv(spotLightDirHandle, spotDir);
        gl.uniform1f(spotLightTargetHandle, spotLightTarget);
        gl.uniform1f(spotLightDecayHandle, spotLightDecay);
        gl.uniform1f(outerConeHandle, outerCone);
        gl.uniform1f(innerConeHandle, innerCone);
        gl.uniform1f(ambientCoeffHandle, ambientLightCoeff);
        gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);


        trees = sceneConfig.attachmentPos[0].trees // di n.random

        if (environment == "woodland") {
            //TODO creare una mappa del mondo in cui posizionare gli oggetti
            createWoodlandMap();

        } else if (environment == "winterland") {
            //worldMatrix=utils.MakeWorld(trees[2][0], trees[2][1], trees[2][2], trees[2][3], trees[2][4], trees[2][5], trees[2][6]);
            //drawAsset(snowman[0], worldMatrix, viewMatrix, perspectiveMatrix, false);
            createWinterlandMap();
        } else if (environment == "desert") {
            createDesertMap();
        }


        borderArea = sceneConfig.attachmentPos[0].borderArea; // di n.random

        // Border area
        if (environment == "desert") {
            for (x = 0; x < 25; x++) {
                worldMatrix = utils.MakeWorld(borderArea[4][0] + (x * 25), borderArea[4][1], borderArea[4][2], borderArea[4][3], borderArea[4][4], borderArea[4][5], borderArea[4][6]);
                drawAsset(desertRock[4], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[5][0], borderArea[5][1], borderArea[5][2] - (x * 25), borderArea[5][3], borderArea[5][4], borderArea[5][5], borderArea[5][6]);
                drawAsset(desertRock[4], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[6][0] + (x * 25), borderArea[6][1], borderArea[6][2], borderArea[6][3], borderArea[6][4], borderArea[6][5], borderArea[6][6]);
                drawAsset(desertRock[4], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[7][0], borderArea[7][1], borderArea[7][2] - (x * 25), borderArea[7][3], borderArea[7][4], borderArea[7][5], borderArea[7][6]);
                drawAsset(desertRock[4], worldMatrix, viewMatrix, perspectiveMatrix, false);
            }
        } else {
            for (x = 0; x < 15; x++) {
                worldMatrix = utils.MakeWorld(borderArea[0][0] + (x * 40), borderArea[0][1], borderArea[0][2], borderArea[0][3], borderArea[0][4], borderArea[0][5], borderArea[0][6]);
                drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[1][0], borderArea[1][1], borderArea[1][2] - (x * 40), borderArea[1][3], borderArea[1][4], borderArea[1][5], borderArea[1][6]);
                drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[2][0] + (x * 40), borderArea[2][1], borderArea[2][2], borderArea[2][3], borderArea[2][4], borderArea[2][5], borderArea[2][6]);
                drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix, false);

                worldMatrix = utils.MakeWorld(borderArea[3][0], borderArea[3][1], borderArea[3][2] - (x * 40), borderArea[3][3], borderArea[3][4], borderArea[3][5], borderArea[3][6]);
                drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix, false);

            }
        }

        for (x = 0; x < 15; x++) {
            for (y = 0; y < 16; y++) {

                worldMatrix = utils.MakeWorld(-280 + (x * 40), -10, 300.0 - (y * 40), 0.0, 270.0, 0.0, 0.2);
                drawAsset(floor, worldMatrix, viewMatrix, perspectiveMatrix, false)

            }
        }

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0, 0.0, 0.0, 0.0, 0.3),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix, true)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0.0, 90.0, 0.0, 0.0, 0.3),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix, true)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0.0, -90.0, 0.0, 0.0, 0.3),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix, true)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(-300.0, 50.0, 0, 0.0, 0.0, 0.0, 0.3),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix, true)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(300.0, 50.0, 0, 0.0, 0.0, 0.0, 0.3),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix, true)


        window.requestAnimationFrame(drawScene);

    }


    /**
     * Loads obj asset from the given directory 
     * @param {string} assetDir 
     * @param {string} texture 
     */
    async function loadAsset(assetDir, texture) {

        var vao, bufferLength;

        var assetModel = await initMesh(assetDir)
        OBJ.initMeshBuffers(gl, assetModel);
        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        bufferLength = assetModel.indexBuffer.numItems

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetModel.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetModel.vertexNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(assetModel.textures), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation);
        gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(assetModel.indices), gl.STATIC_DRAW);

        tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindVertexArray(null);

        return {"vao": vao, "texture": tex, "bufferLength": bufferLength };
    }

    /**
     * Draws the given asset in the position determined by the matrices
     * @param {Object} asset 
     * @param {*} worldMatrix 
     * @param {*} viewMatrix 
     * @param {*} perspectiveMatrix 
     */
    function drawAsset(asset, worldMatrix, viewMatrix, perspectiveMatrix, emittedColor) {

        var vwmatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
        var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, vwmatrix);
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(vwmatrix));

        //gl.useProgram(program);

        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
        gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(vwmatrix));

        /*gl.uniform3fv(materialDiffColorHandle, [0.6, 0.6, 0.0]);
        gl.uniform3fv(lightColorHandle, directionalLightColor);
        gl.uniform3fv(lightDirectionHandle, directionalLight);
        gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);*/
        if (!emittedColor) gl.uniform3fv(materialEmissColorHandle, [0.0, 0.0, 0.0]);
        else gl.uniform3fv(materialEmissColorHandle, [0.2, 0.2, 0.2]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, asset.texture);

        gl.bindVertexArray(asset.vao);
        gl.drawElements(gl.TRIANGLES, asset.bufferLength, gl.UNSIGNED_SHORT, 0);

    }

    /**
     * Loads Textures   TODO: da rivedere la logica
     */
    function loadTextures() {
        // load textures
        var imgtxs = [];
        for (var i = 0; i < texture.length; i++) {
            imgtxs[i] = new Image();
            imgtxs[i].onload = function() {
                var textureId = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0 + 0);
                gl.bindTexture(gl.TEXTURE_2D, textureId);
                //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtxs[i]);
                // set the filtering so we don't need mips
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            imgtxs[i].crossOrigin = "anonymous";
            imgtxs[i].src = texture[i];
        }
        return imgtxs
    }

    function createDesertMap() {
        for (var x = 0; x < 10 * difficulty; x++) {
            for (var y = 0; y < 20; y++) {

                worldMatrix = utils.MakeWorld(trees[2][0] + (y * 27), trees[2][1], trees[2][2] + (27 * choice) + (x * (54.0 / (difficulty))), trees[2][3], trees[2][4], trees[2][5], trees[2][6]);
                drawAsset(desertTree[randomPositionDesert[(y + (20 * x))]][0], worldMatrix, viewMatrix, perspectiveMatrix, false);


                ornamentLocalMatrix = utils.MakeWorld(1.0, 0.1, 1.0, 0.0, 0.0, 0.0, 0.3);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                drawAsset(desertRock[randomPositionDesert[(y + (20 * x))]], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);

                if (y + (x * 20) == randomPosBird) {
                    switch (desertTree[randomPositionDesert[(y + (20 * x))]][1]) {
                        case "aloe":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.5, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "cactus01":
                            ornamentLocalMatrix = utils.MakeWorld(0.5, 0.25, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.5, 0.25, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "cactus02":
                            ornamentLocalMatrix = utils.MakeWorld(0.5, 2.1, 0.1, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.5, 2.1, 0.1, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "cactus03":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.75, -0.1, 180.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.75, -0.1, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;

                    }
                }
                choice = y != 20 ? choice * -1.0 : choice
            }

        }
    }

    function createWoodlandMap() {
        for (var x = 1; x < 10 * difficulty; x++) {
            for (var y = 0; y < 20; y++) {
                // console.log(choice)
                worldMatrix = utils.MakeWorld(trees[0][0] + (y * 27), trees[0][1], trees[0][2] + (27 * choice) + (x * (54.0 / (difficulty))), trees[0][3], trees[0][4], trees[0][5], trees[0][6]);
                drawAsset(tree[randomPosition[(y + (20 * x))]][0], worldMatrix, viewMatrix, perspectiveMatrix, false);


                ornamentLocalMatrix = utils.MakeWorld(1.0, 0.1, 1.0, 0.0, 0.0, 0.0, 0.5);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                if (choice == -1) drawAsset(rock[3], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);
                else drawAsset(tree[0][0], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);

                ornamentLocalMatrix = utils.MakeWorld(-1.0, 0.1, 1, 0.0, 0.0, 0.0, 1);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                drawAsset(flower, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);

                if (y + (x * 20) == randomPosBird) {
                    switch (tree[randomPosition[(y + (20 * x))]][1]) {
                        case "plant":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.3, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree1":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 2.9, 0.3, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 2.9, 0.3, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree2":
                            ornamentLocalMatrix = utils.MakeWorld(0.15, 4.5, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.15, 4.5, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree3":
                            ornamentLocalMatrix = utils.MakeWorld(-0.2, 2.75, 0.01, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [-0.2, 2.75, 0.01, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree4":
                            ornamentLocalMatrix = utils.MakeWorld(-0.65, 2.8, -0.3, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [-0.65, 2.8, -0.3, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "stump":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.75, 0.1, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.75, 0.1, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                    }
                }

                choice = y != 20 ? choice * -1.0 : choice
            }
        }
    }

    function createWinterlandMap() {
        for (var x = 0; x < 10 * difficulty; x++) {
            for (var y = 0; y < 20; y++) {

                worldMatrix = utils.MakeWorld(trees[1][0] + (y * 27), trees[1][1], trees[1][2] + (x * (54.0 / (difficulty))), trees[1][3], trees[1][4], trees[1][5], trees[1][6]);
                drawAsset(winterTree[randomPosition[(y + (20 * x))]][0], worldMatrix, viewMatrix, perspectiveMatrix, false);


                ornamentLocalMatrix = utils.MakeWorld(1.0, 0.1, 1.0, 0.0, 0.0, 0.0, 0.5);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                if (choice == -1) drawAsset(winterRock[0], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);
                else drawAsset(winterPlant[1], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);

                ornamentLocalMatrix = utils.MakeWorld(-1.0, 0.1, 1, 0.0, 0.0, 0.0, 1);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                drawAsset(winterPlant[0], ornamentWorldMatrix, viewMatrix, perspectiveMatrix, false);

                if (y + (x * 20) == randomPosBird) {
                    switch (winterTree[randomPosition[(y + (20 * x))]][1]) {
                        case "tree":
                            randomPosBird += 1;
                            break;
                        case "tree1":
                            randomPosBird += 1;
                            break;
                        case "tree2":
                            ornamentLocalMatrix = utils.MakeWorld(0.3, 4.0, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.3, 4.0, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree3":
                            ornamentLocalMatrix = utils.MakeWorld(-0.2, 2.1, 0.01, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [-0.2, 2.1, 0.01, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix, !tmp)
                            break;
                        case "tree4":
                            randomPosBird += 1;
                            break;
                        case "tree5":
                            randomPosBird += 1;
                            break;
                    }
                }



                choice = y != 20 ? choice * -1.0 : choice
            }
        }
    }
}


/**
 * Initializes the canvas
 */
async function init() {

    let canvas = document.createElement("canvas");
    let canvasContainer = document.getElementById("canvas-container");

    canvasContainer.hidden = false;
    canvasContainer.appendChild(canvas);

    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    document.addEventListener("keyup", keyFunctionUp);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    document.addEventListener("keydown", keyFunctionDown);
    document.addEventListener("keypress", keyPanelFunction);

    gl = initWebGL(canvas)

    aspectRatio = canvas.clientWidth / canvas.clientHeight;

    // load and compile shaders
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function(shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    gl.useProgram(program);

    main();

}

/**
 * Loads an .obj file
 * @param {string} objDir 
 */
async function initMesh(objDir) {
    var objStr = await utils.get_objstr(objDir);
    return new OBJ.Mesh(objStr);
}

/**
 * Initializes WebGL
 * @param {HTMLElement} canvas 
 */
function initWebGL(canvas) {
    /** @type {WebGL2RenderingContext} */
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("GL context not opened");
        return;
    }

    // Resize canvas to fill page
    utils.resizeCanvasToDisplaySize(gl.canvas);

    // Set global options
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL); // so the skybox passes the test at 1.0

    return gl;
}

/**
 * Reads from .txt file
 * @param {*} file 
 */
async function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
                allText = allText.split("-");
                //per rimuovere le regex
                allText[9] = allText[9].split("\n")[0];
            }
        }
    }
    rawFile.send(null);
}

/**
 * Reads to .txt file
 * @param {*} file 
 */
function writeToFile(passForm) {
    const fs = require('fs');

    fs.writeFile(passForm, "Hey there!", function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

//window.onload = writeToFile("classifica.txt");
window.onload = readTextFile("classifica.txt");