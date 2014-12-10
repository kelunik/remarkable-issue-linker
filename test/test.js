var remarkable = new (require("remarkable"))({linkify: true});
remarkable.use(require("../.")());

var output = remarkable.render("There's a new issue at GitHub: https://github.com/jonschlinkert/remarkable/issues/117 and there's a file https://github.com/rdlowrey/amp-mysql/blob/master/composer.json#L10");
var expect = '<p>There\'s a new issue at GitHub: <a href="https://github.com/jonschlinkert/remarkable/issues/117">jonschlinkert / remarkable #117</a> and there\'s a file <a href="https://github.com/rdlowrey/amp-mysql/blob/master/composer.json#L10">composer.json:10 in rdlowrey / amp-mysql</a></p>';

if(output != expect + "\n") {
	console.log(output);
	process.exit(1);
} else {
	console.log("\n    ---     all tests worked     ---   \n");
}
