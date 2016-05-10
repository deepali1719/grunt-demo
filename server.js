// load the things we need
var express = require('express');
var app = express();


// Register ejs as .html. If we did
// not call this, we would need to
// name our views foo.ejs instead
// of foo.html. The __express method
// is simply a function that engines
// use to hook into the Express view
// system by default, so if we want
// to change "foo.ejs" to "foo.html"
// we simply pass _any_ function, in this
// case `ejs.__express`.

app.engine('.html', require('ejs').__express);

// Set to wherever your dev templates live
//var root_dir = './dev';
var root_dir = './'+process.env.ROOT_FOLDER;
app.set('views', root_dir);


// Add routes to your HTML templates as needed
app.get(['/', '/index.html'], function(req, res){
	res.render('index.html', {
		data : {
			env : process.env.ROOT_FOLDER,
			title : 'Home',
			location : 'delhi'
		}
	});
});


// Register a static route to the dev folder
app.use(express.static(root_dir));

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Hosting '+process.env.ROOT_FOLDER+'/');
console.log('http://localhost:'+port);