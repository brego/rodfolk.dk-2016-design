(function() {
    'use strict';

    var paths = require('./package.json').paths;
    var conf  = require('./package.json').localConfig;
    var gulp  = require('gulp');
    var $     = require('gulp-load-plugins')({
        pattern: [
            'gulp-*', 'gulp.*', 'del', 'mkdirp', 'run-sequence'
        ],
        rename: {
            'gulp-scss-lint':         'sassLint',
            'gulp-scss-lint-stylish': 'sassLintStylish'
        },
        replaceString: /\bgulp[\-.]/
    });
    try {
        $.browserSync = require('browser-sync').create();
    } catch (e) {
        $.browserSync = {
            stream: function() {
                var through = require('through2');
                return through.obj(function(file, encoding, callback) {
                    callback(null, file);
                });
            }
        };
    }

    var changeEvent = function(event) {
        var gutil = require('gulp-util');
        gutil.log(
            'File',
            gutil.colors.yellow(event.path.replace(__dirname, '')),
            'was',
            gutil.colors.blue(event.type)
        );
    };

    gulp.task('default', ['help']);
    gulp.task('help', $.taskListing);

    /**
    * Server task
    */

    gulp.task('serve', ['build'], function() {
        $.browserSync.init({
            server: {
                baseDir: paths.build.base,
            },
            port:    1337,
            open:    false,
            browser: 'default',
            notify:  false
        });

        watchStyles();
        watchFonts();
        watchScripts();
        watchImages();
        watchIcons();
        watchHtml();
    });

    /**
    * Watcher tasks
    */

    gulp.task('watch', [
        'watch:styles',
        'watch:fonts',
        'watch:scripts',
        'watch:images',
        'watch:icons',
        'watch:html'
    ]);

    gulp.task('watch:styles',    ['build:styles', 'lint:styles'],   watchStylesLint);
    gulp.task('watch:fonts',     ['build:fonts'],                   watchFonts);
    gulp.task('watch:scripts',   ['build:scripts', 'lint:scripts'], watchScriptsLint);
    gulp.task('watch:images',    ['build:images'],                  watchImages);
    gulp.task('watch:icons',     ['build:icons'],                   watchIcons);
    gulp.task('watch:html',      ['build:html'],                    watchHtml);

    function watchStyles (cb)     { _watchStyles(cb); }
    function watchStylesLint (cb) { _watchStyles(cb, true); }
    function _watchStyles (cb, lint) {
        var tasks = ['build:styles'];
        if (lint) tasks.push('lint:styles');
        gulp.watch([
            paths.source.styles + "**/*.scss"
        ], tasks)
            .on('change', changeEvent);
        if (cb) cb();
    }
    function watchFonts (cb) {
        var tasks = ['build:fonts'];
        gulp.watch([
            paths.source.fonts + '**/*.eot',
            paths.source.fonts + '**/*.ttf',
            paths.source.fonts + '**/*.woff',
            paths.source.fonts + '**/*.woff2'
        ], tasks)
            .on('change', changeEvent);
        if (cb) cb();
    }
    function watchScripts (cb)     { _watchScripts(cb); }
    function watchScriptsLint (cb) { _watchScripts(cb, true); }
    function _watchScripts (cb, lint) {
        var tasks = ['build:scripts'];
        if (lint) tasks.push('lint:scripts');
        gulp.watch([
            paths.source.scripts + "**/*.js"
        ], tasks)
            .on('change', changeEvent);
        if (cb) cb();
    }
    function watchImages (cb) {
        gulp.watch([
            paths.source.images + "**/*.jpg",
            paths.source.images + "**/*.png"
        ], ['build:images'])
            .on('change', changeEvent);
        if (cb) cb();
    }
    function watchIcons (cb) {
        gulp.watch([
            paths.source.icons + "**/*.png",
            paths.source.icons + "**/*.ico",
            paths.source.icons + "**/*.xml",
            paths.source.icons + "**/*.json",
            paths.source.icons + "**/*.svg"
        ], ['build:icons'])
            .on('change', changeEvent);
        if (cb) cb();
    }
    function watchHtml (cb) {
        gulp.watch([
            paths.source.html + '**/*.html',
            paths.source.html + '**/*.php'
        ], ['build:html'])
            .on('change', changeEvent);
        if (cb) cb();
    }

    /**
    * Build tasks
    */

    gulp.task('build', [
        'build:styles',
        'build:fonts',
        'build:scripts',
        'build:images',
        'build:icons',
        'build:html'
    ]);
    gulp.task('build:styles',  buildStyles);
    gulp.task('build:fonts',   buildFonts);
    gulp.task('build:scripts', buildScripts);
    gulp.task('build:images',  buildImages);
    gulp.task('build:icons',   buildIcons);
    gulp.task('build:html',    buildHtml);

    function buildStyles (cb) {
        $.mkdirp(paths.build.styles);

        gulp.src(paths.source.styles + '**/*.scss')
            .pipe($.plumber())
            .pipe($.sourcemaps.init())
            .pipe($.sass({
                style: 'compressed',
                includePaths: require('node-bourbon').includePaths
            }))
            .pipe($.autoprefixer(conf.autoprefixer))
            .pipe(gulp.dest(paths.build.styles))
            .pipe($.minifyCss())
            .pipe($.rename({suffix: '.min'}))
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest(paths.build.styles))
            .pipe($.browserSync.stream({match: '**/*.css'}));

        cb();
    }
    function buildFonts(cb) {
        gulp.src([
            paths.source.fonts + '**/*.eot',
            paths.source.fonts + '**/*.ttf',
            paths.source.fonts + '**/*.woff',
            paths.source.fonts + '**/*.woff2'
        ])
            .pipe($.plumber())
            .pipe(gulp.dest(paths.build.fonts))
            .pipe($.browserSync.stream());

        cb();
    }
    function buildScripts (cb) {
        $.mkdirp(paths.build.scripts);
        gulp.src(paths.source.scripts + '**/*.js')
            .pipe($.plumber())
            .pipe($.sourcemaps.init())
            .pipe(gulp.dest(paths.build.scripts))
            .pipe($.uglify({
                preserveComments: 'some' // Should be 'license', but that's dead
            }))
            .pipe($.rename({suffix: '.min'}))
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest(paths.build.scripts))
            .pipe($.browserSync.stream());
        cb();
    }
    function buildImages (cb) {
        $.mkdirp(paths.build.images);
        gulp.src(paths.source.images + '**/*')
            .pipe($.plumber())
            .pipe(gulp.dest(paths.build.images))
            .pipe($.browserSync.stream());
        cb();
    }
    function buildIcons (cb) {
        gulp.src(paths.source.icons + '**/*')
            .pipe(gulp.dest(paths.build.base))
            .pipe($.browserSync.stream());
        cb();
    }
    function buildHtml (cb) {
        gulp.src([
            paths.source.html + '**/*.html',
            paths.source.html + '**/*.xml',
            paths.source.html + '**/*.php'
        ])
            .pipe($.plumber())
            .pipe(gulp.dest(paths.build.html))
            .pipe($.browserSync.stream());
        cb();
    }

    /**
    * Lint tasks
    */

    gulp.task('lint',         ['lint:scripts', 'lint:styles']);
    gulp.task('lint:scripts', lintScripts);
    gulp.task('lint:styles',  lintStyles);

    function lintScripts (cb) {
        gulp.src([
            paths.source.scripts + '**/*.js',
            '!**/external/*.js'
        ])
            .pipe($.plumber())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'));
        cb();
    }
    function lintStyles (cb) {
        gulp.src(paths.source.styles + '**/*.scss')
        .pipe($.plumber())
        .pipe($.sassLint({
            config: '.scss-lint.yml',
            customReport: $.sassLintStylish
        }));
        cb();
    }

    /**
    * Cleanup tasks
    */

    gulp.task('clean',         cleanAll);
    gulp.task('clean:scripts', cleanScripts);
    gulp.task('clean:styles',  cleanStyles);
    gulp.task('clean:fonts',   cleanFonts);
    gulp.task('clean:images',  cleanImages);
    gulp.task('clean:icons',   cleanIcons);
    gulp.task('clean:html',    cleanHtml);

    function cleanAll (cb) {
        $.del([
            paths.build.base + '**/*'
        ], cb);
    }
    function cleanScripts (cb) {
        $.del([
            paths.build.scripts + '**/*.js',
            paths.build.scripts + '**/*.map'
        ], cb);
    }
    function cleanStyles (cb) {
        $.del([
            paths.build.styles + '*'
        ], cb);
    }
    function cleanFonts (cb) {
        $.del([
            paths.build.fonts + '*'
        ], cb);
    }
    function cleanImages (cb) {
        $.del([
            paths.build.images + '*',
            paths.build.html   + '**/*.ico'
        ], cb);
    }
    function cleanIcons (cb) {
        $.del([
            paths.build.base   + '**/*.ico',
            paths.build.base   + '**/*.jpg',
            paths.build.base   + '**/*.png'
        ], cb);
    }
    function cleanHtml (cb) {
        $.del([
            paths.build.html + '**/*.html',
            paths.build.html + '**/*.php'
        ], cb);
    }

})();
