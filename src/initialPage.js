/**
 * Sets and handle the moving background in the initial page - Woodland environment
 */
function initialPage() {
    let canvas = document.createElement("canvas");
    let cvContainer = document.getElementById("cv-container");

    cvContainer.hidden = false;
    cvContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gameSpeed = 2;

    const backgroundLayer1 = new Image()
    backgroundLayer1.src = "/init/woodland/sky.png";
    const backgroundLayer2 = new Image()
    backgroundLayer2.src = "/init/woodland/hill1.png";
    const backgroundLayer3 = new Image()
    backgroundLayer3.src = "/init/woodland/moutains.png";
    const backgroundLayer4 = new Image()
    backgroundLayer4.src = "/init/woodland/ground.png";
    const backgroundLayer5 = new Image()
    backgroundLayer5.src = "/init/woodland/bushes.png";
    const backgroundLayer6 = new Image()
    backgroundLayer6.src = "/init/woodland/hill2.png";
    const backgroundLayer7 = new Image()
    backgroundLayer7.src = "/init/woodland/rocks.png";
    const backgroundLayer8 = new Image()
    backgroundLayer8.src = "/init/woodland/tree1.png";
    const backgroundLayer9 = new Image()
    backgroundLayer9.src = "/init/woodland/tree2.png";
    const backgroundLayer10 = new Image()
    backgroundLayer10.src = "/init/woodland/cloud.png";

    class Layer {

        constructor(image, speedModifier, x, y) {
            this.x = 0;
            this.y = 0;
            this.width = 1024;
            this.height = 400;
            this.x2 = 1024;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * speedModifier;
        }

        update() {
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width) {
                this.x = this.width + this.x2 - this.speed;
            }
            if (this.x2 <= -this.width) {
                this.x2 = this.width + this.x - this.speed;
            }
            this.x = Math.floor(this.x - this.speed)
            this.x2 = Math.floor(this.x2 - this.speed)
        }

        draw(posx, posy, width, height) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height, posx, posy, width, height)
            ctx.drawImage(this.image, this.x2, this.y, this.width, this.height, posx, posy, width, height)
        }

    }

    const layer1 = new Layer(backgroundLayer1, 0.5);
    const layer3 = new Layer(backgroundLayer3, 0.5);
    const layer2 = new Layer(backgroundLayer2, 0.75);
    const layer4 = new Layer(backgroundLayer4, 1.25);
    const layer5 = new Layer(backgroundLayer5, 1.25);
    const layer6 = new Layer(backgroundLayer6, 1.0);
    const layer7 = new Layer(backgroundLayer7, 1.25);
    const layer8 = new Layer(backgroundLayer8, 0.75);
    const layer9 = new Layer(backgroundLayer9, 0.75);
    const layer10 = new Layer(backgroundLayer10, 0.25);


    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        layer1.update()
        layer2.update()
        layer3.update()
        layer4.update()
        layer5.update()
        layer6.update()
        layer7.update()
        layer8.update()
        layer9.update()
        layer10.update()

        layer1.draw(0, 0, 2000, 650)
        layer3.draw(0, 100, 2000, 650)
        layer6.draw(0, 400, 2000, 650)
        layer2.draw(0, 480, 2000, 650)

        layer5.draw(-200, 420, 2000, 650)
        layer4.draw(0, 580, 2000, 650)
        layer7.draw(0, 540, 2000, 650)
        layer8.draw(0, 350, 2000, 650)
        layer9.draw(-500, 350, 2000, 650)
        layer10.draw(0, 70, 2000, 650)



        requestAnimationFrame(animate)
    }

    animate();

}

/**
 * Sets and handle the moving background in the initial page - Winterland environment
 */
