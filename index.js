var Autolinker = require('autolinker');
var LINK_SCAN_RE = /www|@|\:\/\//;

function isLinkOpen(str) {
	return /^<a[>\s]/i.test(str);
}

function isLinkClose(str) {
	return /^<\/a\s*>/i.test(str);
}

function createLinkifier() {
	var links = [];
	var autolinker = new Autolinker({
		stripPrefix: false,
		url: true,
		email: true,
		twitter: false,
		replaceFn: function(autolinker, match) {
			// Only collect matched strings but don't change anything.
			switch (match.getType()) {
				/*eslint default-case:0*/
				case 'url':
					links.push({
						text: match.matchedText,
						url: match.getUrl()
					});
					break;
				case 'email':
					links.push({
						text: match.matchedText,
						url: 'mailto:' + match.getEmail().replace(/^mailto\:/i, "")
					});
					break;
			}

			return false;
		}
	});
	return {
		links: links,
		autolinker: autolinker
	};
}

module.exports = IssueLinker;

function IssueLinker() {
	var self = function(remarkable, options) {
		self.options = options;
		self.init(remarkable);
	};
	self.__proto__ = IssueLinker.prototype;
	self.issueRegex = /https?:\/\/github\.com\/([a-z][a-z-]+)\/([a-z][a-z-]+)\/issues\/(\d+)/i;

	// see http://stackoverflow.com/a/12093994/2373138
	self.fileRegex = "^https?:\\/\\/github\\.com\\/([a-z0-9][a-z0-9\\-]+)\\/([a-z0-9][a-z0-9-]+)\\/blob\\/";
	var branch = "([a-z0-9\\-.]+)";
	self.fileRegex = new RegExp(self.fileRegex + branch + "\\/([a-z0-9\\/\\-\\._]+)(#L(\\d+))?$", "i");

	self.id = "linkify";
	return self;
};

IssueLinker.prototype.init = function(remarkable) {
	remarkable.core.ruler.at('linkify', this.parse.bind(this));
};

IssueLinker.prototype.parse = function(state, silent) {
	var i, j, l, tokens, token, text, nodes, ln, pos, level, htmlLinkLevel,
	blockTokens = state.tokens,
	linkifier = null,
	links, autolinker, textReplace = null;

	if (!state.options.linkify) {
		return;
	}

	for (j = 0, l = blockTokens.length; j < l; j++) {
		if (blockTokens[j].type !== 'inline') {
			continue;
		}
		tokens = blockTokens[j].children;
		htmlLinkLevel = 0;
		for (i = tokens.length - 1; i >= 0; i--) {
			token = tokens[i];
			if (token.type === 'link_close') {
				i--;
				while (tokens[i].level !== token.level && tokens[i].type !== 'link_open') {
					i--;
				}
				continue;
			}
			if (token.type === 'htmltag') {
				if (isLinkOpen(token.content) && htmlLinkLevel > 0) {
					htmlLinkLevel--;
				}
				if (isLinkClose(token.content)) {
					htmlLinkLevel++;
				}
			}
			if (htmlLinkLevel > 0) {
				continue;
			}
			if (token.type === 'text' && LINK_SCAN_RE.test(token.content)) {
				if (!linkifier) {
					linkifier = createLinkifier();
					links = linkifier.links;
					autolinker = linkifier.autolinker;
				}
				text = token.content;
				links.length = 0;
				autolinker.link(text);
				if (!links.length) {
					continue;
				}
				nodes = [];
				level = token.level;
				for (ln = 0; ln < links.length; ln++) {
					if (!state.inline.validateLink(links[ln].url)) {
						continue;
					}

					var match = this.issueRegex.exec(links[ln].url);

					if (match) {
						textReplace = match[1] + "/" + match[2] + "#" + match[3];
					} else {
						var match = this.fileRegex.exec(links[ln].url);

						if (match) {
							textReplace = match[4] + (match[6] ? ":" + match[6] : "") + " @ " + match[1] + " / " + match[2] + (match[3] === "master" ? "" : " @ " + match[3]);
						} else {
							textReplace = null;
						}
					}

					pos = text.indexOf(links[ln].text);
					if (pos) {
						level = level;
						nodes.push({
							type: 'text',
							content: text.slice(0, pos),
							level: level
						});
					}
					nodes.push({
						type: 'link_open',
						href: links[ln].url,
						title: '',
						level: level++
					});
					nodes.push({
						type: 'text',
						content: textReplace || links[ln].text,
						level: level
					});
					nodes.push({
						type: 'link_close',
						level: --level
					});
					text = text.slice(pos + links[ln].text.length);
				}
				if (text.length) {
					nodes.push({
						type: 'text',
						content: text,
						level: level
					});
				}
				// replace current node
				blockTokens[j].children = tokens = [].concat(tokens.slice(0, i), nodes, tokens.slice(i + 1));
			}
		}
	}
};
