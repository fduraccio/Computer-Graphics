var shaderDir = "shaders/";
var textureDir = "texture/";
var JSONRoadsDir = "grass/";


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

let vx = 0, vy = 0, vz = 0;
let rvx = 0, rvy = 0, rvz = 0;
let theta = 0, psi = 0;

let prevVz = 0;

let keys = [];
var vao = []
var bufferLength = []
var texture = []

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 10.0;

var firstPersonView = true;

var angle = 0.01;
var elevation = 0.01;
var lookRadius = 10.0;

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

var redObj = ['object/red.obj'];

var redAsset;

var assetsObj = [
    'object/flower.obj',
    'object/plant.obj',
    // 'object/rock1.obj',
    // 'object/rock2.obj',
    // 'object/rock3.obj',
    'object/tree1.obj',
    // 'object/tree2.obj',
    // 'object/tree3.obj',
    // 'object/tree4.obj',
    'object/smallrock.obj'
];

var texture = [
    'texture_birb.png',
    'Texture_01.jpg'
]

var roadAssetsJSONs = [
    "road01.json",
    "road02.json",
    "road03.json",
    "road04.json",
    "road05.json",
    "road06.json",
    "road07.json",
    "road09.json",
    "road10.json",
    "road11.json",
    "road12.json",
    "road13.json"
];

var assets = []
var textures = [
    'texture/Texture_01.png',
    'texture/texture_birb.png']



var sunRise = 0.0;
var dayLightColor = [0.6, 0.8, 0.95];
var sunsetLightColor = [1.0, 0.83, 0.44];
var darkLightColor = [0.07, 0.07, 0.12];
var skyAlpha = 1.0;
var skyColor = [0.0, 0.0, 0.0];
var ambientLightCoeff = 0.3;
var ambientLightAlpha = 0.0;

var spotLightPos1 = [0.0, 0.0, 0.0];
var spotLightPos2 = [0.0, 0.0, 0.0]
var spotLightDir = [0.0, 0.0, 1.0];
var spotLightColor = [1.0, 1.0, 0.75];
var spotLightTarget = 8.0;
var spotLightDecay = 2;
var outerCone = 120.0;
var innerCone = 60.0;

var viewMatrix;
var perspectiveMatrix;