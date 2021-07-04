
var canvas;
var gl = null,
	program = null,
	mesh = null;
	
var projectionMatrix, 
	perspProjectionMatrix,
	viewMatrix,
	worldMatrix;
var baseDir;
var shaderDir;
var program;

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 10.0;

function initializeVariables(){
	utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}
function main(){
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
	
}


function drawScene() {
	// update WV matrix
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	projectionMatrix = utils.multiplyMatrices(perspProjectionMatrix, viewMatrix);

	// sets the uniforms
	gl.uniform1i(program.textureUniform, 0);

	// draws the request
	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));		
	gl.drawElements(gl.TRIANGLES, flowerModel.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	window.requestAnimationFrame(drawScene);		
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

	main();
}

