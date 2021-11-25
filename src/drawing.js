
async function main() {

    var dirLightAlpha = -utils.degToRad(-60);
    var dirLightBeta = -utils.degToRad(120);
    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
    var directionalLightColor = [0.8, 1.0, 1.0];

    window.onresize = doResize;

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


    var img = loadTextures();
    console.log(img)
    let sceneConfig = await (await fetch(`json/config.json`)).json();


    i = 0
    var bird;
    var floor;
    var cloud;
    var tree = []
    var rock = []

    for (let model of sceneConfig.models) {
        if (model.type == "bird") {
            bird = await loadAsset(model.obj, img[0])
        }
        if (model.type == "tree") {
            tree.push(await loadAsset(model.obj, img[1]))

        }
        if (model.type == "rock") {
            rock.push(await loadAsset(model.obj, img[1]))
        }

        if(model.type == "floor") {
            floor = await loadAsset(model.obj, img[3])
        }
        if(model.type == "cloud"){
            cloud = await loadAsset(model.obj, img[4])
        }
    }

    // grass = await loadAsset('object/grass2.obj', img[2])

    //Define the scene Graph

    var W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);

    var nC = utils.multiplyMatrixVector(W, [lookRadius * driverPosX, lookRadius * driverPosY, lookRadius * driverPosZ, 1.0]);

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

    function drawScene(time) {
        time *= 0.001;

        animate();

        // sky color that change with time
        skyAlpha = Math.min(Math.max((Math.cos(sunRise) / Math.cos(utils.degToRad(60.0)) + 1) / 2, 0.0), 1.0);

        var th = 0.5;
        if (skyAlpha < th) {
            skyColor[0] = (skyAlpha * sunsetLightColor[0] + (th - skyAlpha) * darkLightColor[0]) / th;
            skyColor[1] = (skyAlpha * sunsetLightColor[1] + (th - skyAlpha) * darkLightColor[1]) / th;
            skyColor[2] = (skyAlpha * sunsetLightColor[2] + (th - skyAlpha) * darkLightColor[2]) / th;
        }
        else {
            skyColor[0] = ((1 - skyAlpha) * sunsetLightColor[0] + (skyAlpha - th) * dayLightColor[0]) / (1 - th);
            skyColor[1] = ((1 - skyAlpha) * sunsetLightColor[1] + (skyAlpha - th) * dayLightColor[1]) / (1 - th);
            skyColor[2] = ((1 - skyAlpha) * sunsetLightColor[2] + (skyAlpha - th) * dayLightColor[2]) / (1 - th);
        }
        ambientLightAlpha = 1.0;

        gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        

        //da creare una mappa del mondo in cui posizionare gli oggetti
        for (var x = 0; x < 2; x++) {
            for (var y = 0; y < tree.length; y++) {


                worldMatrix = utils.MakeWorld(-roadDistance * (x - 2), -5.0, roadDistance * (y - 2), 0.0, 2 * 90, 0.0, roadScale);

                ornamentLocalMatrix = utils.MakeWorld(-1.0, 0.0, 0.9 + x / 2, 0.0, 180, 0.0, 0.5);
                ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                drawAsset(tree[y], ornamentWorldMatrix, viewMatrix, perspectiveMatrix);

                // ornamentLocalMatrix = utils.MakeWorld(-0.8, 0.034, 0.0, 0.0, 180, 0.0, 0.2);
                // ornamentWorldMatrix = utils.multiplyMatrices(worldMatrix, ornamentLocalMatrix);
                // drawAsset(rock[y], ornamentWorldMatrix, viewMatrix, perspectiveMatrix);

            }
        }


        // border area
        for (x=0; x<15; x++){

            worldMatrix = utils.MakeWorld(-280+(x * 40), -8.0, 300.0, 0.0, 0.0, 0.0, 6);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(280, -8.0, 300.0 - (x*40) , 90.0, 0.0, 0.0, 6);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(-280+(x * 40), -8.0, -290.0, 0.0, 0.0, 0.0, 6);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);

            worldMatrix = utils.MakeWorld(-280, -8.0, 300.0 - (x*40) , 90.0, 0.0, 0.0, 6);
            drawAsset(rock[2], worldMatrix, viewMatrix, perspectiveMatrix);
        }

        worldMatrix = utils.MakeWorld(0, 50.0, 0, 0.0, 0.0, 0.0, 0.5);
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)

        worldMatrix = utils.MakeWorld(0.0, 50.0, 0.0, 90.0, 0.0, 0.0, 0.5);
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)

        worldMatrix = utils.MakeWorld(0.0, 50.0, 0.0, -90.0, 0.0, 0.0, 0.5);
        drawAsset(cloud, worldMatrix, viewMatrix, perspectiveMatrix)

        // draw floor
        worldMatrix = utils.multiplyMatrices(utils.MakeWorld(0, -15.0, 0, 0.0, 270.0, 0.0, 1), utils.MakeScaleNuMatrix(2, 2, 1));
        drawAsset(floor, worldMatrix, viewMatrix, perspectiveMatrix)

        window.requestAnimationFrame(drawScene);

    }


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

    function loadTextures() {

        // load textures
        var imgtxs = [];
        for (var i = 0; i < texture.length; i++) {
            imgtxs[i] = new Image();
            imgtxs[i].onload = function () {
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

    function doResize() {
        // set canvas dimensions
        if ((window.innerWidth > 40) && (window.innerHeight > 240)) {
            canvas.width = window.innerWidth - 16;
            canvas.height = window.innerHeight - 200;
            var w = canvas.clientWidth;
            var h = canvas.clientHeight;

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.viewport(0.0, 0.0, w, h);

            aspectRatio = w / h;
        }
    }

}

function doResize() {
    // set canvas dimensions
    if ((window.innerWidth > 40) && (window.innerHeight > 240)) {
        canvas.width = window.innerWidth - 16;
        canvas.height = window.innerHeight - 200;
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.viewport(0.0, 0.0, w, h);

        aspectRatio = w / h;
    }
}




async function init() {

    var canvas = document.getElementById("canvas");

    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("keyup", keyFunctionUp, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    window.addEventListener("keydown", keyFunctionDown, false);
    window.addEventListener("keypress", keyPanelFunction, false);

    gl = initWebGL(canvas)

    aspectRatio = canvas.clientWidth / canvas.clientHeight;
    window.onresize = doResize();

    scene = new Scene();


    // load and compile shaders
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    gl.useProgram(program);

    main();

}

// load an object .obj
async function initMesh(objDir) {
    var objStr = await utils.get_objstr(objDir);
    return new OBJ.Mesh(objStr);
}

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

window.onload = init;
