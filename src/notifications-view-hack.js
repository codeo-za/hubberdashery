"use strict";
var NotificationsViewHack = function() {
  this.init();
};

NotificationsViewHack.prototype = {
  init: function() {
    console.log("init NotificationsViewHack");
    this._currentUser = this._determineCurrentUser();
    if (!this._currentUser) {
      console.warn("Can't determine current user");
      return;
    }
    console.log("You are logged in as: " + this._currentUser);
    this._addRotationAnimationStyle();
    this._setBusy();
    var promises = this._findNotificationsLinks()
      .map(link => this._updateReviewMarkerOn(link));
    Promise.all(promises).then(() => this._setNotBusy());
  },
  _addRotationAnimationStyle: function() {
    var el = document.createElement("style");
    el.type = "text/css";
    el.innerHTML = "\
    .__spinner { animation: __spin 1.5s ease infinite; }\
    @keyframes __spin { 100% { transform: rotate(360deg); } }\
    ";
    document.body.appendChild(el);
  },
  _setBusy: function() {
    var octicon = document.querySelector(".octicon");
    if (octicon) {
      octicon.classList.add("__spinner");
      octicon.title = "busy haxing it up...";
    }
  },
  _setNotBusy: function() {
    var octicon = document.querySelector(".octicon");
    if (octicon) {
      octicon.classList.remove("__spinner");
      octicon.title = "";
    }
  },
  _determineCurrentUser: function() {
    var node = document.querySelector(".header-nav-current-user strong");
    return node ? node.innerText : undefined;
  },
  _updateReviewMarkerOn: function(link) {
    var url = this._getUrlFor(link)
    return this._fetchContentFor(url)
      .then(content => {
        if (this._requiresReviewOn(content)) {
          link.style.fontWeight = "600";
          link.text += " ⚠️";
          link.title = "Review required: " + link.title;
        }
      });
  },
  _requiresReviewOn: function(htmlNode) {
    var node = htmlNode.querySelector(".flash-warn [href$='submit-review']");
    return !!node;
  },
  _fetchContentFor: function(url) {
    if (!fetch) {
      console.log("no fetch function )':");
      return Promise.reject();
    }
    return fetch(url)
    .then(result => result.text())
    .then(content => {
      var el = document.createElement("html");
      el.innerHTML = content;
      return el;
    });
  },
  _getUrlFor: function(link) {
    var url = link.href;
    if (!url) {
      console.warn("Can't get href on ", link);
      return;
    }
    var parts = url.split("#");
    return parts[0];
  },
  _findNotificationsLinks: function() {
    var result = Array.from(
      document.querySelectorAll(".notifications-list .list-group-item-name a")
    );
    console.log("notifications links:", result);
    return result;
  },
  destroy: function() {
  }
};

NotificationsViewHack.urlMatch = /.*\/notifications.*/;
module.exports = NotificationsViewHack;