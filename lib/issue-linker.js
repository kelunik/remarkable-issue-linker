var utils = require("./utils");

module.exports = IssueLinker;

function IssueLinker() {
	var self = function(remarkable, options) {
		self.options = options;
		self.init(remarkable);
	};

	self.__proto__ = IssueLinker.prototype;
	self.regex = /https?:\/\/github\.com\/([a-z][a-z-]+)\/([a-z][a-z-]+)\/issues\/(\d+)/i;
	self.id = "issue-linker";

	return self;
};

IssueLinker.prototype.init = function(remarkable) {
	remarkable.inline.ruler.push(this.id, this.parse.bind(this));
	remarkable.renderer.rules[this.id] = this.render.bind(this);
};

IssueLinker.prototype.parse = function(state, silent) {
	var match = this.regex.exec(state.src.slice(state.pos));

	if (!match) {
		return false;
	}

	state.pos += match[0].length;

	if (silent) {
		return true;
	}

	state.push({
		type: this.id,
		level: state.level,
		match: {
			url: match[0],
			text: match[1] + "/" + match[2] + "#" + match[3]
		}
	});

	return true;
};

IssueLinker.prototype.render = function(tokens, id, options, env) {
	return "<a href=\"" + utils.escape(tokens[id].match.url) + "\" target=\"_blank\" class=\"github-issue\"><i class=\"fa fa-github\"></i>" + utils.escape(tokens[id].match.text) + "</a>";
};
