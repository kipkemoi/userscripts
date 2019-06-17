// ==UserScript==
// @name         NYTimes Privacy Blocker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Prevent sites detecting if you're in incognito by calling the success callback of webkitRequestFileSystem even if it's failing.
// @description  originally from https://www.reddit.com/r/Piracy/comments/b8z1li/how_to_get_past_the_new_york_times_paywall/elfiyvt/
// @author       You
// @run-at       document-start
// @match        *://*.nytimes.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function injectScript(script, node) {
        var element = document.createElement('script');
        element.setAttribute('type', 'text/javascript');
        element.setAttribute('async', false);
        element.text = script;
        node.appendChild(element);
    }
    var node = document.documentElement;
    var script = '';
    if ("[object SafariRemoteNotification]" === (!window.safari || safari.pushNotification).toString()) {
        //Safari
        script = `(function(openDatabase) {
                     window.openDatabase = function(shortName, version, displayName, maxSize) {
                     return {};
                     }
                  })(window.openDatabase);`;
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        //Firefox
        script = `(function(open) {
                     window.indexedDB.open = function(name, version = 1){ return {readyState: "done", result: {} }; }
                  })(window.indexedDB.open);`;
    } else if (window.webkitRequestFileSystem) {
        //Chrome
        script = `(function(webkitRequestFileSystem) {
                     window.webkitRequestFileSystem = function(type, size, successCallback, errorCallback) {
                         webkitRequestFileSystem(type, size, successCallback, successCallback);
                     }
                  })(window.webkitRequestFileSystem);`;
    } // TODO - MS Edge

    if (script) injectScript(script, node);
})();
