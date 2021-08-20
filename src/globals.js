var shaderDir = "shaders/";
var perspectiveMatrix;

// WEBGL HANDLERS
let vertexNormalHandle = null;
let vertexPositionHandle = null;
let vertexUVHandle = null;
let textureFileHandle = null;
let textureInfluenceHandle = null;
let ambientLightInfluenceHandle = null;
let ambientLightColorHandle = null;
let matrixPositionHandle = null;
let materialDiffColorHandle = null;
let lightDirectionHandle = null;
let lightPositionHandle = null;
let lightColorHandle = null;
let lightTypeHandle = null;
let eyePositionHandle = null;
let materialSpecColorHandle = null;
let materialSpecPowerHandle = null;

let paint_name = null;
let vx = 0, vy = 0, vz = 0;
let rvx = 0, rvy = 0, rvz = 0;
let theta = 0, psi = 0;

let prevVz = 0;

let keys = [];

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 10.0;

var firstPersonView = true;

// For the exercise
var tTransform;
var sTransform = [];
var sTransformText = [];

var curr_tTransform = 0;
var curr_sTransform = 0;
var changeT = true;

// camera orientation variation for first-person view
var deltaCamAngle_1 = 0.0;
var deltaCamElevation_1 = 0.0;

// camera orientation variation for third-person view
var deltaCamAngle_2 = 0.0;
var deltaCamElevation_2 = 0.0;

var camVel = [0.0, 0.0, 0.0];

var carIndex = 0;

// objects in the scene
let sceneObjects = [];

var assetsObj = [
    'object/flower.obj',
    'object/plant.obj',
    'object/red.obj',

    'object/rock1.obj',
    'object/rock2.obj',
    'object/rock3.obj',
    'object/tree1.obj',
    'object/tree2.obj',
    'object/tree3.obj',
    'object/tree4.obj',
    'object/smallrock.obj'];

var textures = [
    'texture/Texture_01.png',
    'texture/texture_birb.png']