function initialPageWinter() {
    let canvas = document.createElement("canvas");
    let cvContainer = document.getElementById("cv-container");

    cvContainer.hidden = false;
    cvContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gameSpeed = 3;

    const backgroundLayer1 = new Image()
    backgroundLayer1.src = "/init/winterland/sky.png";
    const backgroundLayer2 = new Image()
    backgroundLayer2.src = "/init/winterland/hills.png";
    const backgroundLayer3 = new Image()
    backgroundLayer3.src = "/init/winterland/moutains.png";
    const backgroundLayer4 = new Image()
    backgroundLayer4.src = "/init/winterland/ground.png";
    const backgroundLayer5 = new Image()
    backgroundLayer5.src = "/init/winterland/tree1.png";
    const backgroundLayer6 = new Image()
    backgroundLayer6.src = "/init/winterland/tree2.png";
    const backgroundLayer7 = new Image()
    backgroundLayer7.src = "/init/winterland/snowtree1.png";
    const backgroundLayer8 = new Image()
    backgroundLayer8.src = "/init/winterland/snowtree2.png";
    const backgroundLayer9 = new Image()
    backgroundLayer9.src = "/init/winterland/snow.png";
    const backgroundLayer10 = new Image()
    backgroundLayer10.src = "/init/winterland/cloud.png";

    class Layer {

        constructor(image, speedModifier, x, y) {
            this.x = 0;
            this.y = 0;
            this.width = 1024;
            this.height = 400;
            this.x2 = 1024;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * speedModifier;
        }

        update() {
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width) {
                this.x = this.width + this.x2 - this.speed;
            }
            if (this.x2 <= -this.width) {
                this.x2 = this.width + this.x - this.speed;
            }
            this.x = Math.floor(this.x - this.speed)
            this.x2 = Math.floor(this.x2 - this.speed)
        }

        draw(posx, posy, width, height) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height, posx, posy, width, height)
            ctx.drawImage(this.image, this.x2, this.y, this.width, this.height, posx, posy, width, height)
        }

    }

    const layer1 = new Layer(backgroundLayer1, 0.75);
    const layer3 = new Layer(backgroundLayer3, 0.5);
    const layer2 = new Layer(backgroundLayer2, 0.75);
    const layer4 = new Layer(backgroundLayer4, 1.0);
    const layer5 = new Layer(backgroundLayer5, 0.75);
    const layer6 = new Layer(backgroundLayer6, 1.0);
    const layer7 = new Layer(backgroundLayer7, 0.75);
    const layer8 = new Layer(backgroundLayer8, 0.75);
    const layer9 = new Layer(backgroundLayer9, 0.25);
    const layer10 = new Layer(backgroundLayer10, 0.5);



    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        layer1.update()
        layer2.update()
        layer3.update()
        layer4.update()
        layer5.update()
        layer6.update()
        layer7.update()
        layer8.update()
        layer9.update()
        layer10.update()



        layer1.draw(0, 0, 2000, 650)
        layer10.draw(0, 20, 2000, 650)
        layer3.draw(0, 80, 2000, 650)
        layer2.draw(0, 500, 2000, 650)
        layer4.draw(0, 600, 2000, 650)
        layer5.draw(-200, 310, 2000, 650)
        layer6.draw(0, 15, 2000, 650)
        layer7.draw(-500, 450, 2000, 650)
            // layer8.draw(-100, 450, 2000, 650)
        layer9.draw(0, 0, 2000, 650)

        requestAnimationFrame(animate)
    }

    animate();

}

/**
 * Sets and handle the moving background in the initial page - Desertland environment
 */
function initialPageDesert() {
    let canvas = document.createElement("canvas");
    let cvContainer = document.getElementById("cv-container");

    cvContainer.hidden = false;
    cvContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gameSpeed = 3;

    const backgroundLayer1 = new Image()
    backgroundLayer1.src = "/init/desertland/sky.png";
    const backgroundLayer2 = new Image()
    backgroundLayer2.src = "/init/desertland/cactus1.png";
    const backgroundLayer3 = new Image()
    backgroundLayer3.src = "/init/desertland/hill.png";
    const backgroundLayer4 = new Image()
    backgroundLayer4.src = "/init/desertland/ground.png";
    const backgroundLayer5 = new Image()
    backgroundLayer5.src = "/init/desertland/cactus2.png";
    const backgroundLayer7 = new Image()
    backgroundLayer7.src = "/init/desertland/bushes.png";

    class Layer {

        constructor(image, speedModifier, x, y) {
            this.x = 0;
            this.y = 0;
            this.width = 1024;
            this.height = 400;
            this.x2 = 1024;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * speedModifier;
        }

        update() {
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width) {
                this.x = this.width + this.x2 - this.speed;
            }
            if (this.x2 <= -this.width) {
                this.x2 = this.width + this.x - this.speed;
            }
            this.x = Math.floor(this.x - this.speed)
            this.x2 = Math.floor(this.x2 - this.speed)
        }

        draw(posx, posy, width, height) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height, posx, posy, width, height)
            ctx.drawImage(this.image, this.x2, this.y, this.width, this.height, posx, posy, width, height)
        }

    }

    const layer1 = new Layer(backgroundLayer1, 0.25);
    const layer3 = new Layer(backgroundLayer3, 0.5);
    const layer2 = new Layer(backgroundLayer2, 1.0);
    const layer4 = new Layer(backgroundLayer4, 1.0);
    const layer5 = new Layer(backgroundLayer5, 1.0);
    const layer7 = new Layer(backgroundLayer7, 1);




    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        layer1.update()
        layer2.update()
        layer3.update()
        layer4.update()
        layer5.update()
        layer7.update()


        layer1.draw(0, 0, 2000, 650)
        layer3.draw(0, 300, 2000, 650)
        layer5.draw(0, 480, 2000, 650)
        layer2.draw(-500, 460, 2000, 650)
        layer4.draw(0, 590, 2000, 650)
        layer7.draw(0, 515, 2000, 650)

        requestAnimationFrame(animate)
    }

    animate();

}