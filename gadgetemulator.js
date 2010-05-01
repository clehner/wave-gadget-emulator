
// Gadget emulator that fakes just enough of the Google Wave gadget API
// to let a gadget run in two iframes.

function Rpc(host, participant) {
	this._host = host; // Gadgets
	this._participant = participant;
}

Rpc.prototype = { 
	call: function(arg1, cmd, arg2, params) {
		this._host._call(cmd,params);
	},
	register: function(endpoint, cb) {
		this._host._register(this._participant.id,endpoint,cb);
	}
};

function Gadgets(host, part, win, frame) {
	if (host && part && win) {
		this.rpc = new Rpc(host, part); // Gadgets
		this.window = new Window(win, frame);
	} else {
		this._rpc = {};
	}
}

function Window(win, frame) {
	this._win = win;
	this._frame = frame;
}
Window.prototype = {
	getViewportDimensions: function() {
		var win = this._win;
		var doc = win.document;
		return {
			width: doc.documentElement.scrollWidth ||
				doc.body.scrollWidth || win.outerWidth,
			height: doc.documentElement.scrollHeight ||
				doc.body.scrollHeight || win.outerHeight
		};
	},
	adjustHeight: function(height) {
		if (this._frame) {
			this._frame.height = height ||
				this.getViewportDimensions().height;
		} else {
			this._win.resizeBy(0, height - this._win.innerHeight);
		}
	},
	setTitle: function () {}
};

Gadgets.prototype = {

	_printState: function(object) {
		if (!object) return "" + object;
		var lines = [];
		var i = 0;
		for (var key in object) {
			lines[i++] = key + ":  '" + object[key];
		}
		return i ? "{\n    " + lines.join("',\n    ") + "'\n  }" : "{\n  }";
	},

	_add_participant: function(id, win, frame, name, thumb, subtitle) {
		if (!this._participants) { this._participants = {}; }
		this._participants[id] = {id: id, win: win, frame: frame, displayName: name, thumbnailUrl: thumb};
		this._sendParticipants();
		subtitle.innerHTML = id + " - " + name;
		return id;
	},

	_load: function(url) {
		if (url.indexOf("http://") == 0) {
			url = "proxy.php?url=" + encodeURIComponent(url);
		}
		function writeGadget(xml) {
			var content = xml.getElementsByTagName("Content")[0].textContent;
			var prefs = xml.getElementsByTagName("ModulePrefs")[0];
			var height = prefs.getAttribute("height");
			var title = prefs.getAttribute("title");
			$("gadget-title").firstChild.nodeValue = title;
			for (var p in gadgets._participants) {
				var part = gadgets._participants[p];
				var doc = part.win.document;
				if (part.frame) {
					part.frame.height = height;
				}
				var g = part.win.gadgets = new Gadgets(gadgets, part, part.win, part.frame);
				part.win.gadgets = g;
				doc.write(content);
				gadgets.util._ready(part.id, doc);
			}
		}
		var req = new XMLHttpRequest();
		req.open("GET", url, true);
		req.onreadystatechange = function (e) {
			if (req.readyState == 4) {
				if (req.status == 200) {
					try {
						writeGadget(req.responseXML);
						return;
					} catch (e) {}
				}
				alert("Load failed.");
			}
		};
		req.send(null);
	},
	
	_setMode: function(mode) {
		this._mode = mode in {"edit":1,"playback":1} ? mode : "view";
		this._sendMode();
	},

	// --- To be called in the participant frames ---

	_sendState: function() {
		var s = this._rpc["wave_gadget_state"];
		var state = this._state || {};
		(document.getElementById('state')||{}).value = this._printState(state);
		for (var cb in s) {
			s[cb].cb(state);
		}
	},

	_sendParticipants: function() {
		var s = this._rpc["wave_participants"];
		var ob = {myId: 0, authorId: 0, participants: this._participants};
		for (var cb in s) {
			ob.myId = s[cb].part;
			s[cb].cb(ob);
		}
	},
	
	_mode: "view",
	
	_sendMode: function() {
		var s = this._rpc["wave_gadget_mode"];
		var modeObj = {
			"${playback}": (this._mode == "playback"),
			"${edit}": (this._mode == "edit")
		};
		for (var cb in s) {
			s[cb].cb(modeObj);
		}
	},

	_call: function(cmd,a) {
		if (cmd == "wave_gadget_state") {
			var dirty = false;
			this._state = this._state || {};
			for (var i in a) {
				if (a[i] !== this._state[i]) {
					if (a[i] == null) {
						delete this._state[i];
					} else {
						this._state[i] = a[i];
					}
					dirty = true;
				}
			}
			if (dirty) this._sendState();
		} else if (cmd == "wave_enable") {
			this._sendState();
			this._sendParticipants();
			this._sendMode();
		} else {
	 		alert("Unhandled RPC command: "+cmd);
		}
	},

	_register: function(partid, endpoint, cb) {
		this._rpc[endpoint] = this._rpc[endpoint] || [];
		this._rpc[endpoint].push({part: partid, cb: cb});
	},

	util: { 
		registerOnLoadHandler: function(f) {
			document._gadgets_onload_handler = f;
			setTimeout(f, 10);
		},
		_ready: function(pid, doc) {
			doc = doc || document;
			if (doc._gadgets_onload_handler) doc._gadgets_onload_handler();
		},
		getUrlParameters: function() {
			return {wave: true, waveId: "asdfg"};
		}
	},

	rpc: Rpc.prototype,
	
	window: Window.prototype
};

// Shim for the hashchange event
"onhashchange" in window || (function () {
	var lastHash = '';
	setInterval(function pollHash() {
		if (lastHash !== location.hash) {
			lastHash = location.hash;
			var event = document.createEvent("HTMLEvents");
			event.initEvent("hashchange", false, false);
			window.dispatchEvent(event);
			if (typeof onhashchange == "function") {
				onhashchange(event);
			}
		}
	}, 100);
})();

var gadgets;

function $(id) { return document.getElementById(id); }

function updatePage() {
	var gadgetXml = (/#(.*)/.exec(location.hash) || {})[1];
	if (gadgetXml) {
		document.body.className = "gadget-page";
		loadGadget(gadgetXml);
		$("g").value = gadgetXml;
	} else {
		document.body.className = "home-page";
	}
}
window.onhashchange = updatePage;
updatePage();

$("mode-view").onchange = function () { gadgets._setMode("view"); };
$("mode-edit").onchange = function () { gadgets._setMode("edit"); };
$("mode-playback").onchange = function () { gadgets._setMode("playback"); };
$("load").onsubmit = function () {
	location.hash = "#" + $("g").value;
	return false;
};

function loadGadget(url) {
	$("mode-view").checked = true;
	$("frames").innerHTML =
		"<iframe id='part1'></iframe>"+
		"<iframe id='part2'></iframe>";
	var f1 = $("part1");
	var f2 = $("part2");
	//var f2 = window.open("participantframe.html", "p1", "a");
	gadgets = new Gadgets();
	gadgets._add_participant('john@example.com', frames[0], f1, "John", 'participant.jpg', $("subtitle1"));
	gadgets._add_participant('peter@example.com', frames[1], f2, "Peter", 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAAAXNSR0IArs4c6QAAAANQTFRF/5IAWpXhrwAAAAxJREFUCB1jYBhZAAAA8AABlLHiVgAAAABJRU5ErkJggg==', $("subtitle2"));
	gadgets._load(url);
}

