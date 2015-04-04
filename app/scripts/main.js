/* jshint devel:true */
'use strict';

if (typeof jQuery === 'undefined') {
  throw new Error('This ninja requires jQuery');
}

if (typeof moment === 'undefined') {
  throw new Error('This ninja requires moment.js');
}

+function main($, moment) {
  var fn = {}
    , zones = []
    , my = {
        moment: moment()
      , timezone: false
      , elm: {
          date: $('.my .date')
        , time: $('.my .time')
        , zone: $('.my .zone')
      }
    }
    , your = {
        moment: moment()
      , timezone: false
      , elm: {
          date: $('.your .date')
        , time: $('.your .time')
        , zone: $('.your .zone')
      }
    }
    , tabOptions = {
      arrowKeys: true,
      hint: 'select',
      wrapInput: false
    };

  fn.reverse = function reverse( zone ) {
    return zone.split('/').reverse().join('/');
  };
  zones = $.map( moment.tz.names(), fn.reverse );

  +function start() {
    fn.refresh = setTimeout(function timer() {
      // Set my elements
      my.moment = my.timezone ? moment.tz( my.timezone ) : moment();
      my.elm.date.val( my.moment.format('MMMM Do') );
      my.elm.time.val( my.moment.format('HH:mm:ss') );
      my.elm.zone.val( my.timezone ? fn.reverse( my.timezone ) : my.moment.format('Z z') );
      // Set your elements
      your.moment = your.timezone ? moment.tz( your.timezone ) : moment();
      your.elm.date.val( your.moment.format('MMMM Do') );
      your.elm.time.val( your.moment.format('HH:mm:ss') );
      your.elm.zone.val( your.timezone ? fn.reverse( your.timezone ) : your.moment.format('Z z') );
      start();
    }, 500);
  }();

  fn.onClickHandler = function onClickHandler() {
    clearTimeout( fn.refresh );
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

  fn.getYourTimezone = function getYourTimezone() {
    var index = Math.floor(Math.random() * (moment.tz.names().length - 0 + 1)) + 0;
    return moment.tz.names()[ index ];
  };

  // Run everything

  my.elm.date.on('click', fn.onClickHandler);
  my.elm.time.on('click', fn.onClickHandler);
  my.elm.zone.on('click', fn.onClickHandler);

  your.elm.date.on('click', fn.onClickHandler);
  your.elm.time.on('click', fn.onClickHandler);
  your.elm.zone.on('click', fn.onClickHandler);

  $('.zone').tabcomplete( zones, tabOptions );
  your.timezone = fn.getYourTimezone();

}(jQuery, moment);

