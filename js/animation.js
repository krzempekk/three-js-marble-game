const teleport = (object, location) => {
  // set body to be kinematic
  object.body.setCollisionFlags(2);

  // set the new position
  console.log(location);
  object.position.set(location.x, location.y, location.z);
  object.body.needUpdate = true;

  // this will run only on the next update if body.needUpdate = true
  object.body.once.update(() => {
    // set body back to dynamic
    object.body.setCollisionFlags(0);

    // if you do not reset the velocity and angularVelocity, the object will keep it
    object.body.setVelocity(0, 0, 0);
    object.body.setAngularVelocity(0, 0, 0);
  });
};

const limitToRange = (number, min, max) => Math.min(Math.max(number, min), max);

window.getAnimationFunction = (
  controlsState,
  gameState,
  camera,
  ball,
  level
) => () => {
  const MAX_ANGLE = Math.PI / 12;
  const MAX_DELTA = 0.2;
  const CAMERA_ROTATION_SPEED = 0.07;
  const CAMERA_BALL_RADIUS = 10;
  const CAMERA_BALL_HEIGHT = 10;
  const BALL_LOSE_HEIGHT = -30;

  const {
    cameraRotationDirection,
    currentMousePosition,
    originMousePosition,
  } = controlsState;

  const { gameStarted, initialBallPosition } = gameState;

  const updateCamera = () => {
    if (cameraRotationDirection !== 0) {
      controlsState.cameraAngle +=
        cameraRotationDirection * CAMERA_ROTATION_SPEED;
      controlsState.cameraRotationDirection = 0;
    }

    camera.position.set(
      ball.position.x +
        CAMERA_BALL_RADIUS * Math.sin(controlsState.cameraAngle),
      ball.position.y + CAMERA_BALL_HEIGHT,
      ball.position.z + CAMERA_BALL_RADIUS * Math.cos(controlsState.cameraAngle)
    );
    camera.lookAt(ball.position);
  };

  const getDelta = () => {
    let deltaX = -(currentMousePosition.x - originMousePosition.x) / 2000;
    let deltaY = (currentMousePosition.y - originMousePosition.y) / 2000;

    deltaX = limitToRange(deltaX, -MAX_DELTA, MAX_DELTA);
    deltaY = limitToRange(deltaY, -MAX_DELTA, MAX_DELTA);

    return { x: deltaX, y: deltaY };
  };

  const getRotationVectors = () => {
    const vectorX = new THREE.Vector3(
      camera.position.x - ball.position.x,
      0,
      camera.position.z - ball.position.z
    ).normalize();
    const vectorY = vectorX
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

    return { vectorX, vectorY };
  };

  updateCamera();

  if (gameStarted) {
    const { x: deltaX, y: deltaY } = getDelta();

    const { vectorX, vectorY } = getRotationVectors();

    level.rotation.set(0, 0, 0);
    level.rotateOnAxis(vectorX, deltaX);
    level.rotateOnAxis(vectorY, deltaY);

    level.rotation.z = limitToRange(level.rotation.z, -MAX_ANGLE, MAX_ANGLE);
    level.rotation.x = limitToRange(level.rotation.x, -MAX_ANGLE, MAX_ANGLE);

    // if (ball.body.velocity.y > 5) {
    //   console.log(ball.body.velocity);
    //   console.log("force");
    //   ball.body.applyForceY(-2);
    // }

    // ball.body.velocity = {
    //   x: limitToRange(ball.body.velocity.x, -5, 5),
    //   y: limitToRange(ball.body.velocity.y, -5, 5),
    //   z: limitToRange(ball.body.velocity.z, -5, 5),
    // };
    // console.log(ball.body.velocity);
  }

  level.children.forEach((child) => {
    if (child.body) {
      child.body.needUpdate = true;
    }
  });

  if (ball.position.y < BALL_LOSE_HEIGHT) {
    console.log("game lost");
    teleport(ball, initialBallPosition);
  }
};
