
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


    var meshf = await initMesh('object/flower.obj')
    var mesht = await initMesh('object/plant.obj')

    // Create a texture
    imgtx = new Image();
    imgtx.onload = function () {
        var textureId = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, textureId);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtx);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    imgtx.src = 'texture/texture.png';

    OBJ.initMeshBuffers(gl, mesht);
    OBJ.initMeshBuffers(gl, meshf);


    var vaot = initVAO(gl, program, mesht)
    var vaof = initVAO(gl, program, meshf)

    //Define the scene Graph
    // Da capire perché non trasla gli oggetti 
    var objects = [];

    var treeNode = new Node();
    var flowerNode = new Node();


    treeNode.worldMatrix = utils.MakeTranslateMatrix(100,0,0)
    treeNode.localMatrix = utils.MakeScaleMatrix(50,50,50)
    treeNode.drawInfo = {
        materialColor: [0.6, 0.6, 0.0],
        programInfo: program,
        bufferLength: mesht.vertexBuffer.numItems,
        vertexArray: vaot,
    };

    flowerNode.worldMatrix = utils.MakeTranslateMatrix(0, 0, 40);
    flowerNode.localMatrix = utils.MakeTranslateMatrix(0, 0, 40);
    flowerNode.localMatrix = utils.MakeScaleMatrix(100,100,100)

    flowerNode.drawInfo = {
        materialColor: [0.6, 0.6, 0.0],
        programInfo: program,
        bufferLength: meshf.vertexBuffer.numItems,
        vertexArray: vaof,
    };

    // flowerNode.setParent(treeNode);

    var objects = [
        treeNode,
        flowerNode
    ];

    requestAnimationFrame(drawScene);

    // initialize a vao for each mesh
    function initVAO(gl, program, mesh) {

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
    
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.UV_ATTRIBUTE);
        gl.vertexAttribPointer(program.UV_ATTRIBUTE, 2, gl.FLOAT, false, 0, 0);
    
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
    
        return vao;
    }

    function drawScene(time) {
        time *= 0.001;

        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix 
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = utils.MakePerspective(50.0, aspect, 1.0, 2000.0);

        // Compute the camera matrix using look at. //DA CAPIRE
        var cameraPosition = [0.0, -200.0, 0.0];
        var target = [0.0, 0.0, 0.0];
        var up = [0.0, 0.0, 1.0];
        var cameraMatrix = utils.LookAt(cameraPosition, target, up);
        var viewMatrix = utils.invertMatrix(cameraMatrix);

        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);

        // update the local matrices for each object.
        treeNode.localMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(0.3), treeNode.localMatrix);
        flowerNode.localMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(0.6), flowerNode.localMatrix);

        treeNode.updateWorldMatrix()
        flowerNode.updateWorldMatrix()

        objects.forEach(function (object) {

            gl.useProgram(object.drawInfo.programInfo);

            var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, object.worldMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(object.worldMatrix));

            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

            gl.uniform3fv(materialDiffColorHandle, object.drawInfo.materialColor);
            gl.uniform3fv(lightColorHandle, directionalLightColor);
            gl.uniform3fv(lightDirectionHandle, directionalLight);

            gl.bindVertexArray(object.drawInfo.vertexArray);
            gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0);

        });

        requestAnimationFrame(drawScene);
        
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