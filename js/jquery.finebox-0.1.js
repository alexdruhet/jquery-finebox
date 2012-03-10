/* @url http://docs.jquery.com/Plugins/Authoring */

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
    Indicator.prototype.add = function () {
        this.$indicator.hide().prependTo(this.$parent).fadeIn('fast');
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
            
            // ;;; log('getBiggestInFragment', $img, $img.attr('src'));
            if ($img) {
                return $img;
            }
            return false;
        },

        freezeWindowScroll : function () {
             // ;;; log('freezeWindowScroll', this, arguments);

            $('body').css('width', document.documentElement.clientWidth);
            $('html, body').css({
                'overflow': 'hidden'
                //,'max-height': '100%'
            }).scrollTop(fineBox.$overlay.data('fineBox').scrollY).scrollLeft(fineBox.$overlay.data('fineBox').scrollX);
        },

        unfreezeWindowScroll : function () {
             // ;;; log('unfreezeWindowScroll', this, arguments);

            $('body').css('width', '100%');
            $('html, body').css('overflow', 'auto').scrollTop(fineBox.$overlay.data('fineBox').scrollY).scrollLeft(fineBox.$overlay.data('fineBox').scrollX);
        },

        setHash : function () {
            // ;;; log('setHash', this, arguments);

            document.location.hash = 'open=' + (fineBox.$current.attr('href'));
        },

        unsetHash : function () {
            // ;;; log('unsetHash', this, arguments);

            document.location.hash = '';
        },
        
        openFromHash : function (hashValue) {
            // ;;; log('openFromHash', this, arguments);

            if (hashValue) {
                var elementToOpen = $('a:[href*="' + hashValue + '"]').eq(0);
                if (elementToOpen.length > 0) {
                    elementToOpen.trigger('click.fineBox');
                } else {
                    //window.scroll(0, $(document).height());
                    fineBox.scrollToIfNotInView(elementToOpen);
                }
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
                    'hash': null,
                    'viewportSpace': 40
                },
                console = window.console || null;
            
            // Error console
            if (console) {
                $.error = console.error;
            } else {
                // $.error = function () { 
                //     return; 
                // };
                $.error = window.alert;
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
            fineBox.openFromHash(options.hash);
            
            if ((typeof options.hookInit) === 'function') {
                options.hookInit.apply(fineBox);
            }
            
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
                    fineBox.$overlay.data('fineBox').$elements.push($this);

                    // bind fineBox events
                    fineBox.bindEvents(this);

                }
            }).addClass(options.prefix + '-processed');
        },
        
        touchPlaceholder : function (options) {
            
            // Fine Box overlay element
            if ($('#finebox-overlay').length === 0) {
                fineBox.$overlay = $('<div />', {'id': options.prefix + '-overlay'}).css({
                    'position' : (fineBox.isIE6 ? 'absolute' : 'fixed'),
                    'left': 0,
                    'top': (fineBox.isIE6 ? (document.documentElement.scrollTop + document.body.scrollTop) : 0),
                    'width': '100%',
                    'height': '100%',
                    'overflow': 'hidden'
                }).hide().appendTo('body').data('fineBox', {
                    'options': options
                });
            }

            // Fine Box content wrapper element
            if ($('#finebox-wrapper').length === 0) {
                fineBox.$wrapper = $('<div />', {'id': options.prefix + '-wrapper'}).css({
                    'position': (fineBox.isIE6 ? 'absolute' : 'fixed'),
                    'left': 0,
                    'top': (fineBox.isIE6 ? (document.documentElement.scrollTop + document.body.scrollTop) : 0),
                    'width': '100%',
                    'height': '100%',
                    'background-color': 'transparent',
                    'overflow': 'hidden'
                }).hide().appendTo('body');
            }

            // Fine Box content container element
            if ($('#finebox-container').length === 0) {
                fineBox.$container = $('<div />', {'id': options.prefix + '-container'}).css({
                    'position': 'absolute',
                    'left': 0,
                    'top': 0,
                    'overflow': 'hidden'
                }).appendTo('#' + options.prefix + '-wrapper');
            }

            // Events binding for these elements
            fineBox.bindPlaceholderEvents(options);
            
        },

        bindPlaceholderEvents : function (options) {

            // Enable close by clicking on overlay or wrapper
            fineBox.$overlay.add(fineBox.$wrapper).not('.' + options.prefix + '-processed').bind('click.fineBox', function () {
                fineBox.closeItem();
                return false;
            }).addClass(options.prefix + '-processed');
            fineBox.$container.bind('click.fineBox', function () {
                return false;
            }).css('cursor', 'default');

            $(document).bind('keydown.fineBox', function (event) {
                // Enable close with esc
                if (event.keyCode === 27) {
                    fineBox.closeItem();
                    return false;
                }
            });

            // Add onResize listener
            $(window).resize(function () {
                if (fineBox.isOpened) {
                    fineBox.adjust();
                }
            });
        },

        bindEvents : function (elements) {
            $(elements).bind({
                'click.fineBox': function () {
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
                // all = $.makeArray($(options.filter).find(options.selector + '.' + options.prefix + '-processed')),
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

            // log('setOriginData', all, $(options.filter).find(options.selector + '.' + options.prefix + '-processed'), $(options.selector));

            // Save data
            $.extend(fineBox.$overlay.data('fineBox'), data);
        },
        
        setOverlayData : function () {
            // ;;; log('setOverlayData', this, arguments, fineBox.$overlay.data('fineBox'));

            // Metrics of the DOM box content
            var data = fineBox.$overlay.data('fineBox'),
                newData,
                $fragment = data.$fragment,
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
                endY;
            
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
                },
                '$image': $image
            };

            // ;;; log('setOverlayData.data', 'docW : ' + docW, 'docH : ' + docH, 'endWbase : ' + endWbase, 'endHbase : ' + endHbase, 'endW : ' + endW, 'endH : ' + endH, 'endX : ' + endX, 'endY : ' + endY, $imageBase, $image);

            // Apply user hook
            if (typeof data.options.hookAlterOverlayData === 'function') {
                hookAlterOverlayDataResult = data.options.hookAlterOverlayData.apply(fineBox, $fragment, $image);
                if (hookAlterOverlayDataResult) {
                    $.extend(newData, hookAlterOverlayDataResult);
                }
            }
        
            // Save data
            $.extend(fineBox.$overlay.data('fineBox'), newData);
        },

        adjust : function () {
            // ;;; log('adjust', this, arguments);

            var data;

            // fineBox.setOverlayData(fineBox.$container);
            fineBox.setOverlayData();
            data = fineBox.$overlay.data('fineBox');
            fineBox.unfreezeWindowScroll();

            fineBox.$container.find('.' + data.options.prefix + '-image').stop().animate(
                {
                    'width': data.CSSoverlay.width,
                    'height': data.CSSoverlay.height
                }, 
                data.options.durationIn, 
                data.options.easingIn
            );

            fineBox.$container.stop().animate(
                data.CSSoverlay,
                data.options.durationIn,
                data.options.easingIn,
                function () {
                    fineBox.freezeWindowScroll();
                    fineBox.setOriginData();
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
            indicator.add();
            $this.fadeTo('fast', 0.5);
            
            function removeIndicator(callback) {
                var args = arguments;
                fineBox.isLoading = false;
                fineBox.isLoaded = true;
                indicator.remove();
                $this.fadeTo('fast', 1, function () {
                    if (callback) {
                        fineBox.hook.apply(fineBox, args);
                    }
                });
            }
            
            function loadNextIfIsOpened() {
                if (fineBox.isOpened) {
                    setTimeout(function () {
                        fineBox.setMessage('Loading next&hellip;', 'normal', $msgTarget);
                        setTimeout(function () {
                            fineBox.publics.next();
                        }, options.messageDelay);
                    }, (options.messageDelay * 1.2));
                }
            }
            
            function onErrorAction() {
                removeIndicator('setMessage', 'This image could not be loaded', 'error', $msgTarget);
                loadNextIfIsOpened();
            }

            if ($this.get(0).nodeName === 'A') {

                if (fineBox.isImage($this.attr('href'))) {
                    $(img = new Image())
                        .error(onErrorAction)
                        .load(function () {
                            img.onload = null; //stops animated gifs from firing the onload repeatedly.
                            removeIndicator();
                            //$fragment = $('<div class="' + options.prefix + '-inner' + '" />').html(img);
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
                                // }).addClass(options.prefix + '-image')[0];
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
            // if (!fineBox.isOpened) {
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
            
            fineBox.hidePager();
            fineBox.hideFragment();
            
            if ((typeof options.hookOnClose) === 'function') {
                options.hookOnClose.apply(fineBox, data);
            }

            if (fineBox.isOpened) {
                fineBox.$overlay.fadeOut('fast', function () {
                    fineBox.isOpened = false;
                    fineBox.getBiggestInFragment(fineBox.$container).animate(
                        {
                            'width': CSSorigin.width,
                            'height': CSSorigin.height
                        }, 
                        options.durationOut, 
                        options.easingOut
                    );
                    fineBox.$container.removeClass('opened').animate(
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
                // $this = data.$origin,
                $fragment = data.$fragment,
                $image = data.$image,
                CSSorigin = data.CSSorigin,
                CSSoverlay = data.CSSoverlay;

            if (!fineBox.isOpened) {
                // ;;; log('fireOpening not opened', $this, $fragment, $image.parent(), CSSorigin, CSSoverlay);

                $image.css({
                    'width': CSSorigin.width,
                    'height': CSSorigin.height
                }).detach().appendTo(fineBox.$container).show();

                fineBox.$wrapper.show();
                    
                fineBox.$container.css(CSSorigin).fadeIn('fast', function () {
                    
                    if (options.transitionMode === 'full') {
                        fineBox.freezeWindowScroll();
                    }

                    $image.animate(
                        {
                            'width': CSSoverlay.width,
                            'height': CSSoverlay.height
                        }, 
                        options.durationIn, 
                        options.easingIn
                    );
                    $(this).animate(
                        CSSoverlay,
                        options.durationIn, 
                        options.easingIn, 
                        function () {
                            $(this).addClass('opened');
                            fineBox.showPager();
                            fineBox.isOpening = false;
                            fineBox.isOpened = true;
                            if ((typeof options.hookOnOpen) === 'function') {
                                options.hookOnOpen.apply(fineBox, $fragment, $image);
                            } else {
                                fineBox.showFragment();
                            }
                            fineBox.$overlay.fadeTo('slow', options.overlayOpacity);
                        }
                    );
                    
                });
            } else {
                // ;;; log('fireOpening opened', $this, $fragment, $image, CSSorigin, CSSoverlay);

                if ((typeof options.hookOnClose) === 'function') {
                    options.hookOnClose.apply(fineBox, data);
                }

                fineBox.hidePager();
                fineBox.hideFragment();
                $image.css({
                    'width': CSSoverlay.width,
                    'height': CSSoverlay.height
                });
                fineBox.$container.stop().find('.' + options.prefix + '-image').fadeOut((options.durationIn / 1.2), function () {
                    $(this).remove();
                }).end().delay((options.durationIn / 1.2)).animate(
                    CSSoverlay,
                    options.durationIn, 
                    options.easingIn, 
                    function () {
                        $image.hide().appendTo(fineBox.$container).fadeIn('fast', function () {
                            fineBox.showPager();
                            fineBox.isOpening = false;
                            fineBox.isOpened = true;
                            if ((typeof options.hookOnOpen) === 'function') {
                                options.hookOnOpen.apply(fineBox, $fragment, $image);
                            } else {
                                fineBox.showFragment();
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
            
            fineBox.$container.find('.' + data.options.prefix + '-inner').fadeOut('fast', function () {
                $(this).remove();
            });
            
        },
        
        showPager : function () {
            // ;;; log('showPager', this, arguments);

            var data = fineBox.$overlay.data('fineBox'),
                $prevDiv = fineBox.$container.find('.' + data.options.prefix + '-previous'),
                $nextDiv = fineBox.$container.find('.' + data.options.prefix + '-next');

            if ($prevDiv.length === 0) {
                $prevDiv = $('<div />', { 
                    'class': data.options.prefix + '-previous',
                    'style': 'position: absolute; left: 10px; bottom: 10px;'
                }).append('<a />').hide().prependTo(fineBox.$container);
            }
            if ($nextDiv.length === 0) {
                $nextDiv = $('<div />', { 
                    'class': data.options.prefix + '-next',
                    'style': 'position: absolute; right: 10px; bottom: 10px;'
                }).append('<a />').hide().prependTo(fineBox.$container);
            }
            
            if (data.$previous.length > 0) {
                $prevDiv.find('a').attr('href', data.$previous.attr('href')).html('<span>' + data.$previous.attr('href') + '<span>').bind('click.fineBox', function () {
                    fineBox.publics.previous();
                    return false;
                }).end().fadeIn();
            }
            if (data.$next.length > 0) {
                $nextDiv.find('a').attr('href', data.$next.attr('href')).html('<span>' + data.$next.attr('href') + '<span>').bind('click.fineBox', function () {
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

        openFromOverlay : function () {
            // ;;; log('openFromOverlay', this, arguments);
        },

        scrollToIfNotInView : function ($element) {
            // ;;; log('scrollToIfNotInView', this, arguments);

            var data = fineBox.$overlay.data('fineBox');
                // args = arguments;

            if ($element.length > 0 && !$element.is(':inView')) {
                $('html, body').stop().animate(
                    {
                        'scrollTop': $element.offset().top
                    }, 
                    {
                        duration : data.options.durationIn, 
                        easing : data.options.easingIn, 
                        complete : function () {
                            fineBox.setOriginData();
                            // if (callback) {
                            //     $element.trigger(callback);
                            // }
                        } 
                        // , step : function (now, fx) {
                        //     if (fx.prop === 'scrollTop') {
                        //         fineBox.$overlay.data('fineBox').scrollY += Math.round(fx.start - now);
                        //         log(fx, now, fineBox.$overlay.data('fineBox').scrollY);
                        //     }
                        // }   
                    }
                );
            } 
        },

        publics : {
            getOptions : function () {
                return fineBox.$current.data('fineBox').options;
            },
            open : function (options) {
                // ;;; log('open', this, arguments);
                if (!this.data('fineBox')) {
                    this.fineBox(options);
                }
                fineBox.load(this);
                return this;
            },
            previous : function () {
                // fineBox.scrollToIfNotInView(fineBox.$overlay.data('fineBox').$previous, 'click.fineBox');
                fineBox.scrollToIfNotInView(fineBox.$overlay.data('fineBox').$previous, 'click.fineBox');
                fineBox.$overlay.data('fineBox').$previous.trigger('click.fineBox');
            },
            next : function () {
                // fineBox.scrollToIfNotInView(fineBox.$overlay.data('fineBox').$next, 'click.fineBox');
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
