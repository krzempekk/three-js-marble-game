const { AmmoPhysics, PhysicsLoader } = ENABLE3D;

const setupBall = (physics, gameState) => {
  const { initialBallPosition } = gameState;

  const ball = physics.factory.addSphere(
    {
      x: initialBallPosition.x,
      y: initialBallPosition.y,
      z: initialBallPosition.z,
      mass: 5,
    },
    {
      custom: new THREE.MeshPhongMaterial({
        color: 0x640000,
        shininess: 100,
      }),
    }
  );

  physics.add.existing(ball);
  ball.body.setFriction(0.5);
  ball.body.setGravity(0, -30, 0);

  // Enable CCD if the object moves more than 1 meter in one simulation frame
  ball.body.setCcdMotionThreshold(0.05);

  // Set the radius of the embedded sphere such that it is smaller than the object
  ball.body.setCcdSweptSphereRadius(0.2);

  ball.body.on.collision((otherObject, event) => {
    if (
      otherObject.name === "flag" &&
      !gameState.nextLevel &&
      gameState.starsLeft === 0
    ) {
      gameState.nextLevel = true;
    } else if (
      otherObject.name === "gem" &&
      otherObject.visible &&
      event === "start"
    ) {
      otherObject.visible = false;
      otherObject.body.setCollisionFlags(6);
      gameState.starsLeft--;
      gameStateUI.decrementStarCount();
    }
  });

  ball.body.setBounciness(-10);

  return ball;
};

const MainScene = async () => {
  const { renderer, camera } = setupRenderer();

  const levelPath = "./level1.json";

  let levelConfig = null;

  const gameState = {
    gameStarted: false,
    nextLevel: false,
    initialBallPosition: null,
    starCount: 0,
    starsLeft: 0,
  };

  const controlsState = {
    cameraAngle: 0,
    cameraRotationDirection: 0,
    originMousePosition: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },
    currentMousePosition: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },
  };

  const setupLevel = async (levelPath) => {
    const {
      level,
      initialBallPosition,
      scene,
      physics,
      starsCount,
    } = await loadLevel(levelPath, false);

    controlsState.cameraAngle = 0;
    gameState.initialBallPosition = initialBallPosition;

    const ball = setupBall(physics, gameState);

    const animationFunction = getAnimationFunction(
      controlsState,
      gameState,
      camera,
      ball,
      level
    );

    const timerInterval = setInterval(() => {
      gameStateUI.addSecond();
    }, 1000);

    gameState.starCount = starsCount;
    gameState.starsLeft = starsCount;
    gameStateUI.setStarCount(starsCount);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("PurplyBlueSky.png", () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt;
    });

    levelConfig = {
      level,
      scene,
      physics,
      ball,
      animationFunction,
      timerInterval,
    };
  };

  setupControls(controlsState, gameState);

  await setupLevel(levelPath);

  const clock = new THREE.Clock();

  const animate = async () => {
    const { scene, physics, animationFunction } = levelConfig;

    if (gameState.nextLevel) {
      clearInterval(levelConfig.timerInterval);
      await setupLevel(levelPath);

      gameStateUI.resetTime();
      gameState.nextLevel = false;
    }

    animationFunction();
    renderer.render(scene, camera);
    physics.update(clock.getDelta() * 1000);
    physics.updateDebugger();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

PhysicsLoader("./lib", () => MainScene());
