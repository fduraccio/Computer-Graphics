


function ClearBits() {
	gl.clearColor(bgCol[0], bgCol[1], bgCol[2], bgCol[3]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function SetViewportAndCanvas() {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enable(gl.DEPTH_TEST);
	ClearBits();
}

function GetAttributesAndUniforms() {
	//Uniforms
	skyboxTexHandle = gl.getUniformLocation(program, "u_texture");
	inverseViewProjMatrixHandle = gl.getUniformLocation(program, "inverseViewProjMatrix");
	skyboxVertPosAttr = gl.getAttribLocation(program, "in_position");
}

function SetMatrices() {
	viewMatrix = utils.MakeView(cx, cy, cz, 0.0, 0.0);
	perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
}

function DrawSkybox() {
	gl.useProgram(program);

	gl.activeTexture(gl.TEXTURE0 + 3);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
	gl.uniform1i(skyboxTexHandle, 3);

	var viewProjMat = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
	inverseViewProjMatrix = utils.invertMatrix(viewProjMat);
	gl.uniformMatrix4fv(inverseViewProjMatrixHandle, gl.FALSE, utils.transposeMatrix(inverseViewProjMatrix));

	gl.bindVertexArray(skyboxVao);
	gl.depthFunc(gl.LEQUAL);
	gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
}

function DrawScene() {
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

function InitTransforms() {
	vi = [utils.MakeScaleMatrix(0.1)];
	tTransform = vi.concat(perspective());

	sTransformText[0] = "Make perspective projection, FoV-y = 70 deg, a = 16/9, n = 1, f = 101";
	sTransform[0] = utils.MakePerspective(70,16/9,1,101);
		
	sTransformText[1] = "Make perspective projection, FoV-y = 105 deg, a = 16/9, n = 1, f = 101";
	sTransform[1] = utils.MakePerspective(105,16/9,1,101);


	
	sTransformText[2] = "Make perspective projection, FoV-y = 40 deg, a = 16/9, n = 1, f = 101";
	sTransform[2] = utils.MakePerspective(40,16/9,1,101);

	
	sTransformText[3] = "Make perspective projection, FoV-y = 90 deg, a = 4/3, n = 1, f = 101. Note: since the aspect ratio is not correct, the image should appear to be deformed";
	sTransform[3] = utils.MakePerspective(90,4/3,1,101);
	       	       
	sTransformText[4] = "Make perspective projection, l = -1.2, r = 0, t = 0.3375, b = -0.3375, n = 1, f = 101. Note: due to the asimmetry of this projection, only the left part of the scene should be visible";
	sTransform[4] = utils.MakeCompletePerspective(-1.2,0,-0.3375,0.3375,1,101);
	       	       
	document.getElementById("canvas").innerHTML = sTransformText[0];
}

async function init2() {

	InitTransforms()

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

	aspectRatio = canvas.clientWidth / canvas.clientHeight;

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	// load and compile shaders
	await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
		program = utils.createProgram(gl, vertexShader, fragmentShader);
	});
	gl.useProgram(program);

	// set memory locations defined in the shaders
	//TODO?


	//gli obj vengono caricati correttamente (vedi log in console) 
	// assetsObj.forEach((obj) => {
	// 	var m = initMesh(obj)
	// 	var vao = initVAO(gl, program, m)
	// })

	var mesh = await initMesh('object/red.obj')
	// mesh = new OBJ.Mesh(red);

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

	// links mesh attributes to shader attributes
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);

	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);

	program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	program.textureUniform = gl.getUniformLocation(program, "u_texture");

	OBJ.initMeshBuffers(gl, mesh);

	// prepares the world, view and projection matrices.
	var w = canvas.clientWidth;
	var h = canvas.clientHeight;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);

	// selects the mesh
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

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


	drawScene();

	


	function drawScene() {
		// update WV matrix
		cx = utils.degToRad(angle*30);
		cy = -utils.degToRad(elevation*30);
		viewMatrix = utils.MakeWorld(0,0,-5, cx, cy, 0, 1);

		// sets the uniforms
		gl.uniform1i(program.textureUniform, 0);

		// draws the request
		var preScale = 0.8;
		WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(sTransform[curr_sTransform], viewMatrix), utils.MakeScaleMatrix(preScale));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
		gl.drawElements(gl.LINE_STRIP, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);		
		
		// draws the answer
		if(!changeT) {
			WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(tTransform[curr_tTransform], viewMatrix), utils.MakeScaleMatrix(preScale));;
			gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
			gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}

		
		window.requestAnimationFrame(drawScene);		
}

	// LoadEnvironment()
	// main();

}






