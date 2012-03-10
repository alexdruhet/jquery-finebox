/*global jQuery: false, log: true */
/*jslint browser: true, plusplus: true, devel: true */

jQuery(document).ready(function ($) {

    'use strict';

    $(['getOptions', 'open', 'previous', 'next', 'destroy']).each(function (i, name) {
        var fn = name;
        $('<a />', { 'href': '', 'className': fn, 'text': fn, 'style': 'color: white; text-decoration: none; padding: 10px 15px;' }).prependTo('body').click(function (e) {
            e.preventDefault();
            $(this).fineBox().fineBox(fn);
            return false;
        }).wrap('<p style="display: inline; margin: 0 10px; background: black; color: white; z-index: 20111;"/>');
    });
    
    $('.finebox').fineBox({
        'transitionMode': 'minimal',
        'easingIn': 'easeInOutQuart',
        'easingOut': 'easeInOutQuart',
        'durationIn': 400,
        'durationOut': 400,
        'loop': true,
        'hash': document.fineBoxItemToOpen,

        hookOnOpen : function () {
            log('Firing hookOnOpen !', this, arguments);
        
            var fineBox = this;
        },
        hookOnClose : function () {
            log('Firing hookOnClose !', this, arguments);
        
            var fineBox = this;
        },
        hookAlterOverlayData : function () {
            log('Firing hookAlterOverlayData !', this, arguments);
        
            var fineBox = this;
            return {};
        },
        hookInit : function () {
            log('Firing hookInit !', this, arguments);

            var fineBox = this,
                a = 1, 
                t = false;

            if ($.fn.depagify && $('.pagination .next').length > 0) {
    
                $('ul.list:first', '#gallery-wrapper')
                    .before('<div id="page-1" class="page-separator clearfix"><h2>Page ' + a + '</h2></div>')
                    .wrap('<div />');
    
                $('.pagination:first a.next', '#gallery-wrapper').depagify(
                    {
                        container: '#gallery-wrapper',
                        filter: 'ul.list',
                        trigger: function (e) {
                            var w = $(window),
                                progress = w.scrollTop() + w.height(),
                                threshold = $('#footer').offset().top;
    
                            return (progress >= threshold && (t || a === 1)) ? true : false;
                        },
                        request: function (options) {
                            var m = this.get(0).search.match(/\d+/g);
                            a = m ? m[0] : (a + 1);
                            t = false;
                            $(options.container).append('<div id="page-' + a + '" class="page-separator loader clearfix"><strong>Loading page ' + a + '&hellip;</strong></div>');
                        },
                        success: function (event, options) {
                            //log('success', this, arguments, event.responseText, options.container);
                            $('.loader', options.container)
                                .removeClass('loader')
                                .find('strong').remove().end()
                                .html('<h2>Page ' + a + '</h2>&nbsp;<a href="javascript:" onclick="document.location.hash=\'#page\'" class="ui-state-default ui-corner-all"><span class="ui-icon ui-icon-arrowthickstop-1-n"></span></a><a href="javascript:" onclick="document.location.hash=\'#page-' + (a - 1) + '\'" class="ui-state-default ui-corner-all"><span class="ui-icon ui-icon-arrowthick-1-n"></span></a>');
    
                            $('.finebox:not(' + fineBox.$overlay.data('fineBox').options.prefix + '-processed)').fineBox(fineBox.$overlay.data('fineBox').options);
                        },
                        effect: function () {
                            var $this = $(this),
                                $lis = $this.find('ul.list li');
                            $lis.hide();
                            $this.slideDown('slow', function () {
                                (function showNext(jq) {
                                    jq.eq(0).fadeIn('fast', function () {
                                        (jq = jq.slice(1)).length && showNext(jq);
                                        if (jq.length === 0) { 
                                            t = true; 
                                        }
                                    });
                                })($lis);
                            });
                        }
                    }
                );
                $('.pagination').remove();
            }
    
        } // end hookInit
    
    });
    
});

// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
if (typeof window.log === 'undefined') {
    window.log = function () {
        "use strict";
        if (jQuery.browser.msie && jQuery.browser.version < 7) {
            alert(Array.prototype.slice.call(arguments));
            return false;
        }
        log.history = log.history || [];
        log.history.push(arguments);
        if (console) {
            console.log(Array.prototype.slice.call(arguments));
        }
    };
}
