window.setupControls = (controlsState, gameState) => {
  document.getElementById("state").style.visibility = "hidden";

  document.addEventListener("keydown", (e) => {
    console.log(e.key);
    switch (e.key) {
      case "s":
        gameState.gameStarted = !gameState.gameStarted;
        break;
      case "a":
        controlsState.cameraRotationDirection = -1;
        break;
      case "d":
        controlsState.cameraRotationDirection = 1;
        break;
    }
  });

  document.getElementById("start").addEventListener("click", (e) => {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("state").style.visibility = "initial";
    gameState.gameStarted = true;
  });

  document.addEventListener("mousemove", (e) => {
    controlsState.currentMousePosition = { x: e.screenX, y: e.screenY };
  });

  document.querySelector("canvas").addEventListener("wheel", (e) => {
    controlsState.cameraRotationDirection = e.deltaY > 0 ? 1 : -1;
  });
};

let elapsedSeconds = 0;
let currentStarCount = 0;

window.gameStateUI = {
  resetTime: () => {
    elapsedSeconds = 0;
  },
  addSecond: () => {
    elapsedSeconds++;

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    document.getElementById("timer").innerText = `${("0" + minutes).slice(
      -2
    )}:${("0" + seconds).slice(-2)}`;
  },
  setStarCount: (starCount) => {
    currentStarCount = starCount;
    document.getElementById(
      "star-counter"
    ).innerText = `${currentStarCount} stars left`;
  },
  decrementStarCount: () => {
    currentStarCount--;
    document.getElementById(
      "star-counter"
    ).innerText = `${currentStarCount} stars left`;
  },
};
