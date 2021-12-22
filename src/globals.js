var shaderDir = "shaders/";

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
    'G': 71,
    'UP': 38,
    'DOWN': 40,
    'LEFT': 37,
    'RIGHT': 39,
    'L': 76,
    'R': 82,
    'V': 86,
    'X': 88,
    'Z': 90,
    'F': 70,
    'SHIFT': 16
};

var difficulty = 2;
var environment = "woodland"
var audio;
var trees;
var enableSpotLight = false;
var countInterval = 0;

//un input parte solo se è collegato a queste keys
keys = [13, 65, 87, 83, 68, 73, 70, 38, 40, 37, 39, 82, 86, 88, 90, 70, 72]

//Assets arrays
var value;

var bird,
    borderArea,
    floor,
    cloud,
    tree = [],
    winterTree = [],
    winterRock = [],
    winterPlant = [],
    snowman = [],
    desertTree = [],
    desertRock = [];

var randomPosition = [],
    randomPositionDesert = [],
    randomPositionRockDesert = [];

var rock = [],
    flower,
    i;

var enableMovement = true,
    enableFly = true;
    
var allText = []
var birdPosition,
    birdPos;
//Panel
var helpPanel,
    optionPanel,
    canvasPanel,
    mainPanel,
    winnerPanel,
    classificaPanel,
    namePlayerPanel,
    timerPanel,
    looserPanel;

var time_minutes,
    time_seconds,
    duration;



var vao = [],
    bufferLength = [],
    texture = [];

var currentTime;
var lastUpdateTime = (new Date).getTime();
var startGame;

var playerIndex = 0;
var playerLength = [];
var timeOfWinner;

var directionalLightDir = [0.0, -1.0, 0.0];
var specularColor = [1.0, 1.0, 1.0];
var specularPower = 20.0;
var spotLight;

var deltaY = 0;


var simpleCam = true;
var simpleMotion = true; //change to make to 

var distance = 8.0;
var odom_offset = 4.0;


var viewPosX = 0.0,
    viewPosY = 0.0,
    viewPosZ = 0.0;


//Parameters for Camera
var cameraX = 4.5,
    cameraY = 0.0,
    cameraZ = 10.0,
    elevation = 0.0,
    angle = 0.0;


var firstPersonView = true;

var namePlayer;

// player pose
var playerX = 0.0,
    playerY = 0.0,
    playerZ = 0.0,
    playerAngle = 0.0,
    deltaPlayerAngle = 0.0;

angle = playerAngle % 360 - 180;
//var elevation = 10.0;


var preVz = 0.0,
    playerLinAcc = 0.0,
    playerLinVel = 0.0;

var steeringDir = 0; // 1 = steering left, 0 = going straight, -1 = steering right
var maxSteering = 40; // max steering angle in degree

var directionalLightColor = [1.0, 1.0, 1.0];

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
var sAS = 0.1; // Not used yet
var mAS = 108.0;
var ASur = 1.0; // Not used yet
var ASdr = 0.5; // Not used yet


var fov = 70;
var aspectRatio;


// camera visibility margins
var lineMargin = 1 / Math.sqrt(2);
var neighborMargin = 1;

var lookRadius = 1.0;
var deltaLookRadius = 0.0;

var vx = 0,
    vy = 0,
    vz = 0,
    rvx = 0,
    rvy = 0,
    rvz = 0,
    theta = 0,
    psi = 0;

// camera orientation variation for first-person view
var deltaCamAngle = 0.0,
    deltaCamElevation = 0.0;


var choice = -1
var redAsset;

var W, V, P;
var V_old;
var collisionChecked = true;

var texture = [
    'texture/texture_birb.png',
    'texture/Texture_01.jpg',
    'texture/grass-pattern.jpg',
    'texture/grass3.png',
    'texture/cloudColour.png',
    'texture/images.jpeg',
    'texture/texture_winter.png',
    'texture/desert.png',
    'texture/desert.jpeg'

]


var assets = []

var sunRise = 0.0;
var dayLightColor = [0.6, 0.8, 0.95];
var sunsetLightColor = [1.0, 0.83, 0.44];
var darkLightColor = [0.07, 0.07, 0.12];
var skyAlpha = 1.0;
var skyColor = [0.0, 0.0, 0.0];
var ambientLightCoeff = 0.3;
var ambientLightAlpha = 0.0;

var spotLightPos1 = [0.0, 0.0, 0.0],
    spotLightDir = [0.0, -8.0, 13],
    spotLightColor = [1.0, 1.0, 1.0],
    spotLightTarget = 8.0,
    spotLightDecay = 2,
    outerCone = 30.0,
    innerCone = 20.0;

var viewMatrix,
    perspectiveMatrix;