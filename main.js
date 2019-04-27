/**
 * Name: Wen Qiu
 * Date: April 20, 2019
 * Section: CSE 154 AJ
 * This is the JavaScript to implement the UI for the LinkedIntList playground, accept
 * user input on size and data of the LinkedIntList, and a simplified Java code
 * editor that allows them to access the nodes and the data in the LinkedIntList.
 */
(function() {
  "use strict";

  window.addEventListener("load", init);

  /**
   * Initialization after the window loads. Attaches event listeners to all the
   * interactive elements
   */
  function init() {

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
   * Helper method for getting an array of elements by selector
   * @param {String} selector - the selector used to select the target elements
   * @return {Object[]} An array of elements in the DOM selected with the given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
