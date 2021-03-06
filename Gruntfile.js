module.exports = function(grunt) {

	// Load plugins
	require('load-grunt-tasks')(grunt);

	// If tasks are taking a long time, uncomment the below to get more info
	//require('time-grunt')(grunt);

	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),

		// -------------------------------------------------------------------------------------------------------------------
		// FOLDER PATHS (no trailing slash)
		// -------------------------------------------------------------------------------------------------------------------
		// Set the below paths to wherever your dev & build foflders are, e.g 'src', 'dist', 'public_html', whatever
		// Besides the name of your HTML includes folder, we'll assume everything else will follow this structure:
		// - css/
		// - fonts/
		// - images/ - as opposed to 'img' because Photoshop saves slices to an "images" folder
		// - js/
		// - scss/
		// NOTE: You must edit .bowerrc and change the bower_components directory to wherever your dev folder is
		paths: {
			dev: 'dev',
			build: 'build',
			html_includes: 'includes', // You might want to change this to 'html' or 'ejs' or whatever template language you use
			temp: '.tmp' // Here as an option but you probably don't want to change this
		},

		// -------------------------------------------------------------------------------------------------------------------
		// TASK CONFIGURATION
		// -------------------------------------------------------------------------------------------------------------------

		// DEV TASKS
		// ---------------------------------------
		// Inject bower components into index.html, in the right order
		// Works out dependencies based on the component's own bower.json 
		// - these are sometimes incomplete so you may need to add them here
		wiredep: {
			dev: {
				ignorePath : '../',
				src: [
					'<%=paths.dev%>/includes/html-footer.html'
				],
				options: {}
			},
			temp : {
				src: ['<%=paths.temp%>/*.html']
			}
		},

		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%=paths.dev%>/assets/css/style.css': '<%=paths.dev%>/assets/scss/style.scss'
				}
			}
		},

		jshint: {
			dev: {
				src: [
					'<%=paths.dev%>/js/**/*.js',
					'!<%=paths.dev%>/js/grunticon.loader.js'
				],
				options: {
					reporter: require('jshint-stylish') // Makes terminal output much more readable
				}
			}
		},

		// Minify SVG files
		// - Needs to run during dev as our embedded SVG CSS is generated by grunticon as we go along (below).
		svgmin: {
			dev: {
				files: [{
					expand: true,
					cwd: '<%=paths.dev%>/images/icons-svg-src/',
					src: ['*.svg'],
					dest: '<%=paths.dev%>/images/icons-svg-min'
				}]
			}
		},

		// grunticon
		// - Grabs all icons found in images/icons/svg-min
		// - Generates icon CSS file with embedded SVGs
		// - Generates fallback icon CSS file with embedded PNGs
		// - Generates fallback PNG files, and a bog standard CSS file containing image URLs
		// - Generates grunticon.loader.js, used in HTML <head> to load the correct CSS file (async, non-blocking)
		// - Nice!
		grunticon: {
			dev: {
				files: [{
					expand: true,
					cwd: '<%=paths.dev%>/images/icons-svg-min',
					src: '*.svg',
					dest: "<%=paths.dev%>"
				}],
				options: {
					template: '<%=paths.dev%>/scss/icons.hbs',
					defaultWidth: '16px',
					defaultHeight: '16px',
					datasvgcss	: 'css/icons-svg-embedded.css',
					datapngcss	: 'css/icons-png-embedded.css',
					urlpngcss	: 'css/icons-png-url.css',
					pngfolder	: 'images/icons-png/',
					pngpath		: '../images/icons-png', // image path used in png fallback css
					tmpDir		: '.tmp/grunticon-tmp'
				}
			}
		},

		// HOUSEKEEPING
		// ---------------------------------------
		clean: {
			grunticon: [
				'<%=paths.dev%>/preview.html', // We don't need the icon preview file littering up our root
				'<%=paths.dev%>/grunticon.loader.js' // This has already been copied to js/ and committed, so delete this
			],
			build: [
				'<%=paths.build%>'
			],
			temp: [
				'<%=paths.temp%>'
			]
		},

		// WATCH
		// ---------------------------------------
		watch: {	
			options: {
				interrupt: true,
				spawn: false
			},
			sass: {
				files: '<%=paths.dev%>/assets/**/*.scss',
				tasks: ['sass']
			},
			js: { 
				files: [
					'<%=paths.dev%>/**/*.js',
					'!<%=paths.dev%>/js/grunticon.loader.js'
				],
				tasks: ['newer:jshint'] // Run jshint on new files only
			},
			bower: { // bower.json will update when new components are installed
				files: 'bower.json',
				tasks: ['wiredep']
			},
			icons: { // Watch for any new icons added to svg-src
				files: '<%=paths.dev%>/images/icons-svg-src/*',
				tasks: ['svg_icons'],
				options: {
					interrupt: false // Interruptions on icons can cause the task to break.
				}
			}
		},

		// NODE SERVER
		// These defaults are useful for static HTML projects
		// If you're writing an actual NodeJS app, remove the included server.js and update config as needed.
		// ---------------------------------------
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					env : {
						ROOT_FOLDER : '<%=paths.dev%>',
						PORT: '3001'
					},
					ignore: [
						'Gruntfile.js',
						'node_modules/**',
						'**/bower_components/**',
						'<%=paths.dev%>/**/*.js',
						'<%=paths.temp%>/**/*.js',
						'<%=paths.build%>/**/*.js'
					],
				}
			},
			build: {
				script: 'server.js',
				options: {
					env : {
						ROOT_FOLDER : '<%=paths.build%>',
						PORT: '3000'
					},
					ignore: [
						'Gruntfile.js',
						'node_modules/**',
						'**/bower_components/**',
						'<%=paths.dev%>/**/*.js',
						'<%=paths.temp%>/**/*.js',
						'<%=paths.build%>/**/*.js'
					],
				}
			}
		},

		// CONCURRENT
		// - Run tasks in parallel. Prime example is having watch and nodemon running together
		// - Be wary - the CPU overhead for spawning concurrent tasks often negates any time savings made, so test it out
		// ---------------------------------------
		concurrent: {
			watch_serve: {
				tasks: ['watch', 'nodemon:dev'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		// BUILD TASKS
		// ---------------------------------------
		copy: {
			temp: {
				files: [{
					expand: true,
					cwd: '<%=paths.dev%>',
					src: [
						'**/*.*',
						'!**/scss/**',
						'!**/bower_components/**'
					],
					dest: '<%=paths.temp%>'
				}]
			},
			build: {
				files: [{
					expand: true,
					cwd: '<%=paths.temp%>',
					src: [
						'**/*.*',
						'!**/bower_components/**',
						'!**/*.css',
						'!**/*.js',
						'!**/*.{png,jpg,gif,svg}',
						'!<%=paths.html_includes%>',
						'js/grunticon.loader.js'
					],
					dest: '<%=paths.build%>'
				}]
			}
		},



		useminPrepare: {
			html: ['<%=paths.temp%>/*.html'], // Grabs CSS and JS refs within the build tags in these files
			options: {
				src: '<%=paths.temp%>',
				dest: '<%=paths.build%>'
			}
		},

		usemin: {
			html: ['<%=paths.build%>/*.html'] // only update HTML files in root folder
		},

		imagemin: {
			build: {
				options: {
					//cache: false,
					optimizationLevel: 7,
					pngquant: true,
					progressive: true
				},
				files: [{
					expand: true,
					cwd: '<%=paths.temp%>',
					src: ['**/*.{png,jpg,gif}'],
					dest: '<%=paths.build%>'
				}]
			}
		},

		cssmin : {
			build : {
				files: [{
					expand: true,
					cwd: '<%=paths.temp%>/css/',
					src: ['*.css', '!style.css'],
					dest: '<%=paths.build%>/css/',
					ext: '.css'
				}]
			}
		},

//IMP	// Render out EJS template tags in the below HTML files to temp folder
		render: {
			home : {
				options: {
					data : {
						//'env' : 'Build',
						'title' : 'Home',
						'location' : 'delhi'
					}
				},
				files: {
					'<%=paths.temp%>/index.html': ['<%=paths.dev%>/index.html']
				}
			},	
						
		}
	
	});
	
	// -------------------------------------------------------------------------------------------------------------------
	// TASK REGISTRATION
	// -------------------------------------------------------------------------------------------------------------------

	// SUB TASK CHAINS
	// ---------------------------------------
	// Groups of tasks that either:
	// - must always be chained together in series, OR
	// - concurrent ones that can run in parallel
	// Chains defined here so they can be called in tasks further down
	//grunt.registerTask('serve_watch', ['concurrent:watch', 'concurrent:nodemon']);
	grunt.registerTask('svg_icons', [
		'newer:svgmin:dev', 
		'grunticon:dev', 
		'clean:grunticon'
	]);

	// INIT TASK
	// ---------------------------------------
	// "grunt init" MUST be run when project is checked out for the first time.
	// If you run "grunt build" and have never done "grunt init", your output might be broken.
	grunt.registerTask('init', [
		'wiredep:dev',
		'sass:dev', 
		'jshint:dev',
		'svg_icons'
	]);

	// DEFAULT TASK
	// --------------------------------------- 
	// - Runs watch and node server in parallel
	// Watch will:
	// - Compile SCSS to CSS in dev 
	// - Run jshint on new files only
	// - Keep an eye on your icons folder and compile new icon CSS and images as needed
	// Host will:
	// - Run a node server on dev folder with EJS template support
	// - If you don't want a server running, just run "grunt watch" instead
	grunt.registerTask('default', ['concurrent:watch_serve']);

	// Standalone server tasks. 
	// Run 'grunt serve' to check out your build folder in the browser.
	grunt.registerTask('serve:dev', ['nodemon:dev']);
	grunt.registerTask('serve', ['nodemon:build']);

	// -------------------------------------------------------------------------------------------------------------------
	// BUILD TASK
	// -------------------------------------------------------------------------------------------------------------------
	
	// Some tasks depend on output from previous tasks, e.g:
	// - Compiling ejs templates and includes into a single HTML file
	// - then running usemin on HTML to change file references to minified versions

	// It's better for those tasks to not know about one another, that way: 
	// - They can have a more standardised configuration
	// - They can be added to / removed from task chains more easily 
	// - And we therefore have much more reusability in this file.

	// Therefore the build process is broken into 2 steps - copy/process from dev->temp and then copy/process from temp->build
	// For consistency always add new tasks to temp->build when possible. Add any extra 'pre-processing' tasks to dev->temp as and when needed.

	// These two build sub-tasks are then combined at the bottom into "grunt build" - that's the one you want to run.

	// DEV TO TEMP
	grunt.registerTask('build_dev_to_temp', [
		// Any extra processes that need to happen first go here
		// e.g concatenating Node EJS templates into a single, flat HTML file
		// Or vendor prefixing sass output before minification?
		'render:home',
		
		
		// Copy any remaining files from dev->temp. 
		// - Any files processed by previous tasks in this chain will need to be excluded in the copy:temp task configuration above
		'newer:copy:temp',
	]);

	// TEMP TO BUILD
	grunt.registerTask('build_temp_to_build', [
		// Your build tasks
		'wiredep:temp',
		'useminPrepare', // Generates concat, cssmin and uglify task configs on the fly
		
		// Output from the below generated tasks is sent to build folder
		'concat:generated',
  		'cssmin:generated',
  		'uglify:generated',

  		// Run imagemin on new files only
  		'newer:imagemin:build',
  		'newer:cssmin:build', // Copy icon css over. you can remove this if you aren't using grunticon

		// Copy any remaining files to build. You will again need to exclude any files that have been processed in the copy:build task configuration
		'newer:copy:build',

		// Finally, usemin runs on the HTML files in build folder
		'usemin',
	]);

	// COMBINED BUILD TASK
	grunt.registerTask('build', ['build_dev_to_temp', 'build_temp_to_build']);

};