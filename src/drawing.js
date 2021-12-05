async function main() {

    var randomPosBird = Math.round(Math.random() * 200)
    var randomPosition = [];
    for (i = 0; i < 200; i++) {
        randomPosition[i] = Math.round(Math.random() * 5);

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


    var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
    var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
    var matrixLocation = gl.getUniformLocation(program, "matrix");
    var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
    var ambientAlphaHandle = gl.getUniformLocation(program, 'lambertColor');
    var textLocation = gl.getUniformLocation(program, "u_texture");
    var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    var vertexMatrixPositionHandle = gl.getUniformLocation(program, 'pMatrix');

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

        if (model.type == "rock") {
            rock.push(await loadAsset(model.obj, img[1]))
        }

        if (model.type == "floor") {
            floor = await loadAsset(model.obj, img[3])
        }

        if (model.type == "cloud") {
            cloud = await loadAsset(model.obj, img[5])
        }

        if (model.type == "flower") {
            flower = await loadAsset(model.obj, img[1])
        }

    }



    //Define the scene Graph

    var W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);

    var nC = utils.multiplyMatrixVector(W, [driverPosX, driverPosY, driverPosZ, 1.0]);

    cx = nC[0];
    cy = nC[1];
    cz = nC[2];

    requestAnimationFrame(drawScene);

    function animate() {
        currentTime = (new Date).getTime();
        if (lastUpdateTime) {

            var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;

            sunRise = ((sunRise + deltaC / 500 + Math.PI) % (2 * Math.PI)) - Math.PI;

            // directionalLightDir = [-Math.sin(sunRise), -Math.cos(sunRise), 0.0];

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



        var i = 0
        var trees = sceneConfig.attachmentPos[0].trees // di n.random
        var type = sceneConfig.attachmentPos[0].treeType // di n.random


        //TODO creare una mappa del mondo in cui posizionare gli oggetti
        for (var x = 1; x < 10; x++) {
            for (var y = 0; y < 20; y++) {
                worldMatrix = utils.MakeWorld(trees[0][0] + (y * 27), trees[0][1], trees[0][2] + (27 * choice) + (x * 54), trees[0][3], trees[0][4], trees[0][5], trees[0][6]);
                drawAsset(tree[randomPosition[(y + (20 * x))]][0], worldMatrix, viewMatrix, perspectiveMatrix);


                ornamentLocalMatrix = utils.MakeWorld(1.0, 0.1, 1.0, 0.0, 0.0, 0.0, 0.5);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                if (choice == -1) drawAsset(rock[3], ornamentWorldMatrix, viewMatrix, perspectiveMatrix);
                else drawAsset(tree[0][0], ornamentWorldMatrix, viewMatrix, perspectiveMatrix);

                ornamentLocalMatrix = utils.MakeWorld(-1.0, 0.1, 1, 0.0, 0.0, 0.0, 1);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                drawAsset(flower, ornamentWorldMatrix, viewMatrix, perspectiveMatrix);

                if (y + (x * 20) == randomPosBird) {
                    switch (tree[randomPosition[(y + (20 * x))]][1]) {
                        case "plant":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.3, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                        case "tree1":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 2.9, 0.3, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 2.9, 0.3, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                        case "tree2":
                            ornamentLocalMatrix = utils.MakeWorld(0.15, 4.5, 0.0, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.15, 4.5, 0.0, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                        case "tree3":
                            ornamentLocalMatrix = utils.MakeWorld(-0.2, 2.75, 0.01, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [-0.2, 2.75, 0.01, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                        case "tree4":
                            ornamentLocalMatrix = utils.MakeWorld(-0.65, 2.8, -0.3, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [-0.65, 2.8, -0.3, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                        case "stump":
                            ornamentLocalMatrix = utils.MakeWorld(0.0, 0.75, 0.1, 0.0, 0.0, 0.0, 0.5);
                            ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                            birdPos = utils.multiplyMatrixVector(worldMatrix, [0.0, 0.75, 0.1, 1])
                            birdPosition = [
                                [birdPos[0], birdPos[1], birdPos[2]], 3
                            ];
                            drawAsset(bird, ornamentWorldMatrix, viewMatrix, perspectiveMatrix)
                            break;
                    }

                }
                choice = choice * -1.0

            }
        }


        var borderArea = sceneConfig.attachmentPos[0].borderArea; // di n.random

        // Border area
        for (x = 0; x < 15; x++) {

            worldMatrix = utils.MakeWorld(borderArea[0][0] + (x * 40), borderArea[0][1], borderArea[0][2], borderArea[0][3], borderArea[0][4], borderArea[0][5], borderArea[0][6]);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(borderArea[1][0], borderArea[1][1], borderArea[1][2] - (x * 40), borderArea[1][3], borderArea[1][4], borderArea[1][5], borderArea[1][6]);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(borderArea[2][0] + (x * 40), borderArea[2][1], borderArea[2][2], borderArea[2][3], borderArea[2][4], borderArea[2][5], borderArea[2][6]);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(borderArea[3][0], borderArea[3][1], borderArea[3][2] - (x * 40), borderArea[3][3], borderArea[3][4], borderArea[3][5], borderArea[3][6]);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

        }

        for (x = 0; x < 15; x++) {
            for (y = 0; y < 16; y++) {

                worldMatrix = utils.MakeWorld(-280 + (x * 40), -10, 300.0 - (y * 40), 0.0, 270, 0.0, 0.2);
                drawAsset(floor, worldMatrix, viewMatrix, perspectiveMatrix)

            }
        }

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0, 0.0, 0.0, 0.0, 0.5),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0.0, 90.0, 0.0, 0.0, 0.5),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)

        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0.0, 50.0, 0.0, -90.0, 0.0, 0.0, 0.5),
            utils.MakeTranslateMatrix(Math.cos(time / 100 * 2 * Math.PI) * 100, 0.0, 0.0));
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)


        window.requestAnimationFrame(drawScene);

    }


    /**
     * Loads obj asset from the given directory 
     * @param {string} assetDir 
     * @param {string} texture 
     */
    async function loadAsset(assetDir, texture) {

        var vao = [];
        var bufferLength = [];

        var assetModel = await initMesh(assetDir)
        OBJ.initMeshBuffers(gl, assetModel);
        vao[i] = gl.createVertexArray();
        gl.bindVertexArray(vao[i]);

        bufferLength[i] = assetModel.indexBuffer.numItems

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

        texture[i] = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture[i]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindVertexArray(null);

        return { "id": i, "vao": vao, "texture": texture, "bufferLength": bufferLength };
    }

    /**
     * Draws the given asset in the position determined by the matrices
     * @param {Object} asset 
     * @param {*} worldMatrix 
     * @param {*} viewMatrix 
     * @param {*} perspectiveMatrix 
     */
    function drawAsset(asset, worldMatrix, viewMatrix, perspectiveMatrix) {

        var vwmatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
        var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, vwmatrix);
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(vwmatrix));

        gl.useProgram(program);

        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
        gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(vwmatrix));

        gl.uniform3fv(materialDiffColorHandle, [0.6, 0.6, 0.0]);
        gl.uniform3fv(lightColorHandle, directionalLightColor);
        gl.uniform3fv(lightDirectionHandle, directionalLight);
        gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, asset.texture[asset.id]);

        gl.bindVertexArray(asset.vao[asset.id]);
        gl.drawElements(gl.TRIANGLES, asset.bufferLength[asset.id], gl.UNSIGNED_SHORT, 0);

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
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtxs[i]);
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


}


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
                console.log(allText)
            }
        }
    }
    rawFile.send(null);
}


window.onload = readTextFile("classifica.txt");