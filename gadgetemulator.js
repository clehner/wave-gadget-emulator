
// Gadget emulator that fakes just enough of the Google Wave gadget API
// to let a gadget run in two iframes.

function Wave() {
}
	
function Gadgets() {
}

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

	_add_participant: function(id,part, name, thumb) {
		if (!this._participants) { this._participants = []; }
		this._participants.push({id: id, part: part, displayName: name, thumbnailUrl: thumb});
		return id;
	},

	_load: function(url) {
		function writeGadget(text) {
			for (var p in gadgets._participants) {
				var part = gadgets._participants[p];
				var doc = part.part.document;
				doc._participant_id = part.id;
				doc.write("<h3 style='margin:0'>Participant "+
					part.id + " - " + part.displayName + "</h3>"+
					text);
				gadgets.util._ready(part.id, doc);
			}
		}
		var req = new XMLHttpRequest();
		req.open("GET", url, true);
		req.onreadystatechange = function (e) {
			if (req.readyState == 4) {
				if (req.status == 200) {
					try {
						writeGadget(req.responseXML.
							getElementsByTagName("Content")[0].textContent);
						return;
					} catch (e) {}
				}
				alert("Load failed.");
			}
		};
		req.send(null);
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
		var p = this._participants;
		var part = [];
		for (var i in p) {
			part.push(p[i]);
		}
		var ob = {myId: 0, authorId: 0, participants: part};
		for (var cb in s) {
			ob.myId = s[cb].part;
			s[cb].cb(ob);
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
		} else {
	 		alert("Unhandled RPC command: "+cmd);
		}
	},

	_register: function(partid, endpoint, cb) {
		this._rpc = this._rpc || {};
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
		getUrlParameters: function() { return {wave: new Wave()}; }
	},

	rpc: { 
		call: function(arg1, cmd, arg2, params) {
			window.top.gadgets._call(cmd,params);
		},
		register: function(endpoint, cb) {
			window.top.gadgets._register(document._participant_id,endpoint,cb);
		}
	}
}

var gadgets = new Gadgets();
