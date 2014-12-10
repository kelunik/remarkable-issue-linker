var remarkable = new (require("remarkable"))({linkify: true});
remarkable.use(require("../.")());

var output = remarkable.render("There's a new issue at GitHub: https://github.com/jonschlinkert/remarkable/issues/117");
var expect = '<p>There\'s a new issue at GitHub: <a href="https://github.com/jonschlinkert/remarkable/issues/117">jonschlinkert/remarkable#117</a></p>';

if(output != expect + "\n") {
	console.log(output);
	process.exit(1);
} else {
	console.log("\n    ---     all tests worked     ---   \n");
}
