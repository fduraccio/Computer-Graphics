



function initializeVariables(){
	utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function ClearBits(){
    gl.clearColor(bgCol[0], bgCol[1], bgCol[2], bgCol[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function SetViewportAndCanvas(){
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    ClearBits();
}

function SetMatrices(){
    viewMatrix = utils.MakeView(cx, cy, cz, 0.0, 0.0);
    perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    
}

function DrawSkybox(){
    gl.useProgram(program);
    
    gl.activeTexture(gl.TEXTURE0+3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.uniform1i(skyboxTexHandle, 3);
    
    var viewProjMat = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
    inverseViewProjMatrix = utils.invertMatrix(viewProjMat);
    gl.uniformMatrix4fv(inverseViewProjMatrixHandle, gl.FALSE, utils.transposeMatrix(inverseViewProjMatrix));
    
    gl.bindVertexArray(skyboxVao);
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
}

function DrawScene(){
    ClearBits();
    
    gl.useProgram(program);
    
    angle = angle;// + rvy;
	elevation = elevation;// + rvx;
	
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
    
    DrawSkybox();
        
    window.requestAnimationFrame(DrawScene);
}


function main(){

	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("keyup", keyFunctionUp, false);
	SetViewportAndCanvas();
    SetMatrices();
    GetAttributesAndUniforms();
    
    DrawScene();
}

function GetAttributesAndUniforms(){
    //Uniforms
    skyboxTexHandle = gl.getUniformLocation(program, "u_texture"); 
    inverseViewProjMatrixHandle = gl.getUniformLocation(program, "inverseViewProjMatrix"); 
    skyboxVertPosAttr = gl.getAttribLocation(program, "in_position");
}
/*function main(){
	console.log("casa")
    initializeVariables()
	// setup everything else
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	

	// Create a texture
	imgtx = new Image();
	imgtx.src = baseDir+"texture/Texture_01.jpg";
	imgtx.onload = function() {
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
		
		
		// links mesh attributes to shader attributes
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);
		 
	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);
		 
	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);

	program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	program.textureUniform = gl.getUniformLocation(program, "u_texture");
		
	OBJ.initMeshBuffers(gl, flowerModel);
		
	// prepares the world, view and projection matrices.
	var w=canvas.clientWidth;
	var h=canvas.clientHeight;
		
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
		
	perspProjectionMatrix = perspective();


	// selects the mesh
	gl.bindBuffer(gl.ARRAY_BUFFER, flowerModel.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, flowerModel.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, flowerModel.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, flowerModel.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, flowerModel.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, flowerModel.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flowerModel.indexBuffer);		
	
	var textureId = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D, textureId);		
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtx);		
	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// turn on depth testing
	gl.enable(gl.DEPTH_TEST);

	//drawScene();
	
}*/


function LoadEnvironment(){
    skyboxVertPos = new Float32Array(
    [
      -1, -1, 1.0,
       1, -1, 1.0,
      -1,  1, 1.0,
      -1,  1, 1.0,
       1, -1, 1.0,
       1,  1, 1.0,
    ]);
    
    skyboxVao = gl.createVertexArray();
    gl.bindVertexArray(skyboxVao);
    
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(skyboxVertPosAttr);
    gl.vertexAttribPointer(skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);
    
    skyboxTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    
    var envTexDir = baseDir+"env/";
 
    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
            url: envTexDir+'front.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
            url: envTexDir+'back.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
            url: envTexDir+'top2.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
            url: envTexDir+'bottom.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
            url: envTexDir+'right.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
            url: envTexDir+'left.png',
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;
        
        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1024;
        const height = 1024;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        
        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        
        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded upload it to the texture.
            gl.activeTexture(gl.TEXTURE0+3);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    
        
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
}


async function init(){
	console.log("casa");
	var path = window.location.pathname;
	var page = path.split("/").pop();
	baseDir = window.location.href.replace(page, '');
	shaderDir = baseDir+"shaders/"; 

  	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		document.write("GL context not opened");
		return;
	}

  	await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
  	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
  	var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

  	program = utils.createProgram(gl, vertexShader, fragmentShader);
	});

	gl.useProgram(program);

	//Load Models 
	var flowerObj = await utils.get_objstr(baseDir + flowerStr);
    flowerModel = new OBJ.Mesh(flowerObj);

    var plantObj = await utils.get_objstr(baseDir + plantStr);
    plantModel = new OBJ.Mesh(plantObj);

	var birdObj = await utils.get_objstr(baseDir + birdStr);
    birdModel = new OBJ.Mesh(birdObj);

	var rock1Obj = await utils.get_objstr(baseDir + rock1Str);
    rock1Model = new OBJ.Mesh(rock1Obj);

	var rock2Obj = await utils.get_objstr(baseDir + rock2Str);
    rock2Model = new OBJ.Mesh(rock2Obj);

	var rock3Obj = await utils.get_objstr(baseDir + rock3Str);
    rock3Model = new OBJ.Mesh(rock3Obj);

	var tree1Obj = await utils.get_objstr(baseDir + tree1Str);
    tree1Model = new OBJ.Mesh(tree1Obj);

	var tree2Obj = await utils.get_objstr(baseDir + tree2Str);
    tree2Model = new OBJ.Mesh(tree2Obj);

	var tree3Obj = await utils.get_objstr(baseDir + tree3Str);
    tree1Model = new OBJ.Mesh(tree3Obj);

	var tree4Obj = await utils.get_objstr(baseDir + tree4Str);
    tree1Model = new OBJ.Mesh(tree4Obj);

    var smallRObj = await utils.get_objstr(baseDir + smallRockStr);
    smallRModel = new OBJ.Mesh(smallRObj);

	///////////////////////////////////
	LoadEnvironment()

	main();
}

