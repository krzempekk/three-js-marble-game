window.setupRenderer = () => {
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

  new THREE.OrbitControls(camera, renderer.domElement);

  return { renderer, camera };
};
