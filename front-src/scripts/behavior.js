/* jshint freeze:false */
(function(doc, win) {
    var addEvent         = 'addEventListener';
    var getByTag         = 'getElementsByTagName';
    var getByClass       = 'getElementsByClassName';
    var type             = 'gesturestart';
    var qsa              = 'querySelectorAll';
    var fix_viewport     = null;
    var fix_links        = null;
    var fix_members_flex = null;
    var load_ga          = null;
    var get_script       = null;
    var add_class        = null;
    var remove_class     = null;
    var has_class        = null;
    var toggle_class     = null;
    var debounce         = null;
    var document_ready   = null;
    var scales           = [1, 1];
    var meta             = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
    var links            = doc[getByTag]('a');
    // var font_families    = ['Lato:400,900:latin', 'Permanent+Marker::latin'];
    var font_families    = ['Lato:400,900:latin', 'PT+Sans:700:latin'];
    var html             = doc[getByTag]('html')[0];
    var body             = doc[getByTag]('body')[0];

    document_ready = function (callback) {
        var readyList                   = [];
        var readyFired                  = false;
        var readyEventHandlersInstalled = false;

        function ready() {
            if (!readyFired) {
                readyFired = true;
                for (var i = 0; i < readyList.length; i++) {
                    readyList[i].fn.call(win);
                }
                readyList = [];
            }
        }
        function readyStateChange() {
            if (doc.readyState === "complete") {
                ready();
            }
        }

        if (readyFired) {
            setTimeout(function() {callback();}, 1);
            return;
        } else {
            readyList.push({fn: callback});
        }
        if (doc.readyState === "complete" || (!doc.attachEvent && doc.readyState === "interactive")) {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            if (doc.addEventListener) {
                doc.addEventListener("DOMContentLoaded", ready, false);
                win.addEventListener("load", ready, false);
            } else {
                doc.attachEvent("onreadystatechange", readyStateChange);
                win.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };

    get_script = function (options) {
        var script = doc.createElement('script');
        var prior  = doc[getByTag]('script')[0];
        script.async = 1;
        prior.parentNode.insertBefore(script, prior);

        script.onload = script.onreadystatechange = function( _, isAbort ) {
            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
                script.onload = script.onreadystatechange = null;
                script = undefined;

                if (!isAbort) {
                    options.success();
                }
            }
        };

        script.src = options.url;
    };

    add_class = function (el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    };

    remove_class = function (el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(
                new RegExp('(?:^|\\s)' + className + '(?!\\S)'),
                ''
            );
        }
    };

    has_class = function (el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        } else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
    };

    toggle_class = function (el, className) {
        if (has_class(el, className)) {
            remove_class(el, className);
        } else {
            add_class(el, className);
        }
    };

    debounce = function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };

    // Google font loader
    get_script({
        dataType: 'script',
        url:      'http://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js',
        cache:    true,
        success: function() {
            win.WebFont.load({
                google: {
                    families: font_families
                },
                timeout: 3000
            });
        }
    });

    // By @mathias, @cheeaun and @jdalton
    // https://gist.github.com/mathiasbynens/901295
    // iOS viewport scaling bug
    fix_viewport = function() {
        meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
        doc.removeEventListener(type, fix_viewport, true);
    };
    if ((meta = meta[meta.length - 1]) && addEvent in doc) {
        fix_viewport();
        scales = [0.25, 1.6];
        doc[addEvent](type, fix_viewport, true);
    }

    // Those mailto links
    fix_links = function() {
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.indexOf(' indsaet-snabel-a-her ') !== -1) {
                links[i].href = links[i].href.replace(' indsaet-snabel-a-her ', '@');
                links[i].href = links[i].href.replace('denne-sides-adresse', window.location.host);
            }
        }
    };

    // Google Analytics loader
    load_ga = function (uid) {
        get_script({
            dataType: 'script',
            url:      'http://www.google-analytics.com/ga.js',
            cache:    true,
            success: function() {
                try {
                    var t;
                    if (!(win._gat && win._gat._getTracker)) {
                        throw 'Tracker has not been defined';
                    }
                    t = win._gat._getTracker(uid);
                    t._trackPageview();
                } catch(e) {}
            }
        });
    };

    // fix_members_flex = function() {
    //     var members = doc[getByClass]('members');
    //     var dud     = doc.createElement('li');
    //     dud.style.height  = '0px';
    //     dud.style.padding = '0px';
    //     members[0].appendChild(dud);
    // };

    // DOCUMENT LOAD
    document_ready(function() {

        // Fix mailto links
        fix_links();

        setTimeout(function() {
            if (!win.WebFont) {
                add_class(html, 'wf-inactive');
            }
        }, 2000);

        // Load Google Analytics
        load_ga('UA-7594481-5');

        doc.getElementById('menu-icon').addEventListener('click', function(e) {
            toggle_class(doc.documentElement, 'menu-open');
            e.preventDefault();
        });

        // fix_members_flex();

        // var countdown = new Countdown({
        //     selector:     '#countdown-wrap',
        //     msgPattern:   doc.getElementById('countdown-wrap').innerHTML,
        //     dateEnd:      new Date('2016-03-19T14:00:00'),
        //     leadingZeros: true
        // });
        //
        // var explanationVideo = doc.getElementById('explanation-video');
        // var button           = doc.getElementById('what-is-rod-video');
        //
        // button.onclick = function(event) {
        //     if (has_class(explanationVideo, 'visible')) {
        //         remove_class(explanationVideo, 'visible');
        //     } else {
        //         add_class(explanationVideo, 'visible');
        //     }
        //     event.preventDefault();
        // };
    });
} (document, window));

