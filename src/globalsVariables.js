
var objStr = await utils.get_objstr(pathToModel); 
var objModel = new OBJ.Mesh(objStr);

var modelVertices = objModel.vertices; //Array of vertices
var modelNormals = objModel.normals; //Array of normals
var modelIndices = objModel.indices; //Array of indices
var modelTexCoords = objModel.textures;