/* jshint devel:true */
'use strict';

+function main( $, moment, jstz ) {
  var fn = {}
    , __ = {
        timestamp: 0
      , zones: []
    }
    , my = {
        moment: {}
      , timezone: false
      , elm: {
          date: $('.my .date')
        , time: $('.my .time')
        , zone: $('.my .zone')
        , moment: $('.my.moment')
      }
    }
    , your = {
        moment: {}
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

  fn.parseURL = function parseURL() {
    var search = []
      , url = {};

    try {
      search = decodeURIComponent( window.location.search )
      .split( '&' )
      .map(function each( segment ) {
        return segment.split('=')[ 1 ];
      });
      url.ts = parseInt( search[0] );
      url.mz = search[1];
      url.yz = search[2];
    }
    catch( err ) {
      window.location.search = '';
      return false;
    }
    return !url.ts || !url.mz || !url.yz ? false : url;
  };

  fn.tick = function tick() {
    fn.refresh = setTimeout(function timer() {
      fn.setTime();
      fn.tick();
    }, 200);
  };

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
    my.timezone = jstz.determine().name();
    navigator.geolocation.getCurrentPosition(function success( position ) {
      cb( null, position );
    }, function error( err ) {
      cb( err );
    });
  };

  fn.reverse = function reverse( zone ) {
    return zone.split('/').map(function each( word ) {
      if( word.indexOf( '_' ) > -1 ) {
        word = word.replace( /_/g, ' ' );
        return $.map( word.split( ' ' ), fn.capitalize ).join( ' ' );
      } 
      else if( word.indexOf( ' ' ) > -1 ) {
        word = word.replace( /\s/g , '_' );
        return $.map( word.split( '_' ), fn.capitalize ).join( '_' );
      }
      return fn.capitalize( word );
    }).reverse().join('/');
  };

  fn.capitalize = function capitalize( word ) {
    word = word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  fn.getYourTimezone = function getYourTimezone() {
    var retries = 0
      , index = 0
      , max = moment.tz.names().length
      , found = false
      , zone = '';
    while( !found ) {
      index = Math.floor( Math.random() * ( max - 0 + 1) ) + 0;
      zone = moment.tz.names()[ index ];
      if(( zone.indexOf( '/' ) > -1 && zone.toLowerCase().indexOf( 'etc' ) < 0 ) || retries > 9 ) {
        found = true;
      }
      retries++;
    }
    return zone;
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
    var zone = $( this ).val();
    if( $( this ).parent().hasClass( 'my' ) ) {
      my.timezone = fn.reverse( zone );
    }
    else {
      your.timezone = fn.reverse( zone );
    }
    fn.setTime( __.timestamp );
    return false;
  };

  fn.onEnterDatetime = function onEnterDatetime(e) {
    if( e.which !== 13 ) {
      return;
    }
    var isMy = $( this ).parent().hasClass( 'my' )
      , date = isMy ? my.elm.date.val() : your.elm.date.val()
      , time = isMy ? my.elm.time.val() : your.elm.time.val()
      , zone = isMy ? my.timezone : your.timezone
      , datetime = moment.tz( date + time, 'MMMM DoHH:mm:ss', zone );

    fn.setTime( datetime.unix() * 1000 );
    return false;
  };

  fn.onClickShare = function onClickShare(e) {
    e.preventDefault();
    var params = {
        ts: __.timestamp
      , mz: my.timezone
      , yz: your.timezone  
    } , uri = window.location.href + '?' + $.param( params );

    $( '.share' ).slideDown( 400, function done() {
      $( this ).find( 'input' ).val( uri ).select();
    });
  };

  fn.onClickClose = function onClickClose(e) {
    e.preventDefault();
    $( '.share' ).hide();
  };
  
  // Init
  var params = fn.parseURL();

  if( params !== false ) {
    my.timezone = params.mz;
    your.timezone = params.yz;
    fn.setTime( params.ts );
  }
  else {
    fn.tick();
    fn.detect(function( err, position ) {
      if( err ) {
        return;
      }
      var location = position.coords.latitude + ',' + position.coords.longitude;
      $.getJSON( 'https://maps.googleapis.com/maps/api/timezone/json?location=' + location, {
        timestamp: position.timestamp / 1000
      }, function success( res ) {
        my.timezone = res.timeZoneId;
      });
    });
  }

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

}(jQuery, moment, jstz);