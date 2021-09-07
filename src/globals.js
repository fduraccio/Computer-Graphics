var shaderDir = "shaders/";

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


// CONSTANTS
const KEY_CODE = {
    'INVIO': 13,
    'HELPPANEL': 72,
    'OPTIONS': 111, //a casa
    'A': 65,
    'W': 87,
    'S': 83,
    'D': 68,
    'I': 73,
    'F': 70,
    'UP': 38,
    'DOWN': 40,
    'LEFT': 37,
    'RIGHT': 39,
    'R': 82,
    'V': 86,
    'X': 88,
    'Z': 90,
    'F': 70

};


//Panel
var helpPanel;
var canvasPanel;
var mainPanel;

keys=[13, 65, 87, 83, 68, 73, 70, 38, 40, 37, 39, 82, 86, 88, 90, 70, 72]
let prevVz = 0;

var vao = []
var bufferLength = []
var texture = []
var buff = []

var currentTime;
var lastUpdateTime = (new Date).getTime();

var playerIndex = 0;
var playerLength = [];


var simpleCam = true;

var distance = 8.0;		// distance between car wheel axes
var odom_offset = 4.0;	// offset distance between ackermann odometry center and car model origin


// camera position w.r.t. car (object space)
var driverPosX = 0.0;
var driverPosY = 3.0;
var driverPosZ = 0.0;

var lookAtPosY = 2.5;

var planarDist = Math.sqrt(Math.pow(driverPosX, 2) + Math.pow(driverPosZ, 2));


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

// player pose
var playerX = 0.0;
var playerY = 0.0;
var playerZ = 0.0;
var playerAngle = 0.0;

var deltaPlayerAngle = 0.0;

// var vz = 0.0;			// control input for moving the player
var preVz = 0.0;
var playerLinAcc = 0.0;
var playerLinVel = 0.0;

var steeringDir = 0;	// 1 = steering left, 0 = going straight, -1 = steering right
var maxSteering = 40;	// max steering angle in degree

// running dynamic coefficients
var sAT = 0.5;
var mAT = 2.0;
var ATur = 3.0;
var ATdr = 1.0;
var sBT = 0.2;
var mBT = 0.9;
var BTur = 5.0;
var BTdr = 5.5;
var Tfric = Math.log(0.05);
var sAS = 0.1;	// Not used yet
var mAS = 108.0;
var ASur = 1.0;	// Not used yet
var ASdr = 0.5;	// Not used yet


var fov = 70;
var aspectRatio;

// camera visibility margins
var lineMargin = 1 / Math.sqrt(2);
var neighborMargin = 1;

var lookRadius = 1.0;
var deltaLookRadius = 0.0;

let vx = 0, vy = 0, vz = 0;
let rvx = 0, rvy = 0, rvz = 0;
let theta = 0, psi = 0;

// camera orientation variation for first-person view
var deltaCamAngle_1 = 0.0;
var deltaCamElevation_1 = 0.0;

// camera orientation variation for third-person view
var deltaCamAngle_2 = 0.0;
var deltaCamElevation_2 = 0.0;

var camVel = [0.0, 0.0, 0.0];

var carIndex = 0;


var roadScale = 15.0;
var roadDistance = roadScale * 2.291;
var sidewalkWidth = roadDistance * 0.25;


// objects in the scene
let sceneObjects = [];

var redObj = ['object/red.obj'];

var redAsset;

var assetsObj = [
    'object/flower.obj',
    'object/plant.obj',
    'object/rock1.obj',
    'object/rock2.obj',
    'object/rock3.obj',
    'object/tree1.obj',
    'object/tree2.obj',
    'object/tree3.obj',
    'object/tree4.obj',
    'object/smallrock.obj'
];

var texture = [
    'texture/texture_birb.png',
    'texture/Texture_01.jpg',
    'texture/grass-pattern.jpg'
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

var easterEggPresses = 0