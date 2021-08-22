
async function main() {

    var dirLightAlpha = -utils.degToRad(-60);
    var dirLightBeta = -utils.degToRad(120);
    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
    var directionalLightColor = [0.8, 1.0, 1.0];

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


    var img = loadTextures();
    var i;

    // load bird
    redAsset = await loadAsset(redObj[0], img[0])

    // load asset
    for (var i = 0; i < assetsObj.length; i++) {
        assets[i] = await loadAsset(assetsObj[i], img[1]);
    }
    console.log(assets)


    //Define the scene Graph

    localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(40, 0, 0), utils.multiplyMatrices(utils.MakeRotateXMatrix(90), utils.MakeScaleMatrix(30, 30, 30)))
    worldMatrix = localMatrix

    localMatrix2 = utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 40, 0), utils.multiplyMatrices(utils.MakeRotateXMatrix(45), utils.MakeScaleMatrix(30, 30, 30)))
    worldMatrix2 = localMatrix2

    localMatrix3 = utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 0, 40), utils.multiplyMatrices(utils.MakeRotateXMatrix(0), utils.MakeScaleMatrix(30, 30, 30)))
    worldMatrix3 = localMatrix3

    requestAnimationFrame(drawScene);

    function drawScene(time) {
        time *= 0.001;

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

        // Compute the camera matrix using look at. //DA CAPIRE
        var cameraPosition = [0.0, -200.0, 0.0];
        var target = [0.0, 0.0, 0.0];
        var up = [0.0, 0.0, 1.0];
        var cameraMatrix = utils.LookAt(cameraPosition, target, up);
        var viewMatrix = utils.invertMatrix(cameraMatrix);

        worldMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(0.3), worldMatrix);
        worldMatrix2 = utils.multiplyMatrices(utils.MakeRotateXMatrix(0.3), worldMatrix2);
        worldMatrix3 = utils.multiplyMatrices(utils.MakeRotateXMatrix(0.3), worldMatrix3);

        drawAsset(redAsset, worldMatrix, viewMatrix)
        drawAsset(assets[1], worldMatrix3, viewMatrix)
        drawAsset(assets[0], worldMatrix2, viewMatrix)

        requestAnimationFrame(drawScene);

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

    function drawAsset(asset, worldMatrix, viewMatrix) {

        // Compute the projection matrix 
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = utils.MakePerspective(50.0, aspect, 1.0, 2000.0);

        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);

        gl.useProgram(program);

        var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, worldMatrix);
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));

        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

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

        // Create bird texture
        var imgtxs = [];
        for (var i = 0; i < 2; i++) {
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
            imgtxs[i].src = texture[i];
        }
        return imgtxs
    }

}



async function init() {

    var canvas = document.getElementById("canvas");

    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("keyup", keyFunctionUp, false);
    window.addEventListener("keydown", keyFunctionDown, false);

    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("Error: WebGL not supported by your browser!");
        return;
    }

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

window.onload = init();


// load an object .obj
async function initMesh(objDir) {
    var objStr = await utils.get_objstr(objDir);
    return new OBJ.Mesh(objStr);
}

