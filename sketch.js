const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

var engine;
var world;

var tower, towerImage, backgroundImage, cannon, angle;
var ground, cannonball;

var balls = []
var boats = []
var boatAnimation = [];
var boatSpriteSheet, boatSpriteData;

var brokenBoatAnimation = [];
var brokenBoatSpriteSheet, brokenBoatSpriteData;

var waterSplashAnimation = [];
var waterSplashSpriteSheet, waterSplashSpriteData;

var isGameOver = false;
var isLaughing = false;
var backgroundMusic, waterSound, cannonExplosion, pirateLaughSound;

function preload() {

  backgroundImage = loadImage("assets/background.gif");
  towerImage = loadImage("assets/tower.png");

  boatSpriteSheet = loadImage("assets/boat/boat.png");
  boatSpriteData = loadJSON("assets/boat/boat.json");
  
  brokenBoatSpriteSheet = loadImage("assets/boat/broken_boat.png")
  brokenBoatSpriteData = loadJSON("assets/boat/broken_boat.json")

  waterSplashSpriteSheet = loadImage("assets/water_splash/water_splash.png")
  waterSplashSpriteData = loadJSON("assets/water_splash/water_splash.json")
  
  backgroundMusic = loadSound("assets/background_music.mp3")
  waterSound = loadSound("assets/cannon_water.mp3")
  cannonExplosion = loadSound("assets/cannon_explosion.mp3")
  pirateLaughSound = loadSound("assets/pirate_laugh.mp3")
}

function setup() {
  canvas = createCanvas(1200, 600);

  engine = Engine.create()
  world = engine.world

  var options = {
    isStatic: true
  }
  ground = Bodies.rectangle(750, 599, 1500, 1, options);
  World.add(world, ground)

  tower = Bodies.rectangle(160, 350, 160, 310, options);
  World.add(world, tower)

  angleMode(DEGREES)
  angle = 15
  cannon = new Cannon(180, 110, 130, 100, angle);

  rectMode(CENTER);

  var boatFrames = boatSpriteData.frames;
  for(var i =0; i< boatFrames.length; i++){
    var pos = boatFrames[i].position;
    var img = boatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }
    
  var brokenBoatFrames = brokenBoatSpriteData.frames;
  for(var i=0; i<brokenBoatFrames.length; i++){
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpriteSheet.get(pos.x,pos.y,pos.w,pos.h)
    brokenBoatAnimation.push(img);
  }
  
  var waterSplashFrames = waterSplashSpriteData.frames;
  for(var i=0; i<waterSplashFrames.length; i++){
    var pos = waterSplashFrames[i].position
    var img = waterSplashSpriteSheet.get(pos.x,pos.y,pos.w,pos.h)
    waterSplashAnimation.push(img);
  }

}

function draw() {
  image(backgroundImage, 0, 0, 1200, 600);

  if(!backgroundMusic.isPlaying()){
    backgroundMusic.play();
    backgroundMusic.setVolume(0.2);
  }
  
  Engine.update(engine);

  rect(ground.position.x, ground.position.y, 1500, 1)

  push();
  imageMode(CENTER)
  image(towerImage, tower.position.x, tower.position.y, 160, 310)
  pop();

  cannon.display()
  for (var b = 0; b < balls.length; b++) {
    showCannonballs(balls[b],b);
    collisionWithBoat(b)
  }
  showBoats()
}


function keyReleased() {

  if (keyCode == DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    cannonExplosion.play()
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    cannonball = new CannonBall(cannon.x, cannon.y);
    cannonball.trajectory = [];
    Matter.Body.setAngle(cannonball.body, cannon.angle)
    balls.push(cannonball)
  }

}

function showCannonballs(ball,index) {
  if (ball) {
    ball.display()
    ball.animate()
    if(ball.body.position.x > width || ball.body.position.y >= height-50){
      ball.remove(index)
      waterSound.play()
      waterSound.setVolume(0.2);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (boats[boats.length - 1] === undefined || boats[boats.length - 1].body.position.x < width - 300) {
      var positions = [-40, -70, -20, -60]
      var t = random(positions)
      var boat = new Boat(width, height - 100, 170, 170, t, boatAnimation)
      boats.push(boat);
    }
    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        })
        boats[i].display()
        boats[i].animate()
       
        var e = Matter.SAT.collides(this.tower, boats[i].body)
        if(e.collided && !boats[i].isBroken){
          if(!isLaughing && !pirateLaughSound.isPlaying()){
            pirateLaughSound.play()
            isLaughing = true
          }
          isGameOver = true;
          gameOver()
          
        }

      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation)
    boats.push(boat);
  }

}

function collisionWithBoat(index) {
  for (var z = 0; z < boats.length; z++) {
    if (boats[z] != undefined && balls[index] != undefined) {
      var h = Matter.SAT.collides(balls[index].body, boats[z].body)
      if (h.collided) {
        boats[z].remove(z)
        World.remove(world, balls[index].body)
        delete balls[index]
      }
    }
  }

}

function gameOver(){
  swal({
    title: `Game Over!!!`,
    text: 'I Expected More..',
    imageUrl: 'https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png',
    imageSize: '150x150',
    confirmButtonText: "Play Again"
  }, (isConfirm)=>{
    if(isConfirm){
      location.reload();
    }
  })
}