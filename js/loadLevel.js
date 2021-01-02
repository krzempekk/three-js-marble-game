window.loadLevel = (configFilePath, debugMode) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const physics = new AmmoPhysics(scene);
  if (debugMode) {
    physics.debug.enable(true);
  }

  scene.add(new THREE.HemisphereLight(0xffffff, 0x080820, 1));
  // scene.add(new THREE.AmbientLight(0x666666));
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(-25, 20, -20);
  // light.position.multiplyScalar(1.3);
  scene.add(light);

  const objectLoader = new THREE.ObjectLoader();
  const { factory } = physics;

  return new Promise((resolve, reject) => {
    objectLoader.load(configFilePath, (level) => {
      let initialBallPosition = null,
        starsCount = 0;

      scene.add(level);

      level.children.forEach((child) => {
        switch (child.name) {
          case "flag":
            physics.add.existing(child, {
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
            break;
          case "startingPosition":
            physics.add.existing(child, { collisionFlags: 6 });

            initialBallPosition = new THREE.Vector3(
              child.position.x,
              child.position.y,
              child.position.z
            );
            break;
          case "star":
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
            starsCount++;
            break;
          case "wall":
            child.visible = false;
            physics.add.existing(child, { collisionFlags: 6 });
          default:
            if (child.name !== "floor") {
              physics.add.existing(child, { collisionFlags: 2 });
            }
        }
      });

      const floorComponents = level.children.filter(
        (child) => child.name === "floor"
      );

      console.log(floorComponents);

      physics.add.existing(floorComponents[0], {
        compound: floorComponents.map((component) => ({
          shape: "box",
          width: component.geometry.parameters.width,
          height: component.geometry.parameters.height,
          depth: component.geometry.parameters.depth,
          x: component.position.x - floorComponents[0].position.x,
          y: component.position.y - floorComponents[0].position.y,
          z: component.position.z - floorComponents[0].position.z,
        })),
      });

      floorComponents[0].body.setCollisionFlags(2);

      resolve({ scene, physics, level, initialBallPosition, starsCount });
    });
  });
};
