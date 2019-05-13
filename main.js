/**
 * Name: Wen Qiu
 * Date: May 1, 2019
 * Section: CSE 154 AJ
 * This is the JavaScript for the Word Master game
 */
/* global Set */
(function() {
  "use strict";

  let timerID = null;
  let currentTime = 0;
  let playerOne = true;
  let currentPrompt = null;
  let currentWord = null;
  let usedWords = new Set();
  let isValid = true;
  const PROMPTS = ["AB", "BR", "CHA", "DEF", "ES", "FR", "GE", "HO", "ID", "JA", "KI",
                   "LE", "MO", "NU", "PR", "QE", "RA", "SW", "TI", "WI", "YE"];
  const BASE_URL = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
  const API_KEY = "?key=e3135f72-2567-48c9-a6e6-ae4a3ef6b4b9";
  const ROUND_TIME = 5;
  const CHALLENGE_TIME = 3;
  const SECOND = 1000;

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

    // Enables submission with enter key stroke
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
    usedWords.clear();
    currentWord = null;
    currentTime = ROUND_TIME;
    playerOne = true;
    isValid = true;
    resetCanvas();
    id("game-view").classList.remove("hidden");
    id("menu-view").classList.add("hidden");
    qs("h1").textContent = "Pick your player";
    timerID = setInterval(updatePrepTimer, SECOND);
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
   * Updates the prep timer and display text
   */
  function updatePrepTimer() {
    currentTime--;
    id("countdown").textContent = "Game starting in " + currentTime + " sec...";
    if(currentTime === 0) {
      id("countdown").textContent = "Game start!";
      getPrompt();
      clearTimer();
      setTimeout(startRound, SECOND);
    }
  }

  /**
   * Displays a random prompt on the header
   */
  function getPrompt() {
    currentPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    qs("h1").textContent = "Give a word that starts with " + currentPrompt;
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
   * Starts the round and enables the player controls
   */
  function startRound() {
    currentTime = ROUND_TIME;
    if(currentWord != null) {
      usedWords.add(currentWord);
    }
    toggleRoundControls();
    qs("input.player" + getCurrentPlayer()).focus();
    updateRoundText();
    timerID = setInterval(updateRoundTimer, SECOND);
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
    qs("button" + currentSelector).classList.add("submit");
    qs("button" + currentSelector).classList.remove("challenge");
    qs("button" + currentSelector).addEventListener("click", submit);
    qs("button" + currentSelector).removeEventListener("click", challenge);
    qs("input" + currentSelector).disabled = false;

    qs("button" + otherSelector).disabled = true;
    qs("button" + otherSelector).textContent = "Challenge!";
    qs("button" + otherSelector).classList.add("challenge");
    qs("button" + otherSelector).classList.remove("submit");
    qs("button" + otherSelector).addEventListener("click", challenge);
    qs("button" + otherSelector).removeEventListener("click", submit);
    qs("input" + otherSelector).disabled = true;
  }

  /**
   * Updates the round timer. If the round timer runs out, end the game
   */
  function updateRoundTimer() {
    currentTime--;
    updateRoundText();
    if(currentTime === 0) {
      clearTimer();
      displayWinner(getOtherPlayer(), "Player " + getCurrentPlayer()
        + " ran out of time!");
    }
  }

  /**
   * Updates the timer text during a regular response round
   */
  function updateRoundText() {
    id("countdown").textContent = "Player " + getCurrentPlayer() + " must answer in "
      + currentTime + " sec...";
  }

  /**
   * Submits the response and starts the challenge round for the other player
   */
  function submit() {
    displayResponse();
    if(currentTime !== 0) {
      startChallenge();
    }
  }

  /**
   * Displays the response in the answer box
   */
  function displayResponse() {
    let response = qs("input.player" + getCurrentPlayer());
    let answerBox = qs("#player" + getCurrentPlayer() + "-ans p");
    answerBox.textContent = response.value;
    currentWord = response.value.toLowerCase();
    response.value = "";
  }

  /**
   * Starts the 3-second challenge timer
   */
  function startChallenge() {
    clearTimer();
    currentTime = CHALLENGE_TIME;
    toggleChallengeControls();
    updateChallengeText();
    timerID = setInterval(updateChallengeTimer, SECOND);
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
   * Updates the timer text during the challenge round
   */
  function updateChallengeText() {
    id("countdown").textContent = "Player " + getOtherPlayer() + " can challenge in "
      + currentTime + " sec...";
  }

  /**
   * Judges whether the challenge is successful or not, and displays the result
   */
  function challenge() {
    clearTimer();
    if(usedWords.has(currentWord)) {
      // Check if the word is a repeated answer
      displayWinner(getOtherPlayer(), currentWord + " has been used before!");
    } else if(!currentWord.toUpperCase().startsWith(currentPrompt)) {
      // Check if the word matches the current prompt
      displayWinner(getOtherPlayer(), currentWord + " does not start with "
        + currentPrompt);
    } else {
      getAjaxData();
    }
  }

  /**
   * Fetch the definition of the word, modified from Apod template
   * Definition from Merriam-Webster's Collegiate Dictionary with Audio API
   * https://www.dictionaryapi.com/products/api-collegiate-dictionary
   */
  function getAjaxData(){
    qs("button.challenge").disabled = true;
    clearTimer();
    let url = BASE_URL + currentWord + API_KEY;

    //start ajax call
    fetch(url)
      .then(checkStatus)
      .then(checkValid)
      .then(JSON.parse)
      .then(processJson)
      .catch(handleError);
  }

  /**
   * Checks if the API returns a list of related words in the form of "[word, ...]",
   * if so, the current word is invalid. Set the isValid flag to false to help catch
   * distinguish between the word being invalid and error communicating with the API
   * @param  {String} text - the text response from the API
   * @return {String} the text response from the API
   */
  function checkValid(text) {
    if(text.startsWith("[")) {
      isValid = false;
    }
    return text;
  }

  /**
   * Processes the json object returned from API and displays definition of the
   * current word
   * @param {Object} json - the JSON object that is was returned from the server
   */
  function processJson(json){
    displayWinner(getCurrentPlayer(), "Definition of " + currentWord + ":");
    let shortDef = json[0]["shortdef"];
    let list = document.createElement("ol");
    for(let i = 0; i < shortDef.length; i++) {
      let item = document.createElement("li");
      item.textContent = shortDef[i];
      list.appendChild(item);
    }
    id("game-result").appendChild(list);
  }

  /**
   * Handles the error thrown during fetch, show whether the current word is invalid
   * or error communicating with the API
   */
  function handleError() {
    if(!isValid) {
      displayWinner(getOtherPlayer(), currentWord + " is NOT a valid word!");
    } else {
      displayWinner(getOtherPlayer(), "Error communicating with the API");
    }
  }

  /**
   * Displays the winner of the game
   * @param  {int} winner - the winner of the game, 1 or 2
   * @param  {String} message - the reason why the given player wins
   */
  function displayWinner(winner, message) {
    clearTimer();
    id("game-result").innerHTML = "";
    let result = document.createElement("p");
    result.textContent = "Player " + winner + " wins!";
    id("game-result").appendChild(result);
    id("game-result").classList.remove("hidden");
    id("start-over").classList.remove("hidden");
    let description = document.createElement("p");
    description.textContent = message;
    id("game-result").appendChild(description);
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
    * Used the template from spec
    * @param {object} response - response to check for success/error
    * @returns {object} - valid result text if response was successful, otherwise rejected
    *                     Promise result
    */
   function checkStatus(response) {
     if (response.status >= 200 && response.status < 300 || response.status == 0) {
       return response.text();
     } else {
       return Promise.reject(new Error(response.status + ": " + response.statusText));
     }
   }
})();
