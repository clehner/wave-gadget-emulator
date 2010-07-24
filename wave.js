var a, wave = wave || {};
wave.Callback = function(b, c) {
  this.callback_ = b;
  this.context_ = c || null
};
wave.Callback.prototype.invoke = function() {
  this.callback_ && this.callback_.apply(this.context_, arguments)
};
wave.Mode = {UNKNOWN:0, VIEW:1, EDIT:2, DIFF_ON_OPEN:3, PLAYBACK:4};
wave.API_PARAM_ = "wave";
wave.ID_PARAM_ = "waveId";
wave.id_ = null;
wave.viewer_ = null;
wave.host_ = null;
wave.participants_ = [];
wave.participantMap_ = {};
wave.participantCallback_ = new wave.Callback(null);
wave.state_ = null;
wave.stateCallback_ = new wave.Callback(null);
wave.privateState_ = null;
wave.privateStateCallback_ = new wave.Callback(null);
wave.mode_ = null;
wave.modeCallback_ = new wave.Callback(null);
wave.inWaveContainer_ = false;gadgets.window = gadgets.window || {};
(function() {
  function b(e, d) {
    var g = window.getComputedStyle(e, "");
    g = g.getPropertyValue(d);
    g.match(/^([0-9]+)/);
    return parseInt(RegExp.$1, 10)
  }
  var c;
  gadgets.window.adjustWidth = function(e) {
    var d = parseInt(e, 10);
    e = false;
    if(isNaN(d)) {
      e = true;
      var g = gadgets.window.getViewportDimensions().width, f = document.body, h = document.documentElement;
      if(document.compatMode === "CSS1Compat" && h.scrollWidth) {
        d = h.scrollWidth !== g ? h.scrollWidth : h.offsetWidth
      }else {
        if(navigator.userAgent.indexOf("AppleWebKit") >= 0) {
          g = 0;
          for(f = [document.body];f.length > 0;) {
            h = f.shift();
            h = h.childNodes;
            for(d = 0;d < h.length;d++) {
              var i = h[d];
              if(typeof i.offsetLeft !== "undefined" && typeof i.scrollWidth !== "undefined") {
                var j = i.offsetLeft + i.scrollWidth + b(i, "margin-right");
                g = Math.max(g, j)
              }
              f.push(i)
            }
          }
          d = g + b(document.body, "border-right") + b(document.body, "margin-right") + b(document.body, "padding-right")
        }else {
          if(f && h) {
            d = h.scrollWidth;
            i = h.offsetWidth;
            if(h.clientWidth !== i) {
              d = f.scrollWidth;
              i = f.offsetWidth
            }
            d = d > g ? d > i ? d : i : d < i ? d : i
          }
        }
      }
    }
    if(d !== c && !isNaN(d) && !(e && d === 0)) {
      c = d;
      gadgets.rpc.call(null, "setIframeWidth", null, d)
    }
  }
})();wave.Participant = function(b, c, e) {
  this.id_ = b || "";
  this.displayName_ = c || "";
  this.thumbnailUrl_ = e || ""
};
wave.Participant.prototype.getId = function() {
  return this.id_
};
wave.Participant.prototype.getDisplayName = function() {
  return this.displayName_
};
wave.Participant.prototype.getThumbnailUrl = function() {
  return this.thumbnailUrl_
};
wave.Participant.fromJson_ = function(b) {
  var c = new wave.Participant;
  c.id_ = b.id;
  c.displayName_ = b.displayName;
  c.thumbnailUrl_ = b.thumbnailUrl;
  return c
};wave.State = function(b) {
  this.setState_(null);
  this.rpc_ = b === undefined ? "wave_gadget_state" : b
};
a = wave.State.prototype;
a.get = function(b, c) {
  if(b in this.state_) {
    return this.state_[b]
  }
  return c === undefined ? null : c
};
a.getKeys = function() {
  var b = [];
  for(var c in this.state_) {
    if(!c.match(/___$/)) {
      var e;
      e = c;
      b.push(e)
    }
  }
  return b
};
a.submitDelta = function(b) {
  gadgets.rpc.call(null, this.rpc_, null, b)
};
a.submitValue = function(b, c) {
  var e = {};
  e[b] = c;
  this.submitDelta(e)
};
a.reset = function() {
  var b = {};
  for(var c in this.state_) {
    if(!c.match(/___$/)) {
      var e;
      e = c;
      b[e] = null
    }
  }
  this.submitDelta(b)
};
a.setState_ = function(b) {
  this.state_ = b || {}
};
a.calculateDelta_ = function(b) {
  var c = {};
  for(var e in b) {
    if(!e.match(/___$/)) {
      var d;
      d = e;
      var g = this.state_.hasOwnProperty(d);
      if(!g || this.state_[d] != b[d]) {
        c[d] = b[d]
      }
    }
  }
  for(var f in this.state_) {
    if(!f.match(/___$/)) {
      d = f;
      b.hasOwnProperty(d) || (c[d] = null)
    }
  }
  return c
};
a.applyDelta_ = function(b) {
  this.state_ = this.state_ || {};
  for(var c in b) {
    if(!c.match(/___$/)) {
      var e;
      e = c;
      if(b[e] != null) {
        this.state_[e] = b[e]
      }else {
        delete this.state_[e]
      }
    }
  }
};
a.toString = function() {
  return wave.util.printJson(this.state_, true)
};var tamings___ = tamings___ || [], caja___, ___;
tamings___.push(function(b) {
  function c(e, d) {
    var g = {apply:___.markFuncFreeze(function(f, h) {
      return ___.callPub(e, "apply", [d, h])
    })};
    return new wave.Callback(g, ___.USELESS)
  }
  ___.grantRead(wave, "Mode");
  c.prototype = wave.Callback.prototype;
  wave.Callback.prototype.constructor = c;
  ___.markCtor(c, Object, "Callback");
  ___.primFreeze(c);
  ___.tamesTo(wave.Callback, c);
  ___.handleGenericMethod(c.prototype, "invoke", function() {
    return ___.callPub(this.callback_, "apply", [___.tame(this.context_), Array.slice(arguments, 0)])
  });
  caja___.whitelistCtors([[wave, "Participant", Object], [wave, "State", Object]]);
  caja___.whitelistMeths([[wave.Participant, "getDisplayName"], [wave.Participant, "getId"], [wave.Participant, "getThumbnailUrl"], [wave.State, "get"], [wave.State, "getKeys"], [wave.State, "reset"], [wave.State, "submitDelta"], [wave.State, "submitValue"], [wave.State, "toString"]]);
  caja___.whitelistFuncs([[wave, "getHost"], [wave, "getMode"], [wave, "getParticipantById"], [wave, "getParticipants"], [wave, "getState"], [wave, "getTime"], [wave, "getViewer"], [wave, "isInWaveContainer"], [wave, "log"], [wave, "setModeCallback"], [wave, "setParticipantCallback"], [wave, "setStateCallback"], [wave.util, "printJson"]]);
  b.outers.wave = ___.tame(wave);
  ___.grantRead(b.outers, "wave")
});wave.util = wave.util || {};
wave.util.SPACES_ = "                                                 ";
wave.util.toSpaces_ = function(b) {
  return wave.util.SPACES_.substring(0, b * 2)
};
wave.util.isArray_ = function(b) {
  try {
    return b && typeof b.length == "number"
  }catch(c) {
    return false
  }
};
wave.util.printJson = function(b, c, e) {
  if(!b || typeof b.valueOf() != "object") {
    if(typeof b == "string") {
      return"'" + b + "'"
    }else {
      if(b instanceof Function) {
        return"[function]"
      }
    }
    return"" + b
  }
  var d = [], g = wave.util.isArray_(b), f = g ? "[]" : "{}", h = c ? "\n" : "", i = c ? " " : "", j = 0;
  e = e || 1;
  c || (e = 0);
  d.push(f.charAt(0));
  for(var l in b) {
    if(!l.match(/___$/)) {
      var k;
      k = l;
      var m = b[k];
      j++ > 0 && d.push(", ");
      if(!g) {
        d.push(h);
        d.push(wave.util.toSpaces_(e));
        d.push(k + ": ");
        d.push(i)
      }
      d.push(wave.util.printJson(m, c, e + 1))
    }
  }
  if(!g) {
    d.push(h);
    d.push(wave.util.toSpaces_(e - 1))
  }
  d.push(f.charAt(1));
  return d.join("")
};wave.checkWaveContainer_ = function() {
  var b = gadgets.util.getUrlParameters();
  wave.inWaveContainer_ = b.hasOwnProperty(wave.API_PARAM_) && b[wave.API_PARAM_];
  wave.id_ = b.hasOwnProperty(wave.ID_PARAM_) && b[wave.ID_PARAM_]
};
wave.isInWaveContainer = function() {
  return wave.inWaveContainer_
};
wave.receiveWaveParticipants_ = function(b) {
  wave.viewer_ = null;
  wave.host_ = null;
  wave.participants_ = [];
  wave.participantMap_ = {};
  var c = b.myId, e = b.authorId;
  b = b.participants;
  for(var d in b) {
    if(!d.match(/___$/)) {
      var g;
      g = d;
      var f = wave.Participant.fromJson_(b[g]);
      if(g == c) {
        wave.viewer_ = f
      }
      if(g == e) {
        wave.host_ = f
      }
      wave.participants_.push(f);
      wave.participantMap_[g] = f
    }
  }
  if(!wave.viewer_ && c) {
    f = new wave.Participant(c, c);
    wave.viewer_ = f;
    wave.participants_.push(f);
    wave.participantMap_[c] = f
  }
  wave.participantCallback_.invoke(wave.participants_)
};
wave.receiveState_ = function(b) {
  wave.state_ = wave.state_ || new wave.State("wave_gadget_state");
  var c = wave.state_.calculateDelta_(b);
  wave.state_.setState_(b);
  wave.stateCallback_.invoke(wave.state_, c)
};
wave.receivePrivateState_ = function(b) {
  wave.privateState_ = wave.privateState_ || new wave.State("wave_private_gadget_state");
  var c = wave.privateState_.calculateDelta_(b);
  wave.privateState_.setState_(b);
  wave.privateStateCallback_.invoke(wave.privateState_, c)
};
wave.receiveStateDelta_ = function(b) {
  wave.state_ = wave.state_ || new wave.State("wave_gadget_state");
  wave.state_.applyDelta_(b);
  wave.stateCallback_.invoke(wave.state_, b)
};
wave.receivePrivateStateDelta_ = function(b) {
  wave.privateState_ = wave.privateState_ || new wave.State("wave_private_gadget_state");
  wave.privateState_.applyDelta_(b);
  wave.privateStateCallback_.invoke(wave.privateState_, b)
};
wave.receiveMode_ = function(b) {
  wave.mode_ = b || {};
  wave.modeCallback_.invoke(wave.getMode())
};
wave.getViewer = function() {
  return wave.viewer_
};
wave.getHost = function() {
  return wave.host_
};
wave.getParticipants = function() {
  return wave.participants_
};
wave.getParticipantById = function(b) {
  return wave.participantMap_[b]
};
wave.getState = function() {
  return wave.state_
};
wave.getPrivateState = function() {
  return wave.privateState_
};
wave.getMode = function() {
  if(wave.mode_) {
    var b = wave.mode_["${playback}"], c = wave.mode_["${edit}"];
    if(b != null && c != null) {
      return b == "1" ? wave.Mode.PLAYBACK : c == "1" ? wave.Mode.EDIT : wave.Mode.VIEW
    }
  }
  return wave.Mode.UNKNOWN
};
wave.isPlayback = function() {
  var b = wave.getMode();
  return b == wave.Mode.PLAYBACK || b == wave.Mode.UNKNOWN
};
wave.setStateCallback = function(b, c) {
  wave.stateCallback_ = new wave.Callback(b, c);
  wave.state_ && wave.stateCallback_.invoke(wave.state_, wave.state_.state_)
};
wave.setPrivateStateCallback = function(b, c) {
  wave.privateStateCallback_ = new wave.Callback(b, c);
  wave.privateState_ && wave.privateStateCallback_.invoke(wave.privateState_, wave.privateState_.state_)
};
wave.setParticipantCallback = function(b, c) {
  wave.participantCallback_ = new wave.Callback(b, c);
  wave.participants_ && wave.participantCallback_.invoke(wave.participants_)
};
wave.setModeCallback = function(b, c) {
  wave.modeCallback_ = new wave.Callback(b, c);
  wave.mode_ && wave.modeCallback_.invoke(wave.getMode())
};
wave.getTime = function() {
  return(new Date).getTime()
};
wave.log = function(b) {
  gadgets.rpc.call(null, "wave_log", null, b || "")
};
wave.setSnippet = function(b) {
  gadgets.rpc.call(null, "set_snippet", null, b || "")
};
wave.getWaveId = function() {
  return wave.id_
};
wave.internalInit_ = function() {
  wave.checkWaveContainer_();
  if(wave.isInWaveContainer()) {
    gadgets.rpc.register("wave_participants", wave.receiveWaveParticipants_);
    gadgets.rpc.register("wave_gadget_state", wave.receiveState_);
    gadgets.rpc.register("wave_state_delta", wave.receiveStateDelta_);
    gadgets.rpc.register("wave_private_gadget_state", wave.receivePrivateState_);
    gadgets.rpc.register("wave_private_state_delta", wave.receivePrivateStateDelta_);
    gadgets.rpc.register("wave_gadget_mode", wave.receiveMode_);
    gadgets.rpc.call(null, "wave_enable", null, "1.0")
  }
};
(wave.init_ = function() {
  window.gadgets && gadgets.util.registerOnLoadHandler(function() {
    wave.internalInit_()
  })
})();if(typeof wave == "undefined") {
  wave = {}
}
if(typeof wave.ui == "undefined") {
  wave.ui = {}
}
wave.ui.BASE = "http://wave-api.appspot.com/public/";
wave.ui.cssLoaded = false;
wave.ui.loadCss = function() {
  if(!wave.ui.cssLoaded) {
    wave.ui.cssLoaded = true;
    var b = document.createElement("link");
    b.setAttribute("rel", "stylesheet");
    b.setAttribute("type", "text/css");
    b.setAttribute("href", wave.ui.BASE + "wave.ui.css");
    document.getElementsByTagName("head")[0].appendChild(b)
  }
};
wave.ui.makeButton = function(b) {
  wave.ui.loadCss();
  b.innerHTML = "<span>" + b.innerHTML + "</span>";
  b.className += " wavebutton"
};
wave.ui.makeDialog = function(b, c, e) {
  function d() {
    b.style.display = "none"
  }
  wave.ui.loadCss();
  var g = b.innerHTML;
  b.innerHTML = "";
  var f = document.createElement("div");
  f.className = "wavedialoghead";
  var h = document.createElement("span"), i = document.createElement("div");
  i.className = "wavedialogclose";
  i.onclick = e || d;
  h.appendChild(i);
  h.appendChild(document.createTextNode(c));
  f.appendChild(h);
  b.appendChild(f);
  c = document.createElement("div");
  c.className = "wavedialogbody";
  c.innerHTML = g;
  b.appendChild(c);
  b.className += " wavedialog"
};
wave.ui.makeFrame = function(b) {
  wave.ui.loadCss();
  b.innerHTML = '<div class="waveboxhead"><span>&nbsp;</span></div><div class="waveboxbody">' + b.innerHTML + "</div>";
  b.className += " wavebox"
};
