/**
 * Name: Wen Qiu
 * Date: May 1, 2019
 * Section: CSE 154 AJ
 * This is the JavaScript for the Word Master game
 */
(function() {
  "use strict";

  let timerID = null;
  let currentTime = 0;
  let playerOne = true;
  let currentPrompt = "";
  let currentWord = "";
  const PROMPTS = ["DEF", "AB"];
  window.addEventListener("load", init);

  /**
   * Initialization after the window loads. Attaches event listeners to all the
   * interactive elements
   */
  function init() {
    id("start").addEventListener("click", startGame);
    id("start-over").addEventListener("click", backToMenu);
    qs("button.player1").addEventListener("click", submit);
    qs("button.player2").addEventListener("click", challenge);
  }

  /**
   * Start the game and enter preparation stage
   */
  function startGame() {
    currentTime = 5;
    playerOne = true;
    resetCanvas();
    id("game-view").classList.remove("hidden");
    id("menu-view").classList.add("hidden");
    qs("h1").textContent = "Pick your player";
    timerID = setInterval(updatePrepTimer, 1000);
  }

  /**
   * Resets the canvas for the new game
   */
  function resetCanvas() {
    id("countdown").textContent = "Game starting in " + currentTime + " sec...";
    id("game-result").classList.add("hidden");
    let currentResponse = qs("input.player" + getCurrentPlayer());
    let currentAnswerBox = qs("#player" + getCurrentPlayer() + "-ans p");
    currentAnswerBox.textContent = "I will start first!";
    currentResponse.value = "";

    let otherResponse = qs("input.player" + getOtherPlayer());
    let otherAnswerBox = qs("#player" + getOtherPlayer() + "-ans p");
    otherAnswerBox.textContent = "";
    otherResponse.value = "";
  }

  /**
   * Gets the id of the player owning the current round
   * @return id of the player owning the current round
   */
  function getCurrentPlayer() {
    return playerOne ? 1 : 2;
  }

  /**
   * Gets the id of the opponent of the player owning the current round
   * @return id of the opponent of the player owning the current round
   */
  function getOtherPlayer() {
    return playerOne ? 2 : 1;
  }

  /**
   * Displays a random prompt on the header
   */
  function getPrompt() {
    currentPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    qs("h1").textContent = "A word that starts with " + currentPrompt;
  }

  /**
   * Updates the prep timer and display text
   */
  function updatePrepTimer() {
    currentTime--;
    id("countdown").textContent = "Game starting in " + currentTime + " sec...";
    if(currentTime === 0) {
      id("countdown").textContent = "Game start!"
      getPrompt()
      clearTimer();
      setTimeout(startRound, 1000);
    }
  }

  /**
   * Clears the running timer
   */
  function clearTimer() {
    if(timerID) {
      clearInterval(timerID);
      timerID = null;
    }
  }

  /**
   * Configures the controls for a regular round
   */
  function toggleRoundControls(){
    let currentPlayer = getCurrentPlayer();
    let otherPlayer = getOtherPlayer();
    let currentSelector = ".player" + currentPlayer;
    let otherSelector = ".player" + otherPlayer;

    qs("button" + currentSelector).disabled = false;
    qs("button" + currentSelector).textContent = "Submit";
    qs("button" + currentSelector).classList.toggle("submit", 1);
    qs("button" + currentSelector).classList.toggle("challenge", 0);
    qs("button" + currentSelector).addEventListener("click", submit);
    qs("button" + currentSelector).removeEventListener("click", challenge);
    qs("input" + currentSelector).disabled = false;

    qs("button" + otherSelector).disabled = true;
    qs("button" + otherSelector).textContent = "Challenge!";
    qs("button" + otherSelector).classList.toggle("challenge", 1);
    qs("button" + otherSelector).classList.toggle("submit", 0);
    qs("button" + otherSelector).addEventListener("click", challenge);
    qs("button" + otherSelector).removeEventListener("click", submit);
    qs("input" + otherSelector).disabled = true;
  }

  /**
   * Starts the round and enables the player controls
   */
  function startRound() {
    currentTime = 5;
    toggleRoundControls();
    qs("input.player" + getCurrentPlayer()).focus();
    updateRoundText();
    timerID = setInterval(updateRoundTimer, 1000);
  }

  /**
   * Updates the round timer. If the round timer runs out, end the game
   */
  function updateRoundTimer() {
    currentTime--;
    updateRoundText();
    if(currentTime === 0) {
      clearTimer();
      displayWinner(getOtherPlayer());
    }
  }

  /**
   * Starts the 3-second challenge timer
   */
  function startChallenge() {
    clearTimer();
    currentTime = 3;
    toggleChallengeControls();
    updateChallengeText();
    timerID = setInterval(updateChallengeTimer, 1000);
  }

  /**
   * Configures the controls for the challenge round
   */
  function toggleChallengeControls(){
    let currentPlayer = getCurrentPlayer();
    let otherPlayer = getOtherPlayer();
    let currentSelector = ".player" + currentPlayer;
    let otherSelector = ".player" + otherPlayer;

    qs("button" + currentSelector).disabled = true;
    qs("input" + currentSelector).disabled = true;

    qs("button" + otherSelector).disabled = false;
    qs("input" + otherSelector).disabled = true;
  }

  /**
   * Updates the challenge timer. If the challenge timer runs out, start the
   * next round
   */
  function updateChallengeTimer() {
    currentTime--;
    updateChallengeText();
    if(currentTime === 0) {
      clearTimer();
      playerOne = !playerOne;
      startRound();
    }
  }

  /**
   * Submits the response and starts the challenge round for the other player
   */
  function submit() {
    checkResponse();
    startChallenge();
  }

  /**
   * Judges whether the challenge is successful or not, and displays the result
   */
  function challenge() {
    // Checks if the word given by the other player is valid (API calls)
    clearTimer();
    if(currentWord === "") {
      displayWinner(getOtherPlayer());
    } else {
      displayWinner(getCurrentPlayer());
    }

  }

  /**
   * Displays the winner of the game
   * @param  {int} winner - the winner of the game, 1 or 2
   */
  function displayWinner(winner) {
    qs("#game-result p").textContent = "Player " + winner + " wins!";
    id("game-result").classList.remove("hidden");
  }

  /**
   * Checks if the response is valid, if so, displays it on the corresponding
   * answer box
   */
  function checkResponse() {
    let response = qs("input.player" + getCurrentPlayer());
    let answerBox = qs("#player" + getCurrentPlayer() + "-ans p");
    answerBox.textContent = response.value;
    currentWord = response.value;
    response.value = "";
  }

  /**
   * Updates the timer text during a regular response round
   */
  function updateRoundText() {
    id("countdown").textContent = "Player " + getCurrentPlayer() + " must answer in "
      + currentTime + " sec...";
  }

  /**
   * Updates the timer text during the challenge round
   */
  function updateChallengeText() {
    id("countdown").textContent = "Player " + getOtherPlayer() + " can challenge in "
      + currentTime + " sec...";
  }

  /**
   * Exit to menu view
   */
  function backToMenu() {
    id("menu-view").classList.remove("hidden");
    id("game-view").classList.add("hidden");
  }

  /**
   * Helper method for getting element by id
   * @param {String} elementID - the id with which the target objects are attached to
   * @return {Object} the DOM element object with the specified id
   */
  function id(elementID) {
    return document.getElementById(elementID);
  }

  /**
   * Helper method for getting an element by selector
   * @param {String} selector - the selector used to select the target elements
   * @return {Object} The first element in the DOM selected with the given selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Helper method for getting an array of elements by selector
   * @param {String} selector - the selector used to select the target elements
   * @return {Object[]} An array of elements in the DOM selected with the given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