function LoadEnvironment() {
	skyboxVertPos = new Float32Array(
		[
			-1, -1, 1.0,
			1, -1, 1.0,
			-1, 1, 1.0,
			-1, 1, 1.0,
			1, -1, 1.0,
			1, 1, 1.0,
		]);

	skyboxVao = gl.createVertexArray();
	gl.bindVertexArray(skyboxVao);

	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);

	gl.enableVertexAttribArray(skyboxVertPosAttr);
	gl.vertexAttribPointer(skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);

	skyboxTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 3);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

	var envTexDir = "env/";

	const faceInfos = [
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			url: envTexDir + 'front.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			url: envTexDir + 'back.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			url: envTexDir + 'top.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			url: envTexDir + 'bottom.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			url: envTexDir + 'right.png',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			url: envTexDir + 'left.png',
		},
	];

	faceInfos.forEach((faceInfo) => {
		const { target, url } = faceInfo;

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
		image.addEventListener('load', function () {
			// Now that the image has loaded upload it to the texture.
			gl.activeTexture(gl.TEXTURE0 + 3);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
			gl.texImage2D(target, level, internalFormat, format, type, image);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		});


	});
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}



function initVAO(gl, program, mesh) {

	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(program.POSITION_ATTRIBUTE);
	gl.vertexAttribPointer(program.POSITION_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);

	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(program.NORMAL_ATTRIBUTE);
	gl.vertexAttribPointer(program.NORMAL_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);

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

function main() {
	SetViewportAndCanvas();
	SetMatrices();
	GetAttributesAndUniforms();

	// DrawScene();

}

//fetch file obj and it creates a mesh
async function initMesh(objDir) {
	var objStr = await utils.get_objstr(objDir);
	mesh = new OBJ.Mesh(objStr);
	console.log(objDir, mesh)
	return mesh
}



function perspective() {
	// Make perspective projection, FoV-y = 70 deg, a = 16/9, n = 1, f = 101.
	
	
	var A1 = perspectiveProjection(16/9, 1, 101, 70)
	// Make perspective projection, FoV-y = 105 deg, a = 16/9, n = 1, f = 101

	var A2 = perspectiveProjection(16/9, 1, 101, 105)
	// Make perspective projection, FoV-y = 40 deg, a = 16/9, n = 1, f = 101
	
	var A3 = perspectiveProjection(16/9, 1, 101, 40)
	// Make perspective projection, FoV-y = 90 deg, a = 4/3, n = 1, f = 101. Note: since the aspect ratio is not correct, the image should appear to be deformed
	
	var O1 = perspectiveProjection(4/3, 1, 101, 90)
	// Make perspective projection, l = -1.2, r = 0, t = 0.3375, b = -0.3375, n = 1, f = 101. Note: due to the asimmetry of this projection, only the left part of the scene should be visible

	var O2 = perspectiveProjection2(1,0,-1.2,0.3375,-0.3375, 101)

	return [A1, A2, A3, O1, O2];
}

function perspectiveProjection(a, n, f, fovY) {
	angle= utils.degToRad(fovY)
	m = utils.MakeScaleNuMatrix(1/(a*Math.tan(angle/2)), 1/Math.tan(angle/2), (f+n)/(n-f));
	
	m[11]=(2*f*n)/(n-f)
	m[14]= -1;
	m[15] = 0;
	return m;
}

function perspectiveProjection2(n,r,l,t,b,f){
	m = utils.MakeScaleNuMatrix((2*n)/(r-l), (2*n)/(t-b), (f+n)/(n-f));
	m[2] = (r+l)/(r-l)
	m[6]= (t+b)/(t-b)
	m[11]=(2*f*n)/(n-f)
	m[14]= -1;
	m[15] = 0;
	return m
	
}