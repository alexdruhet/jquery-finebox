/**
 * jQuery.fineBox - Another lightbox plugin.
 * Date: 13/12/2011
 * @author Alex Druhet
 * @version 0.4
 **/
/*global jQuery: false, log: true */
/*jslint browser: true, plusplus: true, devel: true */

(function ($) {
    // 'use strict';

    // Adds inView selector
    $.extend($.expr[':'], {
        inView: function (a) {
            var st = (document.documentElement.scrollTop || document.body.scrollTop),
                ot = Math.round($(a).offset().top),
                wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();
            return !(ot > (wh - st) || ($(a).height() + ot) < st);
        }
    });

    // Indicator class
    function Indicator($parent) {
        this.$indicator = $('<span/>', {
            'class': 'indicator',
            'style': 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-position: center center;'
        });
        this.$parent = $parent.css('position', 'relative');
    }
    Indicator.prototype.add = function (cssObj) {
        this.$indicator.hide().css(cssObj).prependTo(this.$parent).fadeTo('fast', 0.75);
    };
    Indicator.prototype.remove = function () {
        this.$indicator.fadeOut('fast').remove();
    };

    // fineBox object declaration
    var fineBox = {

        // Misc vars (flags, etc.)
        isLoaded: false,
        isLoading: false,
        isOpened: false,
        isOpening: false,
        enableSlideShow: false,
        isIE: jQuery.browser.msie,
        isIE6: (jQuery.browser.msie && jQuery.browser.version < 7),

        // Cached jQ objects
        $current : {},
        $overlay : {},
        $wrapper : {},
        $container : {},

        hook : function (fn) {
            // ;;; log('hook', this, arguments, fn, typeof fineBox.publics[fn], typeof fineBox[fn]);

            if (fn && typeof fn === 'string') {
                if (fineBox.publics[fn] && typeof fineBox.publics[fn] === 'function') {
                    return fineBox.publics[fn].apply(this, Array.prototype.slice.call(arguments, 1));
                } else if (fineBox[fn] && typeof fineBox[fn] === 'function') {
                    return fineBox[fn].apply(this, Array.prototype.slice.call(arguments, 1));
                }
            }
        },

        isImage : function (url) {
            return (/\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i).test(url);
        },

        fixIELacks : function () {
            // ;;; log('fixIELacks', this, arguments);

            // Implements Array.indexOf method
            if (!Array.indexOf) {
                Array.prototype.indexOf = function (obj, start) {
                    var i;
                    for (i = (start || 0); i < this.length; i++) {
                        if (this[i] === obj) {
                            return i;
                        }
                    }
                    return -1;
                };
            }

            // Fix body height
            if (fineBox.isIE6) {
                $('body').css('height', '100%');
            }
        },

        setMessage : function (message, level, $parent) {
            // ;;; log('setMessage', this, arguments);

            var options = fineBox.publics.getOptions();
            $('<div/>', {
                'class': options.prefix + '-message',
                'style': 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; line-height: ' + $parent.height() + 'px;'
            }).html('<span class="' + options.prefix + '-' + level + '">' + message + '</span>').hide().prependTo($parent).fadeIn('fast', function () {
                $(this).delay(options.messageDelay).fadeOut('slow', function () {
                    $(this).remove();
                });
            });
        },

        getBiggestInFragment : function ($fragment) {
            // ;;; log('getBiggestInFragment', this, arguments);

            var maxW = 0,
                $this,
                $img;

            $('img', $fragment).each(function () {
                $this = $(this);
                maxW = Math.max(maxW, $this.width());
                if ($this.width() >= maxW) {
                    $img = $this;
                }
            });

            if ($img) {
                return $img;
            }
            return false;
        },

        freezeWindowScroll : function () {
            // ;;; log('freezeWindowScroll', this, arguments, $('body').width(), $('html').width());

            $('body').css('width', document.documentElement.clientWidth);
            $('html').css({
                'overflow': 'hidden',
                'max-height': '100%'
            }).scrollTop(fineBox.$overlay.data('fineBox').scrollY).scrollLeft(fineBox.$overlay.data('fineBox').scrollX);

            if (typeof fineBox.$overlay.data('fineBox').options.hookFreezeWindowScroll === 'function') {
                fineBox.$overlay.data('fineBox').options.hookFreezeWindowScroll.apply(fineBox, [fineBox.$overlay.data('fineBox')]);
            }

        },

        unfreezeWindowScroll : function () {
             // ;;; log('unfreezeWindowScroll', this, arguments, $('body').width(), $('html').width());

            $('body').css('width', '100%');
            $('html').css({
                'overflow': 'auto',
                'max-height': 'none',
                'width': '100%'
            }).add('body').scrollTop(fineBox.$overlay.data('fineBox').scrollY).scrollLeft(fineBox.$overlay.data('fineBox').scrollX);

            if (typeof fineBox.$overlay.data('fineBox').options.hookUnfreezeWindowScroll === 'function') {
                fineBox.$overlay.data('fineBox').options.hookUnfreezeWindowScroll.apply(fineBox, [fineBox.$overlay.data('fineBox')]);
            }

        },

        setHash : function () {
            // ;;; log('setHash', this, arguments);

            document.location.hash = 'open=' + (fineBox.$current.attr('href'));
        },

        unsetHash : function () {
            // ;;; log('unsetHash', this, arguments);

            document.location.hash = '';
        },

        openFromHash : function (hashArg) {
            // ;;; log('openFromHash', this, arguments);

            var uriToOpen,
                elementToOpen,
                hashArgPatt = new RegExp(hashArg + '=');

            if (!hashArg) {
                return;
            }

            // Set uri to open
            if (hashArgPatt.test(window.location.hash)) {
                uriToOpen = window.location.hash.slice(1).replace(hashArgPatt, '');
                //uriToOpen = uriToOpen.substr(0, uriToOpen.lastIndexOf('/'));
            } else {
                return;
            }
            // ;;; log('openFromHash', uriToOpen);

            if (!uriToOpen) {
                return;
            }

            // Set element to open
            elementToOpen = $('a[href*="' + uriToOpen + '"]').eq(0);
            // ;;; log('openFromHash', elementToOpen);

            // Open element if exists
            if (elementToOpen.length > 0) {
                // ;;; log('openFromHash fire opening', elementToOpen);
                elementToOpen.trigger('click.fineBox');
            } else {
                // ;;; log('openFromHash not found, scrolling', elementToOpen);
                $('html, body').stop(true).animate(
                    {
                        'scrollTop': ($(document).height() - $(window).height())
                    },
                    function () {
                        fineBox.setOriginData();
                        fineBox.openFromHash(hashArg);
                    }
                );
            }
        },

        init : function (userOptions) {
            // ;;; log('init', this, arguments);

            var options = {
                    'transitionMode': 'full', // Transition mode : full or minimal
                    'filter': 'div:first-child',
                    'prefix': 'finebox',
                    'loop': true,
                    'messageDelay': 3000,
                    'overlayOpacity': 0.75,
                    'selector': this.selector,
                    'easingIn': 'linear',
                    'easingOut': 'linear',
                    'durationIn': 'fast',
                    'durationOut': 'fast',
                    'hookInit': null,
                    'hookAlterOverlayData': null,
                    'hookOnOpen': null,
                    'hookOnClose': null,
                    'hookFreezeWindowScroll': null,
                    'hookUnfreezeWindowScroll': null,
                    'hookAdjust': null,
                    'hookPager': null,
                    'hashArg': 'open',
                    'viewportSpace': 40,
                    'strings': {
                        'prev': 'Previous',
                        'next': 'Next',
                        'loadNext': 'Loading next&hellip;',
                        'loadError': 'This image could not be loaded'
                    },
                    'slideshow': true,
                    'interval': 5000
                },
                console = window.console || null;

            // Error console
            if (console) {
                $.error = console.error;
            } else {
                $.error = function () {
                    return;
                };
                // Poor ie lower than 9 debugging
                // $.error = window.alert;
            }

            // Easing plugin requirement
            $.easing = $.easing || {};
            userOptions = userOptions || {};
            if (userOptions.easingIn && !$.easing.hasOwnProperty(userOptions.easingIn)) {
                $.error('To use ' +  userOptions.easingIn + ' easing method, jQuery.fineBox require jQuery.easing plugin. \nDownload it @url http://plugins.jquery.com/project/Easing');
                delete userOptions.easingIn;
            }
            if (userOptions.easingIn && !$.easing.hasOwnProperty(userOptions.easingOut)) {
                $.error('To use ' +  userOptions.easingOut + ' easing method, jQuery.fineBox require jQuery.easing plugin. \nDownload it @url http://plugins.jquery.com/project/Easing');
                delete userOptions.easingOut;
            }

            // Mergin user options
            if (userOptions) {
                $.extend(options, userOptions);
            }

            fineBox.fixIELacks();
            fineBox.touchPlaceholder(options);

            // Applying hookInit
            if ((typeof options.hookInit) === 'function') {
                options.hookInit.apply(fineBox);
            }

            // Delayed auto opening from hash arg
            setTimeout(function () {
                fineBox.openFromHash(options.hashArg);
            }, (options.messageDelay / 2));

            return this.not('.' + options.prefix + '-processed').each(function () {

                var $this = $(this),
                    data = $this.data('fineBox');

                // If the plugin hasn't been initialized yet
                if (!data) {

                    // save item data
                    $this.data('fineBox', {
                        '$origin' : $this,
                        'options' : options
                    }).css({
                        'display': 'block'
                    });

                    // save item to $elements collection
                    if (!fineBox.$overlay.data('fineBox').$elements) {
                        fineBox.$overlay.data('fineBox').$elements = [];
                    }
                    fineBox.$overlay.data('fineBox').$elements.push($this[0]);

                    // bind fineBox events
                    fineBox.bindEvents(this);

                    // enrole others hyperlinks with same href
                    $(options.filter).find('a[href="' + $this.attr('href') + '"]:not(.' + options.prefix + '-processed)').not(this).unbind('click').bind('click.fineBox', function (e) {
                        e.stopImmediatePropagation();
                        $this.trigger('click.fineBox');
                        return false;
                    }).addClass(options.prefix + '-processed');

                }
            }).addClass(options.prefix + '-processed');
        },

        touchPlaceholder : function (options) {

            // Fine Box overlay element
            if ($('#finebox-overlay').length === 0) {
                fineBox.$overlay = $('<div />', {'id': options.prefix + '-overlay'}).css({
                    'position' : (fineBox.isIE6 ? 'absolute' : 'fixed'),
                    'left': 0,
                    // 'top': (fineBox.isIE6 ? (document.documentElement.scrollTop + document.body.scrollTop) : 0),
                    'top': (fineBox.isIE6 ? $(window).scrollTop() : 0),
                    'width': '100%',
                    'height': '100%'
                    // ,'overflow': 'hidden'
                }).hide().appendTo('body').data('fineBox', {
                    'options': options
                });
            }

            // Fine Box content wrapper element
            if ($('#finebox-wrapper').length === 0) {
                fineBox.$wrapper = $('<div />', {'id': options.prefix + '-wrapper'}).css({
                    'position': (fineBox.isIE6 ? 'absolute' : 'fixed'),
                    'left': 0,
                    // 'top': (fineBox.isIE6 ? (document.documentElement.scrollTop + document.body.scrollTop) : 0),
                    'top': (fineBox.isIE6 ? $(window).scrollTop() : 0),
                    'width': '100%',
                    'height': '100%',
                    'background-color': 'transparent'
                    // ,'overflow': 'hidden'
                }).hide().appendTo('body');
            }

            // Fine Box content container element
            if ($('#finebox-container').length === 0) {
                fineBox.$container = $('<div />', {'id': options.prefix + '-container'}).css({
                    'position': 'absolute',
                    'left': 0,
                    'top': 0
                }).appendTo('#' + options.prefix + '-wrapper');
            }

            // Events binding for these elements
            fineBox.bindPlaceholderEvents(options);

        },

        bindPlaceholderEvents : function (options) {

            // Enable close by clicking on overlay or wrapper
            fineBox.$overlay.add(fineBox.$wrapper).not('.' + options.prefix + '-processed').bind('click.fineBox', function () {
                if (!fineBox.isLoaded) {
                    return false;
                }
                fineBox.closeItem();
                return false;
            }).addClass(options.prefix + '-processed');
            fineBox.$container.bind('click.fineBox', function (e) {
                e.stopPropagation();
            }).css('cursor', 'default');

            $(document).bind('keydown.fineBox', function (event) {
                // Enable close with esc
                if (event.keyCode === 27) {
                    if (!fineBox.isLoaded) {
                        return false;
                    }
                    fineBox.closeItem();
                    return false;
                }
            });

            // Add onResize listener
            $(window).resize(function () {
                if (fineBox.isOpened && fineBox.isLoaded) {
                    fineBox.adjust();
                }
            });
        },

        bindEvents : function (elements) {
            $(elements).unbind('click').bind({
                'click.fineBox': function () {
                    fineBox.isLoaded = false;
                    fineBox.isLoading = true;
                    fineBox.load($(this));
                    return false;
                },
                'mouseenter.fineBox': function () {
                    $(this).addClass('hover');
                    return false;
                },
                'mouseleave.fineBox': function () {
                    $(this).removeClass('hover');
                    return false;
                }
            });
        },

        setOriginData : function () {
            // ;;; log('setOriginData', this, arguments);

            // Metrics of the DOM origin
            var options = fineBox.$current.data('fineBox').options,
                $tmp = fineBox.getBiggestInFragment(fineBox.$current),
                startW = $tmp.width(),
                startH = $tmp.height(),
                scrollX = $('body').scrollLeft() > 0 ? $('body').scrollLeft() : $(window).scrollLeft(),
                scrollY = $('body').scrollTop() > 0 ? $('body').scrollTop() : $(window).scrollTop(),
                startX = Math.round($tmp.offset().left - scrollX),
                startY = Math.round($tmp.offset().top - scrollY),

                // Get next and previous DOM elements
                all = fineBox.$overlay.data('fineBox').$elements,
                index = all.indexOf(fineBox.$current[0]),
                $previous = options.loop ? $(all[index - 1] || all[all.length - 1]) : $(all[index - 1]),
                $next = options.loop ? $(all[index + 1] || all[0]) : $(all[index + 1]),

                // Fill data
                data = {
                    'CSSorigin': {
                        'width': startW,
                        'height': startH,
                        'top': startY,
                        'left': startX
                    },
                    'scrollX': scrollX,
                    'scrollY': scrollY,
                    '$previous': $previous,
                    '$next': $next
                };

            // Save data
            $.extend(fineBox.$overlay.data('fineBox'), data);
        },

        setOverlayData : function () {
            // ;;; log('setOverlayData', this, arguments, fineBox.$overlay.data('fineBox'));

            // Metrics of the DOM box content
            var data = fineBox.$overlay.data('fineBox'),
                newData,
                $imageBase = data.$image,
                $image,
                hookAlterOverlayDataResult,
                endWbase,
                endHbase,
                docW = $(window).width(),
                docH = $(window).height(),
                endW,
                endH,
                endX,
                endY,
                imgW,
                imgH;

            // Use an image copy
            $image = $('<img />').attr('src', $imageBase.attr('src')).addClass(data.options.prefix + '-image');

            // Fill real image dimensions
            endWbase = $image[0].width;
            endHbase = $image[0].height;

            // Default end width and end height
            endW = endWbase;
            endH = endHbase;

            // Set end width
            if (endWbase >= (docW - data.options.viewportSpace - 1)) {
                endW = Math.round(docW - data.options.viewportSpace);
                endH = Math.round((endHbase  / endWbase) * endW);
            }

            // Set end height
            if (endH >= (docH - data.options.viewportSpace - 1)) {
                endH = Math.round(docH - data.options.viewportSpace);
                endW = Math.round((endWbase / endHbase) * endH);
            }

            // Set end image dimensions
            imgW = endW;
            imgH = endH;

            // Set end position
            endX = Math.round((docW - endW) / 2);
            endY = Math.round((docH - endH) / 2);

            // Fill data
            newData = {
                'CSSoverlay': {
                    'width': endW,
                    'height': endH,
                    'top': endY,
                    'left': endX
                    // ,'overflow': 'visible'
                },
                'CSSimage': {
                    'width': imgW,
                    'height': imgH
                    // ,'overflow': 'visible'
                },
                '$image': $image
            };

            // Save data
            $.extend(fineBox.$overlay.data('fineBox'), newData);

            // Apply user hook
            if (typeof data.options.hookAlterOverlayData === 'function') {
                hookAlterOverlayDataResult = data.options.hookAlterOverlayData.apply(fineBox, [fineBox.$overlay.data('fineBox')]);
                if (hookAlterOverlayDataResult) {
                    // Save data
                    $.extend(fineBox.$overlay.data('fineBox'), hookAlterOverlayDataResult);
                }
            }

        },

        adjust : function () {
            // ;;; log('adjust', this, arguments);

            var data;

            if (fineBox.isLoading) {
                return false;
            }

            fineBox.setOverlayData();
            data = fineBox.$overlay.data('fineBox');
            fineBox.unfreezeWindowScroll();

            fineBox.$container.find('.' + data.options.prefix + '-image').stop(true).animate(
                {
                    'width': data.CSSimage.width,
                    'height': data.CSSimage.height
                    //,'overflow': 'visible'
                },
                data.options.durationIn,
                data.options.easingIn
            );

            fineBox.$container.stop(true).animate(
                data.CSSoverlay,
                data.options.durationIn,
                data.options.easingIn,
                function () {
                    fineBox.freezeWindowScroll();
                    fineBox.setOriginData();
                    if (typeof data.options.hookAdjust === 'function') {
                        data.options.hookAdjust.apply(fineBox, [fineBox.$overlay.data('fineBox')]);
                    }
                }
            );

        },

        load : function ($this) {
            // ;;; log('load', this, arguments);

            var options = $this.data('fineBox').options,
                $parent = $this.parent(),
                $fragment,
                img,
                $img,
                $msgTarget = !fineBox.isOpened ? $parent : fineBox.$container,
                indicator = new Indicator($msgTarget);

            fineBox.$current = $this;
            fineBox.isLoading = true;
            indicator.add({
                'display': 'block',
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': !fineBox.isOpened ? $this.width() : fineBox.$overlay.data('fineBox').CSSimage.width,
                'height': !fineBox.isOpened ? $this.height() : fineBox.$overlay.data('fineBox').CSSimage.height,
                'background-position': 'center center'
            });
            $this.fadeTo('fast', 0.5);

            function removeIndicator(callback) {
                var args = arguments;
                fineBox.isLoading = false;
                $this.fadeTo('fast', 1, function () {
                    indicator.remove();
                    if (callback) {
                        fineBox.hook.apply(fineBox, args);
                    }
                });
            }

            function loadNextIfIsOpened() {
                if (fineBox.isOpened) {
                    setTimeout(function () {
                        fineBox.setMessage(options.strings.loadNext, 'normal', $msgTarget);
                        setTimeout(function () {
                            fineBox.publics.next();
                        }, options.messageDelay);
                    }, (options.messageDelay * 1.2));
                }
            }

            function onErrorAction() {
                removeIndicator('setMessage', options.strings.loadError, 'error', $msgTarget);
                loadNextIfIsOpened();
            }

            if ($this.get(0).nodeName === 'A') {

                if (fineBox.isImage($this.attr('href'))) {
                    $(img = new Image())
                        .error(onErrorAction)
                        .load(function () {
                            img.onload = null; //stops animated gifs from firing the onload repeatedly.
                            removeIndicator();
                            $fragment = $('<div class="' + options.prefix + '-inner' + '" />');
                            setTimeout(function () { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
                                $.extend(fineBox.$overlay.data('fineBox'), {
                                    '$image' : $(img)
                                });
                                fineBox.openItem($this, $fragment);
                            }, 1);
                        }).addClass(options.prefix + '-image');

                    setTimeout(function () { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
                        img.src = $this.attr('href');
                    }, 1);

                } else {

                    $.ajax({
                        type: 'GET',
                        url: $this.attr('href'),
                        cache: true,
                        dataType: 'html',
                        async: true,
                        success: function (data) {
                            $fragment = $(data).find(options.filter).attr('id', null).addClass(options.prefix + '-inner');
                            $(img = new Image())
                                .error(onErrorAction)
                                .load(function () {
                                    img.onload = null; //stops animated gifs from firing the onload repeatedly.
                                    removeIndicator();
                                    setTimeout(function () { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
                                        $.extend(fineBox.$overlay.data('fineBox'), {
                                            '$image' : $(img)
                                        });
                                        fineBox.openItem($this, $fragment);
                                    }, 1);
                                }).addClass(options.prefix + '-image').get(0);

                            setTimeout(function () { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
                                $img = fineBox.getBiggestInFragment($fragment).detach();
                                img.src = $img.attr('src');
                            }, 1);
                        },
                        error: onErrorAction
                    });
                }

            }
        },

        openItem : function ($this, $fragment) {
            // ;;; log('openItem', this, arguments);

            var options = $this.data('fineBox').options;

            fineBox.isOpening = true;
            $.extend(fineBox.$overlay.data('fineBox'), {
                '$origin' : $this,
                '$fragment' : $fragment,
                'options' : options
            });
            fineBox.$current = $this;
            if (!fineBox.isOpened || options.transitionMode === 'minimal') {
                fineBox.setOriginData();
            }
            fineBox.setOverlayData();
            fineBox.freezeWindowScroll();
            fineBox.setHash();

            switch (options.transitionMode) {
            case 'full':
                fineBox.closeItem('fireOpening');
                break;
            case 'minimal':
                fineBox.fireOpening();
                break;
            }

        },

        closeItem : function (callback) {
            // ;;; log('closeItem', this, arguments);

            var data = fineBox.$overlay.data('fineBox'),
                options = data.options,
                CSSorigin = data.CSSorigin,
                args = arguments;

            if (!fineBox.isLoaded) {
                return false;
            }

            fineBox.enableSlideShow = false;
            fineBox.hidePager();
            fineBox.hideFragment();

            if (fineBox.isOpened) {
                fineBox.$overlay.fadeOut('fast', function () {
                    fineBox.isOpened = false;
                    fineBox.getBiggestInFragment(fineBox.$container).stop(true).animate(
                        {
                            'width': CSSorigin.width,
                            'height': CSSorigin.height
                            //,'overflow': 'visible'
                        },
                        options.durationOut,
                        options.easingOut
                    );
                    fineBox.$container.removeClass('opened').stop(true).animate(
                        CSSorigin,
                        options.durationOut,
                        options.easingOut,
                        function () {
                            $(this).fadeOut('fast', function () {
                                fineBox.$container.empty();
                                fineBox.$wrapper.hide();
                                fineBox.unsetHash();
                                fineBox.unfreezeWindowScroll();
                                fineBox.setOriginData();
                                if (callback) {
                                    fineBox.hook.apply(fineBox, args);
                                }
                            });
                        }
                    );
                });
            } else {
                if (callback) {
                    fineBox.hook.apply(fineBox, args);
                }
            }
        },

        fireOpening : function () {
            // ;;; log('fireOpening', this, arguments, fineBox.$overlay.data('fineBox'));

            var data = fineBox.$overlay.data('fineBox'),
                options = data.options,
                $image = data.$image,
                CSSorigin = data.CSSorigin,
                CSSoverlay = data.CSSoverlay,
                CSSimage = data.CSSimage,
                $msgTarget = !fineBox.isOpened ? fineBox.$current.parent() : fineBox.$container;

            if (!fineBox.isOpened) {
                // ;;; log('fireOpening not opened', $this, $fragment, $image.parent(), CSSorigin, CSSoverlay);

                $image.css({
                    'width': CSSorigin.width,
                    'height': CSSorigin.height
                    // ,'overflow': 'visible'
                }).detach().appendTo(fineBox.$container).show();

                fineBox.$wrapper.show();

                fineBox.$container.css(CSSorigin).fadeIn('fast', function () {

                    if (options.transitionMode === 'full') {
                        fineBox.freezeWindowScroll();
                    }

                    $image.stop(true).animate(
                        {
                            'width': CSSimage.width,
                            'height': CSSimage.height
                            //,'overflow': 'visible'
                        },
                        options.durationIn,
                        options.easingIn
                    );
                    $(this).stop(true).animate(
                        CSSoverlay,
                        options.durationIn,
                        options.easingIn,
                        function () {
                            $(this).addClass('opened');
                            fineBox.isOpening = false;
                            fineBox.isOpened = true;
                            if ((typeof options.hookOnOpen) === 'function') {
                                options.hookOnOpen.apply(fineBox);
                            } else {
                                fineBox.showFragment();
                            }
                            fineBox.showPager();
                            fineBox.$overlay.fadeTo('slow', options.overlayOpacity, function () {
                                fineBox.isLoaded = true;
                                if (fineBox.enableSlideShow) {
                                    setTimeout(function () {
                                        fineBox.setMessage(options.strings.loadNext, 'normal', $msgTarget);
                                        setTimeout(function () {
                                            fineBox.publics.next();
                                        }, options.messageDelay);
                                    }, (options.interval));
                                }
                            });
                        }
                    );

                });
            } else {
                // ;;; log('fireOpening opened', $this, $fragment, $image, CSSorigin, CSSoverlay);

                fineBox.hidePager();
                $image.css({
                    'width': CSSimage.width,
                    'height': CSSimage.height
                    // ,'overflow': 'visible'
                });
                fineBox.hideFragment().stop(true).delay(options.durationIn).find('.' + options.prefix + '-image').fadeOut((options.durationIn / 1.2), function () {
                    $(this).remove();
                }).end().delay((options.durationIn / 1.2)).animate(
                    CSSoverlay,
                    options.durationIn,
                    options.easingIn,
                    function () {
                        $image.hide().appendTo(fineBox.$container).fadeIn('fast', function () {
                            fineBox.isOpening = false;
                            fineBox.isOpened = true;
                            if ((typeof options.hookOnOpen) === 'function') {
                                options.hookOnOpen.apply(fineBox);
                            } else {
                                fineBox.showFragment();
                            }
                            fineBox.showPager();
                            fineBox.isLoaded = true;
                            if (fineBox.enableSlideShow) {
                                setTimeout(function () {
                                    fineBox.setMessage(options.strings.loadNext, 'normal', $msgTarget);
                                    setTimeout(function () {
                                        fineBox.publics.next();
                                    }, options.messageDelay);
                                }, (options.interval));
                            }
                        });
                    }
                );
            }
        },

        showFragment : function () {
            // ;;; log('showFragment', this, arguments);

            var data = fineBox.$overlay.data('fineBox');
            if (data.$fragment.html() !== '') {
                data.$fragment.hide().css({
                    'position': 'absolute',
                    'top' : 0,
                    'right' : '3em',
                    'width': '33%',
                    'height': 'auto'
                }).appendTo(fineBox.$container).fadeIn();
            } else {
                data.$fragment.remove();
            }

        },

        hideFragment : function () {
            // ;;; log('hideFragment', this, arguments);

            var data = fineBox.$overlay.data('fineBox');

            if ((typeof data.options.hookOnClose) === 'function') {
                return data.options.hookOnClose.apply(fineBox);
            } else {
                return fineBox.$container.find('.' + data.options.prefix + '-inner').fadeOut('fast', function () {
                    $(this).remove();
                }).end();
            }

        },

        showPager : function () {
            // ;;; log('showPager', this, arguments);

            var data = fineBox.$overlay.data('fineBox'),
                $prevDiv,
                $nextDiv;

            if (typeof data.options.hookPager === 'function') {
                data.options.hookPager.apply(fineBox, [data.options.prefix + '-previous', data.options.prefix + '-next']);
            }

            $prevDiv = fineBox.$container.find('.' + data.options.prefix + '-previous');
            $nextDiv = fineBox.$container.find('.' + data.options.prefix + '-next');

            if ($prevDiv.length === 0) {
                $prevDiv = $('<div />', {
                    'class': data.options.prefix + '-previous',
                    'style': 'position: absolute; left: 10px; bottom: 10px; z-index: 10;'
                }).append('<a />').hide().prependTo(fineBox.$container);
            }
            if ($nextDiv.length === 0) {
                $nextDiv = $('<div />', {
                    'class': data.options.prefix + '-next',
                    'style': 'position: absolute; right: 10px; bottom: 10px; z-index: 11;'
                }).append('<a />').hide().prependTo(fineBox.$container);
            }

            if (data.$previous.length > 0) {
                $prevDiv.find('a').attr('href', data.$previous.attr('href')).html('<span>' + data.options.strings.prev + '</span>').unbind('click').bind('click.fineBox', function () {
                    fineBox.publics.previous();
                    return false;
                }).end().fadeIn();
            }
            if (data.$next.length > 0) {
                $nextDiv.find('a').attr('href', data.$next.attr('href')).html('<span>' + data.options.strings.next + '</span>').unbind('click').bind('click.fineBox', function () {
                    fineBox.publics.next();
                    return false;
                }).end().fadeIn();
            }
        },

        hidePager : function () {
            // ;;; log('hidePager', this, arguments);

            var data = fineBox.$overlay.data('fineBox'),
                $prevDiv = fineBox.$container.find('.' + data.options.prefix + '-previous'),
                $nextDiv = fineBox.$container.find('.' + data.options.prefix + '-next');

            $prevDiv.add($nextDiv).fadeOut().find('a').attr('href', '').html('').unbind('click.fineBox');
        },

        scrollToIfNotInView : function ($element) {
            // ;;; log('scrollToIfNotInView', this, arguments);

            var data = fineBox.$overlay.data('fineBox');

            if ($element.length > 0 && !$element.is(':inView')) {
                $('html, body').stop(true).animate(
                    {
                        'scrollTop': ($element.offset().top - data.options.viewportSpace)
                    },
                    {
                        duration : data.options.durationIn,
                        easing : data.options.easingIn,
                        complete : function () {
                            fineBox.setOriginData();
                        }
                    }
                );
            }
        },

        publics : {
            getOptions : function () {
                return fineBox.$current.data('fineBox').options;
            },
            open : function (options) {
                if (!this.data('fineBox')) {
                    this.fineBox(options);
                }
                fineBox.load(this);
                return this;
            },
            previous : function () {
                fineBox.scrollToIfNotInView(fineBox.$overlay.data('fineBox').$previous);
                fineBox.$overlay.data('fineBox').$previous.trigger('click.fineBox');
            },
            next : function () {
                fineBox.scrollToIfNotInView(fineBox.$overlay.data('fineBox').$next);
                fineBox.$overlay.data('fineBox').$next.trigger('click.fineBox');
            },
            destroy : function () {
                // var elements;
                // if (this) {
                //     elements = this;
                // } else {
                //     elements = fineBox.$overlay.data('fineBox').$elements;
                // }
                // return elements.each(function () {
                //     var $this = $(this),
                //         data = $this.data('fineBox');
                // 
                //     $(window).unbind('.fineBox');
                //     data.fineBox.remove();
                //     $this.removeData('fineBox');
                //     fineBox.remove();
                // });
            }
        }
    };

    $.fn.fineBox = function (method) {
        if (fineBox.publics[method]) {
            return fineBox.publics[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return fineBox.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.fineBox');
        }
    };

})(jQuery);
