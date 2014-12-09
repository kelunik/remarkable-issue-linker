var remarkable = new (require("remarkable"))();
remarkable.use(require("../lib/issue-linker")());

var output = remarkable.render("There's a new issue at GitHub: https://github.com/jonschlinkert/remarkable/issues/117");

if(output !== '<p>There\'s a new issue at GitHub: <a href="https://github.com/jonschlinkert/remarkable/issues/117" target="_blank"><i class="fa fa-github"></i>jonschlinkert/remarkable#117</a>17</p>') {
	console.log(output);
	process.exit(1);
}
