const { AmmoPhysics, PhysicsLoader } = ENABLE3D;

const MainScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 40);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const DPR = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(2, DPR));

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x080820, 1));
  // scene.add(new THREE.AmbientLight(0x666666));
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(-25, 20, -20);
  // light.position.multiplyScalar(1.3);
  scene.add(light);

  const physics = new AmmoPhysics(scene);
  physics.debug.enable(true);

  const { factory } = physics;

  const groundGeometry = new THREE.BoxGeometry(20, 20, 1);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x006daa });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.set(0, -5, 0);
  ground.rotateX(Math.PI / 2);

  // scene.add(ground);
  // physics.add.existing(ground, { collisionFlags: 2 });

  // const loader = new THREE.FBXLoader();
  // "./BlockPack/Assets/FBX/snow.fbx"
  // "./SkatePark/FBX/Ledge_Block__LRG_G.fbx"
  // loader.load("./Bread.fbx", (model) => {
  //   model.children[0].scale.set(2, 2, 2);
  //
  //   scene.add(model);
  //   physics.add.existing(model.children[0], {
  //     collisionFlags: 0,
  //     shape: "hacd",
  //   });
  //
  //   model.children[0].rotation.set(-Math.PI / 2, 0, 0);
  //   model.children[0].body.needUpdate = true;
  //
  //   console.log(model);
  // });

  let greenSphere = null;

  const objectLoader = new THREE.ObjectLoader();
  let platform;
  objectLoader.load("./platform_stars.json", (model) => {
    platform = model;
    scene.add(model);
    // model.rotation.set(Math.PI / 8, 0, 0);

    model.children.forEach((child) => {
      if (child.name === "flag") {
        physics.add.existing(child, {
          name: "star",
          compound: [
            {
              shape: "box",
              width: 1.5,
              height: 4.5,
              depth: 1.5,
              y: 2,
              collisionFlags: 2,
            },
          ],
        });
        child.body.setCollisionFlags(2);
      } else if (child.name === "startingPosition") {
        physics.add.existing(child, { collisionFlags: 4 });

        greenSphere = factory.addSphere(
          {
            x: child.position.x,
            y: child.position.y,
            z: child.position.z,
            mass: 5,
          },
          { lambert: { color: 0x00ff00 } }
        );
        // once the object is created, you can add physics to it
        physics.add.existing(greenSphere);
        greenSphere.body.setFriction(0.8);
        greenSphere.body.setGravity(0, -30, 0);

        greenSphere.body.on.collision((otherObject, event) => {
          if (otherObject.name === "flag") {
            console.log("you win!");
          } else if (otherObject.name === "star") {
            console.log("here you are, my secret star");
            physics.destroy(otherObject);
            console.log(otherObject);
          }
        });
      } else if (child.name === "star") {
        physics.add.existing(child, {
          compound: [
            {
              shape: "box",
              width: 1.5,
              height: 1.5,
              depth: 0.75,
            },
          ],
        });
        child.body.setCollisionFlags(2);
      } else {
        physics.add.existing(child, { collisionFlags: 2 });
      }

      // child.body.setFriction(0.8);
    });

    // model.children.forEach((child) => {
    //   physics.add.existing(child, {
    //     collisionFlags: 2,
    //     shape: "hacd",
    //   });
    // });

    // model.body.needUpdate = true;
    // model.children.forEach((child) => (child.body.needUpdate = true));

    console.log(model);
  });

  const clock = new THREE.Clock();

  let controlStarted = false;
  let cameraRotation = 0;
  let cameraPosition = 0;
  let initialMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  const teleport = () => {
    // set body to be kinematic
    greenSphere.body.setCollisionFlags(2);

    // set the new position
    greenSphere.position.set(-11, 10, 10);
    greenSphere.body.needUpdate = true;

    // this will run only on the next update if body.needUpdate = true
    greenSphere.body.once.update(() => {
      // set body back to dynamic
      greenSphere.body.setCollisionFlags(0);

      // if you do not reset the velocity and angularVelocity, the object will keep it
      greenSphere.body.setVelocity(0, 0, 0);
      greenSphere.body.setAngularVelocity(0, 0, 0);
    });
  };

  const animate = () => {
    if (cameraRotation !== 0) {
      cameraPosition += cameraRotation * 0.05;
      cameraRotation = 0;
    }

    if (greenSphere) {
      camera.position.set(
        greenSphere.position.x + 10 * Math.sin(cameraPosition),
        greenSphere.position.y + 10,
        greenSphere.position.z + 10 * Math.cos(cameraPosition)
      );
      camera.lookAt(greenSphere.position);
    }

    const MAX_ANGLE = Math.PI / 12;

    const correctToMaxAngle = () => {
      if (platform.rotation.z > MAX_ANGLE) platform.rotation.z = MAX_ANGLE;
      if (platform.rotation.z < -MAX_ANGLE) platform.rotation.z = -MAX_ANGLE;
      if (platform.rotation.x > MAX_ANGLE) platform.rotation.x = MAX_ANGLE;
      if (platform.rotation.x < -MAX_ANGLE) platform.rotation.x = -MAX_ANGLE;
    };

    if (platform) {
      // platform.rotation.x -= 0.01;

      // const rotationVector = new THREE.Vector3(1, 0, 1).normalize();
      // const perpendicularRotationVector = rotationVector
      //   .clone()
      //   .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

      // platform.rotateOnAxis(rotationVector, 0.01);
      // platform.rotateOnAxis(perpendicularRotationVector, 0.01);

      if (controlStarted) {
        const maxDelta = 0.2;

        let deltaX = -(mousePos.x - initialMousePos.x) / 2000;
        let deltaY = (mousePos.y - initialMousePos.y) / 2000;

        if (deltaX > maxDelta) deltaX = maxDelta;
        if (deltaX < -maxDelta) deltaX = -maxDelta;
        if (deltaY > maxDelta) deltaY = maxDelta;
        if (deltaY < -maxDelta) deltaY = -maxDelta;

        const rotationVector = new THREE.Vector3(
          10 * Math.sin(cameraPosition),
          0,
          10 * Math.cos(cameraPosition)
        ).normalize();
        const perpendicularRotationVector = rotationVector
          .clone()
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

        // console.log(deltaX, deltaY);

        platform.rotation.set(0, 0, 0);
        platform.rotateOnAxis(rotationVector, deltaX);
        platform.rotateOnAxis(perpendicularRotationVector, deltaY);

        // platform.rotation.z += deltaX / 1e5;
        // platform.rotation.x += deltaY / 1e5;

        correctToMaxAngle();
      }

      platform.children.forEach((child) => {
        if (child.body) {
          child.body.needUpdate = true;
        }
      });
    }

    if (greenSphere && greenSphere.position.y < -30) {
      console.log("game lost");
      teleport();
    }

    physics.update(clock.getDelta() * 1000);
    physics.updateDebugger();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  document.addEventListener("keydown", (e) => {
    console.log(e.key);
    switch (e.key) {
      case "s":
        controlStarted = !controlStarted;
        break;
      case "a":
        cameraRotation = 1;
        break;
      case "d":
        cameraRotation = -1;
        break;
    }
  });

  document.addEventListener("mousemove", (e) => {
    mousePos = { x: e.screenX, y: e.screenY };
  });

  requestAnimationFrame(animate);
};

PhysicsLoader("./lib", () => MainScene());
