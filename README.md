# Jio Front-End Prototype

Assuming you already have Node, Grunt and Bower installed: 
- clone the project, cd to directory
- run `npm install` 
- then `bower install`
- then `grunt init` - initial compile
- then `grunt` - to watch for changes and serve the dev folder on http://localhost:3000


### Grunt tasks:
Grunt tasks:

- `grunt init` - run this the first time you check out the project. Compiles SASS, wires up any bower dependencies and builds your icons for the first time
- `grunt` - (default task) runs a watch and Node server task concurrently. Dev folder can be browsed at http://localhost:3000
- `grunt build` - Will run the build task into the build folder
- `grunt serve` - Will serve up the build folder for you to preview
- `grunt serve:dev` - Serves up the dev folder, without running "watch"
- `grunt svg_icons` - Run the SVG icon task chain on it's own
- `grunt clean:temp` - Remove the temp directory via Grunt. Although `rm -fr .tmp` is quicker
- `grunt clean:build` - As above but for the build folder. Because the build task updates, rather than replaces files (for speed), you'll need this first if you want to start fresh.

### Server.js
You will need to add a new route here for any new HTML templates you add to your root dev folder.
- To do: set up some sort of dynamic routing

### EJS template rendering
The Node dev server is set up to render EJS templates on the fly, allowing the use of <% include file.html %> tags.
The grunt-ejs-render task will render these partials out into flat HTML files when running `grunt build`. Unforunately this plugin doesn't allow `files : { expand: true }`, so you will also have to add any new HTML templates as a new target to the "render" task definition, and then the build task chain in the Gruntfile. 

To do: Consider switching to a more flexible EJS plugin.

### Bootstrap
Twitter bootstrap-sass-official is included, and currently configured import CSS only.

To customise the SCSS parts of bootsrap that are imported, edit `dev/scss/bootstrap-custom.scss` and uncomment components as needed. At the moment only mixins, normalize (css reset), grid, responsive utilities, and helper classes are imported. The variables needed to adjust the grid have been copied into `dev/scss/variables.scss` from  `bower_components/bootstrap-sass-official/assets/stylesheets/bootsrap/variables.scss` - you will need to grab any extra vars for any other components you import from this file.
