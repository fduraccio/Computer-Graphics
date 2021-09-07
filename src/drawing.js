
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
    gl.enable(gl.DEPTH_TEST);

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

    // load bird
    redAsset = await loadAsset(redObj[0], img[0])

    // load asset
    for (var i = 0; i < assetsObj.length; i++) {
        assets[i] = await loadAsset(assetsObj[i], img[1]);
    }
    console.log(assets)

    grass = await loadAsset('object/grass2.obj', img[2])

    //Define the scene Graph

	var W = utils.MakeWorld(playerX, playerY, playerZ, 0.0, playerAngle, 0.0, 1.0);
	
	var nC = utils.multiplyMatrixVector(W, [lookRadius*driverPosX, lookRadius*driverPosY, lookRadius*driverPosZ, 1.0]);
	
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
        // sky color
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

        // projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

        // worldMatrix = utils.MakeWorld(cx + Math.cos(sunRise) * roadScale * 10, roadScale * 10, cz + Math.cos(sunRise) * roadScale * 10, 0.0, 0.0, 0.0, roadScale * 0.25);
        // worldMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(0.5), worldMatrix);

        worldMatrix2 = utils.multiplyMatrices(utils.MakeRotateXMatrix(0.5), worldMatrix)
        // worldMatrix2 = utils.multiplyMatrices(utils.MakeTranslateMatrix(20, 0, 0), worldMatrix)

        drawAsset(grass, worldMatrix, viewMatrix, perspectiveMatrix)
        drawAsset(redAsset, worldMatrix2, viewMatrix, perspectiveMatrix)
        // drawAsset(assets[0], worldMatrix, viewMatrix, perspectiveMatrix)
        // drawAsset(assets[1], worldMatrix2, viewMatrix, perspectiveMatrix)

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

        gl.enable(gl.DEPTH_TEST);
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
    if((window.innerWidth > 40) && (window.innerHeight > 240)) {
        canvas.width  = window.innerWidth - 16;
        canvas.height = window.innerHeight - 200;
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.viewport(0.0, 0.0, w, h);
        
        aspectRatio = w/h;
    }
}




async function init() {
    helpPanel = document.getElementById("help-panel");
    helpPanel.style.display = "none";
    canvasPanel = document.getElementById("canvas-panel");
    canvasPanel.style.display = "none";

    var canvas = document.getElementById("canvas");

    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("keyup", keyFunctionUp, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    window.addEventListener("keydown", keyFunctionDown, false);
    window.addEventListener("keypress", keyPanelFunction, false);

    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("Error: WebGL not supported by your browser!");
        return;
    }

    aspectRatio = canvas.clientWidth / canvas.clientHeight;
    window.onresize = doResize();

    utils.resizeCanvasToDisplaySize(gl.canvas);

    // load and compile shaders
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    gl.useProgram(program);

    main();

}

window.onload = init;


// load an object .obj
async function initMesh(objDir) {
    var objStr = await utils.get_objstr(objDir);
    return new OBJ.Mesh(objStr);
}

