"use strict";

var LRTAG =  LRTAG || {};
LRTAG.funs = {
  getOptValue: function (value, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][0] === value) {
        return array[i][1];
      }
    }
    return undefined;
  },

  printDebug: function (msg) {
    if (LRTAG.opts.debug === true) {
      console.info(msg);
      var elt = document.getElementById("debug");
      if (elt) {
        elt.innerHTML = elt.innerHTML + "<br/>" + msg;
      }
    }
  },

  getCookie: function (key) {
    var name = key + "=";
    var value = null;
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length && !value; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) == 0) {
        value = c.substring(name.length, c.length);
      }
    }
    return value;
  },

  setCookie: function (key, value, days) {
    var d = new Date(new Date().getTime() + days * 60 * 60 * 24 * 1000);
    var expires = "expires="+d.toUTCString();
    document.cookie = key + "=" + value + "; " + expires + "; path=/";
  }
};

LRTAG.defaults = {
  path: "/js/redir.html",

  privacy_style: "",
  privacy_header_style: "",
  privacy_message_style: "",

  privacy_text: "Your browser blocks third party cookies by default. We allow our partner LiveRamp to " +
  "set its cookie from our site. By closing this banner or interacting with this site, you agree to allow our " +
  "partner LiveRamp to set a cookie on your browser. Click here [Site Policy] to learn more about our cookie " +
  "policy or click here <a data-no-fp href='http://liveramp.com/opt_out/'>LiveRamp</a> to opt out.",

  debug: false,
  safari: false
};

LRTAG.opts = {
  subdomain: LRTAG.funs.getOptValue("subdomain", window._lrc),
  port: LRTAG.funs.getOptValue("port", window._lrc),
  path: LRTAG.funs.getOptValue("path", window._lrc) || LRTAG.defaults.path,

  privacy_style: LRTAG.funs.getOptValue("privacy_style", window._lrc) || LRTAG.defaults.privacy_style,
  privacy_header_style: LRTAG.funs.getOptValue("privacy_header_style", window._lrc) || LRTAG.defaults.privacy_header_style,
  privacy_message_style: LRTAG.funs.getOptValue("privacy_message_style", window._lrc) || LRTAG.defaults.privacy_message_style,

  privacy_link: LRTAG.funs.getOptValue("privacy_link", window._lrc),
  privacy_text: LRTAG.funs.getOptValue("privacy_text", window._lrc) || LRTAG.defaults.privacy_text,

  debug: LRTAG.funs.getOptValue("debug", window._lrc) || false,
  safari: LRTAG.funs.getOptValue("safari", window._lrc) || false
};

LRTAG.fp = {

  closePrivacy: function () {
    var elt = document.getElementById("_lr_privacy");
    if (elt) {
      elt.style.cssText = "display:none;";
    }
    LRTAG.funs.setCookie('_lr_fp', '0', 90);
    return false;
  },

  showPrivacy: function () {
    var text = LRTAG.opts.privacy_text.replace("[Site Policy]", "<a data-no-fp href='" + LRTAG.opts.privacy_link + "'>Site Policy</a>");
    var div = document.createElement("div");
    div.id = "_lr_privacy";
    div.style.cssText =
        "border:1px solid black;" +
        "background-color:yellow;" +
        LRTAG.opts.privacy_style + ";" +
        "bottom:0px;" +
        "position:absolute;" +
        "margin:20px;" +
        "margin-bottom:0px;" +
        "padding:0px;" +
        "z-index:1000;" +
        "min-height:14%;" +
        "width:50%;";
    div.innerHTML =
        "<div style='padding:5px; border-bottom: 1px solid black;font-weight: bold;font-size: 20px;"+ LRTAG.opts.privacy_header_style +"'>" +
          "Privacy Notice" +
          "<a onclick='LRTAG.fp.closePrivacy();' style='font-weight:normal;float:right;color:inherit;text-decoration:none' href='#'>&#x2716;</a>" +
        "</div>" +
        "<div style='padding: 10px;text-align: justify;"+ LRTAG.opts.privacy_message_style +";height:100%;'>" +
          text +
        "</div>";
    document.body.appendChild(div);
  },

  hasInternalHash: function (link) {
    if (link.href.indexOf('#') === -1)
        return false;
    if (link.host !== location.host)
        return false;
    if (link.pathname !== location.pathname)
        return false;
    return true;
  },

  setupLinks: function () {
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.onclick)
          continue;
      if (this.hasInternalHash(link))
          continue;
      if (link.dataset.hasOwnProperty('noFp'))
          continue;

      LRTAG.funs.printDebug("Installing hook on: " + link.href);
      link.onclick = function(e) {
        LRTAG.funs.printDebug("Clicked on " + e.target);
        LRTAG.funs.setCookie('_lr_fp', '1', 90);

        var subdomain = LRTAG.opts.subdomain;
        var port = LRTAG.opts.port;
        var path = LRTAG.opts.path;

        e.target.href = "https://http2poc.pippio.com/redir?cookieKey=testCookieKey&cookieValue=testCookieValue&redirectTo=" + encodeURIComponent(e.target.href);
        return true;
      };

    }
  },

  isSafari: function () {
  return (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) ||
      LRTAG.funs.getCookie('_lr_safari') ||
      LRTAG.opts.safari;
  },

  hasPrivacyClose: function () {
    return LRTAG.funs.getCookie('_lr_fp') === "0";
  },

  hasLrCookie: function () {
    return LRTAG.funs.getCookie('_lr_fp') === "1";
  },

  setup: function () {
    LRTAG.funs.printDebug("Options: " + window._lrc);
    LRTAG.funs.printDebug("Cookies: " + document.cookie);

    // if (!this.isSafari()) {
    //   LRTAG.funs.printDebug("Not a safari browser");
    //   return;
    // }

    if (this.hasLrCookie()) {
      LRTAG.funs.printDebug("Already has rlcdn cookie")
      return;
    }

    LRTAG.funs.printDebug("Safari without rlcdn cookie detected");

    if (!this.hasPrivacyClose()) {
      // this.showPrivacy();
    }
      this.setupLinks();
  }

};

LRTAG.fp.setup();
