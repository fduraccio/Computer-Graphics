


//Variables to load the model
var flowerStr, plantStr, birdStr,
  rock1Str, rock2Str, rock3Str,
  tree1Str, tree2Str, tree3Str,
  tree4Str, smallRockStr, environmentTexture,
  birdTexture;

//scene graphs variables--------------------------------------------------------
var Node = function () {
  this.children = [];
  this.localMatrix = utils.identityMatrix();
  this.worldMatrix = utils.identityMatrix();
};

Node.prototype.setParent = function (parent) {
  // remove us from our parent
  if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  // Add us to our new parent
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};

Node.prototype.updateWorldMatrix = function (matrix) {
  if (matrix) {
    // a matrix was passed in so do the math
    this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
  } else {
    // no matrix was passed in so just copy.
    utils.copy(this.localMatrix, this.worldMatrix);
  }

  // now process all the children
  var worldMatrix = this.worldMatrix;
  this.children.forEach(function (child) {
    child.updateWorldMatrix(worldMatrix);
  });
};
//------------------------------------------------------------------------------


var bgCol = [0.1, 0.1, 0.1, 1.0];
var cx = 0.0;
var cy = 0.0;
var cz = 10.0;
var angle = 0.01;
var elevation = 0.01;
var lookRadius = 10.0;

var vertPosAttr;
var vertNormAttr;
var skyboxVertPosAttr;