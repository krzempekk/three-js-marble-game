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
  camera.position.set(0, 10, 40);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const DPR = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(2, DPR));

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2));
  scene.add(new THREE.AmbientLight(0x666666));
  const light = new THREE.DirectionalLight(0xdfebff, 0.2);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);
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

  const objectLoader = new THREE.ObjectLoader();
  let platform;
  objectLoader.load("./platform.json", (model) => {
    platform = model;
    scene.add(model);
    // model.rotation.set(Math.PI / 8, 0, 0);

    model.children.forEach((child) => {
      physics.add.existing(child, { collisionFlags: 2 });
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

  let greenSphere = factory.addSphere(
    { x: 0, y: 10, z: 0 },
    { lambert: { color: 0x00ff00 } }
  );
  // once the object is created, you can add physics to it
  physics.add.existing(greenSphere);

  const clock = new THREE.Clock();

  let pressedKeys = [];

  const animate = () => {
    if (platform) {
      pressedKeys.forEach((key) => {
        switch (key) {
          case "w":
            platform.rotation.x -= 0.01;
            break;
          case "s":
            platform.rotation.x += 0.01;
            break;
          case "a":
            platform.rotation.z += 0.01;
            break;
          case "d":
            platform.rotation.z -= 0.01;
            break;
        }
      });
      pressedKeys = [];

      platform.children.forEach((child) => (child.body.needUpdate = true));
    }

    physics.update(clock.getDelta() * 1000);
    physics.updateDebugger();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  document.addEventListener("keyup", (e) => {
    console.log(e.key);
    pressedKeys.unshift(e.key);
  });

  document.addEventListener("keydown", (e) => {
    console.log(e.key);
    pressedKeys.push(e.key);
  });

  requestAnimationFrame(animate);
};

PhysicsLoader("./lib", () => MainScene());
