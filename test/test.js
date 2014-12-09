var remarkable = new (require("remarkable"))();
remarkable.use(require("../lib/issue-linker")());

var output = remarkable.render("There's a new issue at GitHub: https://github.com/jonschlinkert/remarkable/issues/117");
var expect = '<p>There\'s a new issue at GitHub: <a href="https://github.com/jonschlinkert/remarkable/issues/117" target="_blank"><i class="fa fa-github"></i>jonschlinkert/remarkable#117</a></p>';

if(output !== expect) {
	console.log(output);
	process.exit(1);
}
