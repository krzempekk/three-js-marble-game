const loadObject = (filePath) => {
  return new Promise((resolve, reject) => {
    new THREE.ObjectLoader().load(filePath, (object) => {
      resolve(object);
    });
  });
};

const getMaze = (gridSize) => {
  let obstacles = [];
  for (let i = 1; i <= gridSize; i++) {
    for (let j = 1; j <= gridSize; j++) {
      if (i !== gridSize) {
        obstacles.push([i, j, "v"]);
      }
      if (j !== gridSize) {
        obstacles.push([i, j, "h"]);
      }
    }
  }

  const traverse = (node) => {
    node.visited = true;
    // console.log(node.i, node.j);
    while (true) {
      const unvisitedNeighbors = node.neighbors.filter(
        (neighbor) => !neighbor.visited
      );
      const neighborsCount = unvisitedNeighbors.length;
      if (neighborsCount === 0) break;
      const neighbor =
        unvisitedNeighbors[Math.floor(Math.random() * neighborsCount)];

      const deltaI = neighbor.i - node.i;
      const deltaJ = neighbor.j - node.j;

      console.log(deltaI, deltaJ);

      if (deltaI > 0) {
        obstacles = obstacles.filter(
          ([i, j, type]) => !(i === node.i && j === node.j && type === "v")
        );
      } else if (deltaI < 0) {
        obstacles = obstacles.filter(
          ([i, j, type]) => !(i === neighbor.i && j === node.j && type === "v")
        );
      }

      if (deltaJ > 0) {
        obstacles = obstacles.filter(
          ([i, j, type]) => !(i === node.i && j === node.j && type === "h")
        );
      } else if (deltaJ < 0) {
        obstacles = obstacles.filter(
          ([i, j, type]) => !(i === node.i && j === neighbor.j && type === "h")
        );
      }

      traverse(neighbor);
    }
  };

  const nodes = [];

  for (let i = 1; i <= gridSize; i++) {
    nodes.push([]);
    for (let j = 1; j <= gridSize; j++) {
      nodes[i - 1].push({ i, j, neighbors: [] });
    }
  }

  for (let i = 1; i <= gridSize; i++) {
    for (let j = 1; j <= gridSize; j++) {
      if (i !== 1) {
        nodes[i - 1][j - 1].neighbors.push(nodes[i - 2][j - 1]);
      }
      if (i !== gridSize) {
        nodes[i - 1][j - 1].neighbors.push(nodes[i][j - 1]);
      }
      if (j !== 1) {
        nodes[i - 1][j - 1].neighbors.push(nodes[i - 1][j - 2]);
      }
      if (j !== gridSize) {
        nodes[i - 1][j - 1].neighbors.push(nodes[i - 1][j]);
      }
    }
  }

  const startNode = nodes[0][0];
  startNode.visited = true;
  traverse(startNode);
  console.log(nodes);

  return obstacles;
};

window.loadLevel = async (configFilePath, debugMode) => {
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

  const levelWidth = 50;
  const levelHeight = 1;
  const wallHeight = 3;
  const wallWidth = 1;
  const gridSize = 6;

  const level = new THREE.Group();
  scene.add(level);

  const floor = new THREE.Mesh(
    new THREE.BoxBufferGeometry(levelWidth, levelHeight, levelWidth),
    new THREE.MeshStandardMaterial({ color: 0x186730 })
  );
  floor.position.y = -0.5 * levelHeight;
  physics.add.existing(floor, { collisionFlags: 2 });
  level.add(floor);

  const addObstacle = (x, z, isHorizontal) => {
    const width = isHorizontal ? levelWidth / gridSize : wallWidth;
    const depth = isHorizontal ? wallWidth : levelWidth / gridSize;

    const obstacle = new THREE.Mesh(
      new THREE.BoxBufferGeometry(width, wallHeight, depth),
      new THREE.MeshStandardMaterial({ color: 0xffae00 })
    );
    obstacle.position.x = x - 0.5 * obstacle.geometry.parameters.width;
    obstacle.position.y = 0.5 * obstacle.geometry.parameters.height;
    obstacle.position.z = z - 0.5 * obstacle.geometry.parameters.depth;

    physics.add.existing(obstacle, { collisionFlags: 2 });
    level.add(obstacle);
  };

  const addObstacleAt = (i, j, isHorizontal) => {
    const x = -0.5 * levelWidth + i * (levelWidth / gridSize);
    const z = -0.5 * levelWidth + j * (levelWidth / gridSize);

    addObstacle(x, z, isHorizontal);
  };

  const gem = await loadObject("./assets/gem.json");

  const addGemAt = (i, j) => {
    const x = -0.5 * levelWidth + (i - 0.5) * (levelWidth / gridSize);
    const z = -0.5 * levelWidth + (j - 0.5) * (levelWidth / gridSize);

    const newGem = gem.clone();

    newGem.position.x = x;
    newGem.position.z = z;
    level.add(newGem);
    physics.add.existing(newGem, { collisionFlags: 2, shape: "hacd" });
  };

  const getScenePosition = (i, j, height) => {
    const x = -0.5 * levelWidth + (i - 0.5) * (levelWidth / gridSize);
    const z = -0.5 * levelWidth + (j - 0.5) * (levelWidth / gridSize);

    return new THREE.Vector3(x, height, z);
  };

  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  let initialBallPosition = getScenePosition(
    randomNumber(1, gridSize),
    randomNumber(1, gridSize),
    10
  );
  let starsCount = 0;

  const obstacles = getMaze(gridSize);

  obstacles.forEach(([i, j, type]) => addObstacleAt(i, j, type === "h"));

  const stars = [];
  for (let i = 0; i < 10; i++) {
    stars.push([randomNumber(1, gridSize), randomNumber(1, gridSize)]);
  }

  stars.forEach(([i, j]) => {
    addGemAt(i, j);
    starsCount++;
  });

  const flag = await loadObject("./assets/flag.json");
  const flagPosition = getScenePosition(1, 4, 0);
  flag.position.x = flagPosition.x;
  flag.position.y = flagPosition.y;
  flag.position.z = flagPosition.z;
  level.add(flag);

  physics.add.existing(flag, {
    compound: [
      {
        shape: "box",
        width: 1.5,
        height: 1.5,
        depth: 4.5,
        z: 2,
        collisionFlags: 2,
      },
    ],
  });
  flag.body.setCollisionFlags(2);

  return { scene, physics, level, initialBallPosition, starsCount };
};
