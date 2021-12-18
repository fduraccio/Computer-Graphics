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
    backgroundLayer1.src = "/init/sky.png";
    const backgroundLayer2 = new Image()
    backgroundLayer2.src = "/init/hills.png";
    const backgroundLayer3 = new Image()
    backgroundLayer3.src = "/init/moutains.png";
    const backgroundLayer4 = new Image()
    backgroundLayer4.src = "/init/ground.png";
    const backgroundLayer5 = new Image()
    backgroundLayer5.src = "/init/tree1.png";
    const backgroundLayer6 = new Image()
    backgroundLayer6.src = "/init/tree2.png";
    const backgroundLayer7 = new Image()
    backgroundLayer7.src = "/init/snowtree1.png";
    const backgroundLayer8 = new Image()
    backgroundLayer8.src = "/init/snowtree2.png";
    const backgroundLayer9 = new Image()
    backgroundLayer9.src = "/init/snow.png";


    let x = 0;
    let x2 = 1024
    let x3 = 0;
    let x4 = 1024

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(backgroundLayer1, 0, 0, 1024, 400, 0, 0, 2000, 550);

        ctx.drawImage(backgroundLayer3, x, 0, 1024, 400, 0, 80, 2000, 550);
        ctx.drawImage(backgroundLayer3, x2, 0, 1024, 400, 0, 80, 2000, 550);

        ctx.drawImage(backgroundLayer2, x, 0, 1024, 400, 0, 500, 2000, 550);
        ctx.drawImage(backgroundLayer2, x2, 0, 1024, 400, 0, 500, 2000, 550);

        ctx.drawImage(backgroundLayer4, x, 0, 1024, 400, 0, 600, 2000, 550);
        ctx.drawImage(backgroundLayer4, x2, 0, 1024, 400, 0, 600, 2000, 550);

        ctx.drawImage(backgroundLayer4, x, 0, 1024, 400, 0, 600, 2000, 550);
        ctx.drawImage(backgroundLayer4, x2, 0, 1024, 400, 0, 600, 2000, 550);

        ctx.drawImage(backgroundLayer5, x, 0, 1024, 400, -500, 350, 2000, 550);
        ctx.drawImage(backgroundLayer5, x2, 0, 1024, 400, -500, 350, 2000, 550);

        ctx.drawImage(backgroundLayer6, x, 0, 1024, 400, 0, 105, 2000, 550);
        ctx.drawImage(backgroundLayer6, x2, 0, 1024, 400, 0, 105, 2000, 550);

        ctx.drawImage(backgroundLayer7, x, 0, 1024, 400, -200, 450, 2000, 550);
        ctx.drawImage(backgroundLayer7, x2, 0, 1024, 400, -200, 450, 2000, 550);

        // ctx.drawImage(backgroundLayer8, x, 0, 1024, 400, 100, 450, 2000, 550);
        // ctx.drawImage(backgroundLayer8, x2, 0, 1024, 400, 100, 450, 2000, 550);

        ctx.drawImage(backgroundLayer9, x3, 0, 1024, 400, 0, 0, 2000, 550);
        ctx.drawImage(backgroundLayer9, x4, 0, 1024, 400, 0, 0, 2000, 550);


        if (x < -1024) x = 1024 + x2 - gameSpeed
        else x -= gameSpeed
        if (x2 < -1024) x2 = 1024 + x - gameSpeed
        else x2 -= gameSpeed
        if (x3 < -1024) x3 = 1024 + x4 - gameSpeed - 1
        else x3 -= gameSpeed - 1
        if (x4 < -1024) x4 = 1024 + x3 - gameSpeed - 1
        else x4 -= gameSpeed - 1


        requestAnimationFrame(animate)
    }

    animate();

}