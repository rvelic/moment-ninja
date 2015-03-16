/* jshint devel:true */
'use strict';

if (typeof jQuery === 'undefined') {
  throw new Error('This ninja requires jQuery');
}

+function ($, moment) {

  var date = $('.date')
    , time = $('.time')
    , zone = $('.zone')
    , refresh
    , now;

  +function start() {
    refresh = setTimeout(function() {
	    now = moment();
	    date.val(now.format('MMMM Do'));
	    time.val(now.format('HH:mm:ss'));
	    zone.val(now.format('Z z'));
	    start();
    }, 500);
  }();

  var onClickHandler = function onClickHandler() {
  	clearTimeout(refresh);
  };

  date.on('click', onClickHandler);
  time.on('click', onClickHandler);
  zone.on('click', onClickHandler);

}(jQuery, moment);