/* jshint ignore:start */

/*!
* Countdown.js by HugoGiraudel
* Modified by <brego> for template use
* @link: https://github.com/HugoGiraudel/Countdown.js
* @license: MIT
*/
(function(global) {
    "use strict";

    // Vanilla JS alternative to $.extend
    global.extend = function (obj, extObj) {
        obj = obj || {};
        if (arguments.length > 2) {
            for (var a = 1; a < arguments.length; a++) {
                global.extend(obj, arguments[a]);
            }
        } else {
            for (var i in extObj) {
                obj[i] = extObj[i];
            }
        }
        return obj;
    };

    // Countdown constructor
    var Countdown = function (conf) {
        this.conf = global.extend({
            // Dates
            dateStart:    new Date(),
            dateEnd:      new Date(),

            // Default elements
            selector:     "",

            // Messages
            msgBefore:    "",
            msgAfter:     "",
            msgPattern:   "",

            // Callbacks
            onStart:      null,
            onEnd:        null,

            // Extra options
            leadingZeros: false,
            initialize:   true
        }, conf);

        // Private variables
        this.started  = false;
        this.selector = document.querySelectorAll(this.conf.selector);
        this.interval = 1000;
        this.patterns = [
            { pattern: "{years}",   secs: 31536000 },
            { pattern: "{months}",  secs: 2628000 },
            { pattern: "{weeks}",   secs: 604800 },
            { pattern: "{days}",    secs: 86400 },
            { pattern: "{hours}",   secs: 3600 },
            { pattern: "{minutes}", secs: 60 },
            { pattern: "{seconds}", secs: 1 }
        ];

        if (this.selector[0].nodeName === 'SCRIPT') {
            var placeholder = document.createElement("div");
            var orgId       = this.selector[0].id;
            var orgClass    = this.selector[0].className;
            this.selector[0].parentNode.replaceChild(placeholder, this.selector[0]);
            placeholder.id        = orgId;
            placeholder.className = orgClass;
            this.selector         = [placeholder];
        }

        // Doing all the things!
        if (this.initialize !== false) {
            this.initialize();
        }
    };

    // Initializing the instance
    Countdown.prototype.initialize = function () {
        this.defineInterval();

        // Already over
        if (this.isOver()) {
            return this.outOfInterval();
        }

        this.run();
    };

    // Converting a date into seconds
    Countdown.prototype.seconds = function (date) {
        return date.getTime() / 1000;
    };

    // Returning if countdown has started yet
    Countdown.prototype.isStarted = function () {
        return this.seconds(new Date()) >= this.seconds(this.conf.dateStart);
    };

    // Returning if countdown is over yet
    Countdown.prototype.isOver = function () {
        return this.seconds(new Date()) >= this.seconds(this.conf.dateEnd);
    };

    // Running the countdown
    Countdown.prototype.run = function () {
        var that = this,
        sec  = Math.abs(this.seconds(this.conf.dateEnd) - this.seconds(new Date())),
        timer;

        // Initial display before first tick
        if (this.isStarted()) {
            this.display(sec);
        }

        // Not started yet
        else {
            this.outOfInterval();
        }

        // Vanilla JS alternative to $.proxy
        timer = global.setInterval(function () {
            sec--;

            // Time over
            if (sec <= 0) {
                global.clearInterval(timer);
                that.outOfInterval();
                that.callback("end");
            }

            else if (that.isStarted()) {
                if (!that.started) {
                    that.callback("start");
                    that.started = true;
                }

                that.display(sec);
            }
        }, this.interval);
    };

    // Displaying the countdown
    Countdown.prototype.display = function (sec) {
        var output = this.conf.msgPattern;

        for (var b = 0; b < this.patterns.length; b++) {
            var currentPattern = this.patterns[b];

            if (this.conf.msgPattern.indexOf(currentPattern.pattern) !== -1) {
                var number = Math.floor(sec / currentPattern.secs),
                displayed = this.conf.leadingZeros && number <= 9 ? "0" + number : number;
                sec -= number * currentPattern.secs;
                output = output.replace(currentPattern.pattern, displayed);
            }
        }

        for (var c = 0; c < this.selector.length; c++) {
            this.selector[c].innerHTML = output;
        }
    };

    // Defining the interval to be used for refresh
    Countdown.prototype.defineInterval = function () {
        for (var e = this.patterns.length; e > 0; e--) {
            var currentPattern = this.patterns[e-1];

            if (this.conf.msgPattern.indexOf(currentPattern.pattern) !== -1) {
                this.interval = currentPattern.secs * 1000;
                return;
            }
        }
    };

    // Canceling the countdown in case it's over
    Countdown.prototype.outOfInterval = function () {
        var message = new Date() < this.conf.dateStart ? this.conf.msgBefore : this.conf.msgAfter;

        for (var d = 0; d < this.selector.length; d++) {
            if (this.selector[d].innerHTML !== message) {
                this.selector[d].innerHTML = message;
            }
        }
    };

    // Dealing with events and callbacks
    Countdown.prototype.callback = function (event) {
        var e = event.capitalize();

        // onStart callback
        if (typeof this.conf["on" + e] === "function") {
            this.conf["on" + e]();
        }
    };

    // Adding a capitalize method to String
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    global.Countdown = Countdown;
}(window));
