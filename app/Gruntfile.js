
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		less: {
			development: {
				files: {
					'css/dist/app.css': 'css/src/app.less'
				}
			}
		},
		watch: {
			css: {
				files: ['css/src/**/*.less'],
				tasks: ['less']
			},
			javascripts: {
				files: ['js/src/**/*.js'],
				tasks: ['jshint', 'concat']
			},
			dests: {
				files: ['js/dist/**/*.js', 'css/dist/**/*.css', 'views/**/*.html', 'index.html'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			all: ['js/src/**/**.js'],
			options: {
				curly: false,
				newcap: true,
				quotmark: 'single',
				camelcase: true,
				predef: ['angular']
			}
		},
		concat: {
			dist: {
				src: ['js/src/**/*.js'],
				dest: 'js/dist/app.js'
			}
		}
	});

	grunt.registerTask('compile', ['less', 'jshint', 'concat']);
};