/*global jQuery: false, log: true */
/*jslint browser: true, plusplus: true, devel: true */

jQuery(document).ready(function ($) {

    'use strict';

    // $(['getOptions', 'open', 'previous', 'next', 'destroy']).each(function (i, name) {
    //     var fn = name;
    //     $('<a />', { 'href': '', 'className': fn, 'text': fn, 'style': 'color: white; text-decoration: none; padding: 10px 15px;' }).prependTo('body').click(function (e) {
    //         e.preventDefault();
    //         $(this).fineBox().fineBox(fn);
    //         return false;
    //     }).wrap('<p style="display: inline; margin: 0 10px; background: black; color: white; z-index: 20111;"/>');
    // });

    $('.finebox').fineBox({
        // 'transitionMode': 'minimal',
        // 'easingIn': 'easeInOutQuart',
        // 'easingOut': 'easeInOutQuart',
        // 'durationIn': 400,
        // 'durationOut': 400,
        // 'loop': true,
        // 
        // hookOnOpen : function () {
        //     log('Firing hookOnOpen !', this, arguments);
        //     var fineBox = this;
        // },
        // hookOnClose : function () {
        //     log('Firing hookOnClose !', this, arguments);
        // 
        //     var fineBox = this;
        // },
        // hookAlterOverlayData : function () {
        //     log('Firing hookAlterOverlayData !', this, arguments);
        // 
        //     var fineBox = this;
        //     return {};
        // },
        // hookInit : function () {
        //     log('Firing hookInit !', this, arguments);
        // } // end hookInit

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
