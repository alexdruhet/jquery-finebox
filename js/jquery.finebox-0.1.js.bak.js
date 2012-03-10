;(function($) {

$.fn.finebox = function(options) {

  // private vars
  var opts = $.extend({}, $.fn.finebox.defaults, options),
  open = false, fn = this,
  
  // jQuery objects references
  $overlay, $wrapper, $container;

  // private methods
  function touchPlaceholder() {

    // Fine Box overlay element
    if ($('#finebox-overlay').length == 0) {
      $overlay = $('<div />', {'id':'finebox-overlay'}).css({
        'position': 'fixed',
        'left': 0,
        'top': 0,
        'width':'100%',
        'height':'100%',
        'overflow': 'hidden',
        'z-index': 13996
      }).hide().appendTo('body');
    }

    // Fine Box content wrapper element
    if ($('#finebox-wrapper').length == 0) {
      $wrapper = $('<div />', {'id':'finebox-wrapper'}).css({
        'position': 'fixed',
        'left': 0,
        'top': 0,
        'width':'100%',
        'height':'100%',
        'background-color': 'transparent',
        'overflow': 'hidden',
        'z-index': 13997
      }).hide().appendTo('body');
    }

    // Fine Box content container element
    if ($('#finebox-container').length == 0) {
      $container = $('<div />', {'id':'finebox-container'}).css({
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'overflow': 'hidden'
      }).appendTo('#finebox-wrapper');
    }

    // Events binding for these elements
    bindPlaceholderEvents();

  }
  
  function bindPlaceholderEvents() {
    
    $overlay.not('.finebox-processed').bind('click.finebox', function() {
      closeItem();
      return false;
    }).addClass('finebox-processed');
    
    $(document).bind('keypress.finebox', function(event) {
      // Enable close with esc
      if (event.keyCode == 27) {
        closeItem();
        return false;
      }
    });
    
  }
  
  function bindEvents($element) {
    $element.bind({
      'click.finebox': function(e) {
        e.preventDefault();
        log(this, arguments, $(this).finebox);
        //fn.methods.load();
        //$(this).methods.load();
        //$(this).finebox().load;
        return false;
      },
      'mouseenter.finebox': function() {
        $(this).addClass('hover');
        return false;
      },
      'mouseleave.finebox': function() {
        $(this).removeClass('hover');
        return false;
      }
    });
  }

  function enrole() {}

  function onWindowResize() {}

  function positionPlaceholder() {}

  function closeItem() {}

  function bindPreviousTransition() {}

  function bindNextTransition() {}

  function openPrevious() {}

  function openNext() {}

  function openFromUrl() {}
  
  // Public methods
  this.publicMethods = {
    $this: null,
    options: {}
  };
  log(this, arguments);
  this.methods.init = function(element, options) {
    //log(this, arguments);
    this.$this = element;
    this.options = options;
    if (this.$this.hasClass('finebox-processed')) {
      return;
    }
    this.$this.addClass('finebox-processed');
    bindEvents( this.$this );
  };
  
  this.methods.load = function() {
    //log(this, arguments);
    return;
    
    if (open) {
  		return;
  	}

    $parent = this.$this.parent();
    log('openItem', this.$this, this.methods.options, $parent, arguments);
    return;

    $.ajax({
      type: 'GET',
      url: $this.attr('href'),
      cache: true,
      dataType: 'html',
      async: true,
      beforeSend: function() {
        log(this.options);
        switch (this.options.transitionMode) {
          case 'full':

            break;
          case 'minimal':
          default:

        }

        // $('body').css('width', docW);
        // $('html, body').css('overflow', 'hidden').scrollTop(top).scrollLeft(left);
        // 
        // $item_container.css('position', 'relative').find('img').fadeTo('slow', 0.25);
        // 
        // if ($('.loader', $item_container).length==0) {
        //   (function(){
        //     $('<span/>', { 
        //       'class': 'loader', 
        //       'style': 'display: block; position: absolute; top: '+($item_container.find('.thumb-link').height()-startH)+'px; left: 0; width: 100%; height: '+startH+'px; background-position: center center;'
        //     }).hide().prependTo($item_container).fadeIn('slow');
        //   })(); 
        // }
        // 
        // gapY = top>0 ? top : 0;
        // gapX = left>0 ? left : 0;
        // startX = Math.round($item_container.find('.thumb-link img').offset().left-gapX);
        // startY = Math.round($item_container.find('.thumb-link img').offset().top-gapY);
        // previous = $item_container.parent().prev('li');
        // next = $item_container.parent().next('li');
        // 
        // itemData = {
        //   'CSSorigin': {
        //     'width': startW,
        //     'height': startH,
        //     'top': startY,
        //     'left': startX
        //   },
        //   'scrollX': left,
        //   'scrollY': top,
        //   'current': $item_container,
        //   'previous': previous,
        //   'next': next
        // };
        // $('#gallery-item-placeholder-container').css(itemData.CSSorigin).removeData('itemData').data('itemData', itemData);
        // 
        // APG.isOpening = true;
      },
      success: function(data) {

        // var 
        // $fragment = $(data).find('#main-section'),
        // $bigimg = $fragment.find('.photo').detach(), 
        // $tmpimg = $bigimg.find('img').clone(),
        // $pager = $('a.page-previous, a.page-next, a.page-up', $fragment);
        // 
        // imgW = null;
        // imgH = null;
        // $tmpimg.css('visibility', 'hidden').appendTo('body').attr('id', 'tmpbigimg');
        // 
        // $fragment.attr('id', null).addClass('main-section');
        // $fragment.find('#content-tools').attr('id', null).addClass('content-tools');
        // 
        // APG.isOpening = false;
        // APG.currentHref = this.url;
        // document.location.hash = 'open='+encodeURIComponent(APG.currentHref);
        // //$('html,body').scrollTop(top).scrollLeft(left);
        // 
        // APG.openItem($item_container, $tmpimg, $fragment, $pager);

      } // end success
    });

  };
  
  // Public method calling logic
  if (this.publicMethods[method]) {
    return this.publicMethods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
  } 
  else if ( typeof method === 'object' || ! method ) {
    return methods.init.apply( this, arguments );
  } 
  else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
  }
  
  // Creates placeholder elements before iteration
  touchPlaceholder();

  return this.each(function() {
    
    var $this = $(this),
    o = $.meta ? $.extend({}, opts, $this.data()) : opts;
    
    fn.methods.init($this, o);

  });

};

// default options
$.fn.finebox.defaults = {
  // Transition mode : full || minimal
  transitionMode: 'full'
};

})(jQuery);

window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};