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
    , timestamp
    , zones = []
    , my = {
        moment: moment()
      , timezone: false
      , elm: {
          date: $('.my .date')
        , time: $('.my .time')
        , zone: $('.my .zone')
        , moment: $('.my.moment')
      }
    }
    , your = {
        moment: moment()
      , timezone: false
      , elm: {
          date: $('.your .date')
        , time: $('.your .time')
        , zone: $('.your .zone')
        , moment: $('.your.moment')
      }
    }
    , tabOptions = {
      hint: 'select',
    };

  +function tick() {
    fn.refresh = setTimeout(function timer() {
      fn.setTime();
      tick();
    }, 500);
  }();

  fn.setTime = function setTime( unixtime ) {
    timestamp = unixtime || moment().unix() * 1000;
    // Set my elements
    my.moment = my.timezone ? moment.tz( timestamp, my.timezone ) : moment( timestamp );
    my.elm.date.val( my.moment.format('MMMM Do') );
    my.elm.time.val( my.moment.format('HH:mm:ss') );
    my.elm.zone.val( my.timezone ? fn.reverse( my.timezone ) : my.moment.format('Z z') );
    my.elm.moment.addClass( my.moment.format('a') );
    // Set your elements
    your.moment = your.timezone ? moment.tz( timestamp, your.timezone ) : moment( timestamp );
    your.elm.date.val( your.moment.format('MMMM Do') );
    your.elm.time.val( your.moment.format('HH:mm:ss') );
    your.elm.zone.val( your.timezone ? fn.reverse( your.timezone ) : your.moment.format('Z z') );
    your.elm.moment.addClass( your.moment.format('a') );
  };

  fn.detect = function detect( cb ) {
    navigator.geolocation.getCurrentPosition(function success( position ) {
      cb( null, position );
    }, function error( err ) {
      cb( err );
    });
  };

  fn.getYourTimezone = function getYourTimezone() {
    var index = Math.floor(Math.random() * (moment.tz.names().length - 0 + 1)) + 0;
    return moment.tz.names()[ index ];
  };

  fn.onClickStopTime = function onClickStopTime() {
    clearTimeout( fn.refresh );
  };

  fn.onClickSelectInput = function onClickSelectInput() {
    fn.onClickStopTime();
    $( this ).select();
  };

  fn.onEnterZone = function onEnterZone(e) {
    if( e.which === 13 ) {
      var zone = $( this ).val();
      your.timezone = fn.reverse( zone, true );
      fn.setTime( timestamp );
      return false;
    }
  };

  fn.reverse = function reverse( zone, capitalize ) {
    return zone.split('/').map(function each( word ) {
      if( capitalize !== true ) {
        return word;
      }
      word = word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).reverse().join('/');
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

  
  my.elm.date.on('click', fn.onClickStopTime);
  my.elm.time.on('click', fn.onClickStopTime);
  my.elm.zone.on('click', fn.onClickSelectInput);

  your.elm.date.on('click', fn.onClickStopTime);
  your.elm.time.on('click', fn.onClickStopTime);
  your.elm.zone.on('click', fn.onClickSelectInput);

  your.elm.zone.keypress( fn.onEnterZone );

  zones = $.map( moment.tz.names(), fn.reverse );
  $('.zone').tabcomplete( zones, tabOptions );
  your.timezone = fn.getYourTimezone();

}(jQuery, moment);

