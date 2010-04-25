
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
	adjustHeight: function(height) {
		height = height || this._win.document.documentElement.scrollHeight ||
			this._win.document.body.scrollHeight || this._win.outerHeight;
		var part = this._win.document._participant;
		if (this._frame) {
			this._frame.height = height;
		} else {
			this._win.resizeBy(0, height - this._win.innerHeight);
		}
	}
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

	_add_participant: function(id, win, frame, name, thumb) {
		if (!this._participants) { this._participants = {}; }
		this._participants[id] = {id: id, win: win, frame: frame, displayName: name, thumbnailUrl: thumb};
		this._sendParticipants();
		return id;
	},

	_load: function(url) {
		function writeGadget(xml) {
			var content = xml.getElementsByTagName("Content")[0].textContent;
			var prefs = xml.getElementsByTagName("ModulePrefs")[0];
			var height = prefs.getAttribute("height");
			for (var p in gadgets._participants) {
				var part = gadgets._participants[p];
				var doc = part.win.document;
				if (part.frame) {
					part.frame.height = height;
				}
				var g = part.win.gadgets = new Gadgets(gadgets, part, part.win, part.frame);
				doc.write("<h3 style='margin:0'>Participant " +
					part.id + " - " + part.displayName + "</h3>" +
					content);
				part.win.gadgets = g;
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
			f();
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

var gadgets = new Gadgets();
