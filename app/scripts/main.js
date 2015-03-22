/* jshint devel:true */
'use strict';

if (typeof jQuery === 'undefined') {
  throw new Error('This ninja requires jQuery');
}

if (typeof moment === 'undefined') {
  throw new Error('This ninja requires moment.js');
}

+function ($, moment) {

  var date = $('.date')
    , time = $('.time')
    , zone = $('.zone');

  var fn = {}
    , my = {
        timezone: false
      , moment: moment()
    };

  +function start() {
    fn.refresh = setTimeout(function timer() {
      my.moment = my.timezone ? moment.tz( my.timezone ) : moment();
      date.val( my.moment.format('MMMM Do') );
      time.val( my.moment.format('HH:mm:ss') );
      zone.val( my.timezone ? my.timezone : my.moment.format('Z z') );
      start();
    }, 500);
  }();

  fn.onClickHandler = function onClickHandler() {
    clearTimeout(fn.refresh);
  };

  fn.detect = function detect( cb ) {
    navigator.geolocation.getCurrentPosition(function success( position ) {
      cb( null, position );
    }, function error( err ) {
      cb( err );
    });
  };

  // Init
  fn.detect(function( err, position ) {
    var location = position.coords.latitude + ',' + position.coords.longitude;
    $.getJSON( 'https://maps.googleapis.com/maps/api/timezone/json?location=' + location, {
      timestamp: position.timestamp / 1000
    }, function success( data ) {
      my.timezone = data.timeZoneId;
    });
  });

  date.on('click', fn.onClickHandler);
  time.on('click', fn.onClickHandler);
  zone.on('click', fn.onClickHandler);

}(jQuery, moment);