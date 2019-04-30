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
  const BASE_URL = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
  const API_KEY = "?key=e3135f72-2567-48c9-a6e6-ae4a3ef6b4b9";
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
    qs("input.player1").addEventListener("keyup", function(event) {
      const keyName = event.key;
      if (keyName === "Enter") {
        submit();
      }
    });
    qs("input.player2").addEventListener("keyup", function(event) {
      const keyName = event.key;
      if (keyName === "Enter") {
        submit();
      }
    });
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
    id("start-over").classList.add("hidden");

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
   * @return {int} id of the player owning the current round
   */
  function getCurrentPlayer() {
    return playerOne ? 1 : 2;
  }

  /**
   * Gets the id of the opponent of the player owning the current round
   * @return {int} id of the opponent of the player owning the current round
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
      id("countdown").textContent = "Game start!";
      getPrompt();
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
      let timeText = document.createElement("p");
      timeText.textContent = "Player " + getCurrentPlayer() + " ran out of time!";
      id("game-result").appendChild(timeText);
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
    if(currentWord.toUpperCase().startsWith(currentPrompt)) {
      getAjaxData();
    } else {
      displayWinner(getOtherPlayer());
      let result = document.createElement("p");
      result.textContent = currentWord+ " does not start with "
        + currentPrompt;
      id("game-result").appendChild(result);
    }
  }

  /**
   * Displays the winner of the game
   * @param  {int} winner - the winner of the game, 1 or 2
   */
  function displayWinner(winner) {
    clearTimer();
    id("game-result").innerHTML = "";
    let result = document.createElement("p");
    result.textContent = "Player " + winner + " wins!";
    id("game-result").appendChild(result);
    id("game-result").classList.remove("hidden");
    id("start-over").classList.remove("hidden");
  }

  /**
   * Checks if the response is valid, if so, displays it on the corresponding
   * answer box
   */
  function checkResponse() {
    let response = qs("input.player" + getCurrentPlayer());
    let answerBox = qs("#player" + getCurrentPlayer() + "-ans p");
    answerBox.textContent = response.value;
    currentWord = response.value.toLowerCase();
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
    qs("h1").textContent = "Word Master";
  }

  /**
   * Fetch the definition of the word
   */
  function getAjaxData(){
    clearTimer();
    let url = BASE_URL + currentWord + API_KEY;

    //start ajax call
    fetch(url)
      .then(checkStatus)
      .then(JSON.parse) // parse the json so the next "then" gets a JSON object
      .then(processJson)
      .catch(() => {
        displayWinner(getOtherPlayer());
        let description = document.createElement("p");
        description.textContent = currentWord + " is NOT a valid word!";
        id("game-result").append(description);
      });
  }

  /**
   * @param {Object} json - the JSON object that is was returned from the server
   */
  function processJson(json){
    displayWinner(getCurrentPlayer());
    let shortDef = json[0]["shortdef"];
    let def = document.createElement("p");
    def.textContent = "Definition of " + currentWord + ":";
    id("game-result").appendChild(def);
    let list = document.createElement("ol");
    for(let i = 0; i < shortDef.length; i++) {
      let item = document.createElement("li");
      item.textContent = shortDef[i];
      list.appendChild(item);
    }
    id("game-result").appendChild(list);
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
    * Helper function to return the response's result text if successful, otherwise
    * returns the rejected Promise result with an error status and corresponding text
    * @param {object} response - response to check for success/error
    * @returns {object} - valid result text if response was successful, otherwise rejected
    *                     Promise result
    */
   function checkStatus(response) {
     if (response.status >= 200 && response.status < 300 || response.status == 0) {
       return response.text();
     } else {
       let description = document.createElement("p");
       description.textContent = "Error communicating with server";
       id("game-result").append(description);
       return Promise.reject(new Error(response.status + ": " + response.statusText));
     }
   }
})();
