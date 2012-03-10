/*jslint browser: true, plusplus: true, devel: true */
var fineBoxPermalink = function (callbackUrl) {

    'use strict';

    // Import GET Vars
    (function () {
        document.$_GET = [];
        var urlHalves = window.location.href.substring(0, (window.location.href.length - window.location.hash.length)).split('?'),
            urlVars,
            urlVarPair,
            i;

        if (urlHalves[1]) {
            urlVars = urlHalves[1].split('&');
            for (i = 0; i <= (urlVars.length); i++) {
                if (urlVars[i]) {
                    urlVarPair = urlVars[i].split('=');
                    document.$_GET[urlVarPair[0]] = urlVarPair[1];
                }
            }
        }
    })();

    var redirectCallback,
        redirectArg,
        redirectTo;

    // Permalink finebox
    if (document.$_GET.image_id) {
        window.stop();
        redirectCallback = callbackUrl;
        redirectArg = window.location.pathname.slice(1) + window.location.search + window.location.hash; 
        redirectTo = redirectCallback + '#open=' + redirectArg;
        window.location = redirectTo;
    }

    // Set item to open
    document.fineBoxItemToOpen = null;
    if (/open=/.test(window.location.hash)) {
        document.fineBoxItemToOpen = (window.location.hash.slice(1).replace(/open=/, ''));
    }
};

fineBoxPermalink('/jquery/finebox/');
