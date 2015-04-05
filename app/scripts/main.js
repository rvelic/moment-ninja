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
    , __ = {
        timestamp: 0
      , zones: []
    }
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
    }, 200);
  }();

  fn.setTime = function setTime( timestamp ) {
    __.timestamp = timestamp || moment().unix() * 1000;
    // Set my elements
    my.moment = my.timezone ? moment.tz( __.timestamp, my.timezone ) : moment( __.timestamp );
    my.elm.date.val( my.moment.format('MMMM Do') );
    my.elm.time.val( my.moment.format('HH:mm:ss') );
    my.elm.zone.val( my.timezone ? fn.reverse( my.timezone ) : my.moment.format('Z z') );
    my.elm.moment.removeClass('day night').addClass( fn.dayOrNight( my.moment ) );
    // Set your elements
    your.moment = your.timezone ? moment.tz( __.timestamp, your.timezone ) : moment( __.timestamp );
    your.elm.date.val( your.moment.format('MMMM Do') );
    your.elm.time.val( your.moment.format('HH:mm:ss') );
    your.elm.zone.val( your.timezone ? fn.reverse( your.timezone ) : your.moment.format('Z z') );
    your.elm.moment.removeClass('day night').addClass( fn.dayOrNight( your.moment ) );
  };

  fn.dayOrNight = function dayOrNight( datetime ) {
    return datetime.hours() > 7 && datetime.hours() < 20 ? 'day' : 'night';
  };

  fn.detect = function detect( cb ) {
    navigator.geolocation.getCurrentPosition(function success( position ) {
      cb( null, position );
    }, function error( err ) {
      cb( err );
    });
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
    if( e.which !== 13 ) {
      return;
    }
    // only care about enter
    var zone = $( this ).val();
    if( $( this ).parent().hasClass( 'my' ) ) {
      my.timezone = fn.reverse( zone, true );
    }
    else {
      your.timezone = fn.reverse( zone, true );
    }
    fn.setTime( __.timestamp );
    return false;
  };

  fn.onEnterDatetime = function onEnterDatetime(e) {
    if( e.which !== 13 ) {
      return;
    }
    // only care about enter
    var isMy = $( this ).parent().hasClass( 'my' )
      , date = isMy ? my.elm.date.val() : your.elm.date.val()
      , time = isMy ? my.elm.time.val() : your.elm.time.val()
      , zone = isMy ? my.timezone : your.timezone
      , datetime = moment.tz( date + time, 'MMMM DoHH:mm:ss', zone );

    __.timestamp = datetime.unix() * 1000;
    fn.setTime( __.timestamp );
    return false;
  };

  fn.onClickShare = function onClickShare() {
    var params = {
        ts: __.timestamp
      , mz: my.timezone
      , yz: your.timezone  
    };

    $('.share').slideDown( 400, function done() {
      $( this ).find('input').val( window.location.href + $.param( params ) ).select();
    });
  };

  fn.onClickClose = function onClickClose() {
    $('.share').hide();
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

  __.zones = $.map( moment.tz.names(), fn.reverse );
  your.timezone = fn.getYourTimezone();

  $('.zone').tabcomplete( __.zones, tabOptions );
  $('.btn-share').on( 'click', fn.onClickShare );
  $('.btn-close').on( 'click', fn.onClickClose );

  my.elm.date.on( 'click', fn.onClickStopTime );
  my.elm.time.on( 'click', fn.onClickStopTime );
  my.elm.zone.on( 'click', fn.onClickSelectInput );

  your.elm.date.on( 'click', fn.onClickStopTime );
  your.elm.time.on( 'click', fn.onClickStopTime );
  your.elm.zone.on( 'click', fn.onClickSelectInput );

  my.elm.date.keypress( fn.onEnterDatetime );
  my.elm.time.keypress( fn.onEnterDatetime );
  my.elm.zone.keypress( fn.onEnterZone );

  your.elm.date.keypress( fn.onEnterDatetime );
  your.elm.time.keypress( fn.onEnterDatetime );
  your.elm.zone.keypress( fn.onEnterZone );

}(jQuery, moment);