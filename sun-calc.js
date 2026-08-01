/* Small, dependency-free solar calculator based on the NOAA sunrise equations.
   Dates are returned as real UTC instants so the browser formats them in the
   visitor's local timezone, including daylight-saving changes. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LaBSun=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  var RAD=Math.PI/180, DEG=180/Math.PI, DAY=86400000;
  var SYNODIC_MONTH=29.530588853, KNOWN_NEW_MOON=Date.UTC(2000,0,6,18,14);
  function norm(v,max){return ((v%max)+max)%max}
  function sin(d){return Math.sin(d*RAD)}
  function cos(d){return Math.cos(d*RAD)}
  function tan(d){return Math.tan(d*RAD)}
  function asin(v){return Math.asin(v)*DEG}
  function acos(v){return Math.acos(v)*DEG}
  function atan(v){return Math.atan(v)*DEG}

  function parts(dateString){
    var p=String(dateString||'').split('-').map(Number);
    if(p.length!==3||!p[0]||!p[1]||!p[2])throw new Error('Expected YYYY-MM-DD');
    return {year:p[0],month:p[1],day:p[2]};
  }
  function dayOfYear(p){
    return Math.floor((Date.UTC(p.year,p.month-1,p.day)-Date.UTC(p.year,0,0))/DAY);
  }

  /* altitude is degrees above the geometric horizon. Sunrise uses -0.833°
     to account for refraction and the radius of the sun. */
  function event(dateString,latitude,longitude,altitude,rising){
    var p=parts(dateString), n=dayOfYear(p), lngHour=longitude/15;
    var t=n+((rising?6:18)-lngHour)/24;
    var m=0.9856*t-3.289;
    var l=norm(m+1.916*sin(m)+0.020*sin(2*m)+282.634,360);
    var ra=norm(atan(0.91764*tan(l)),360);
    var lQuadrant=Math.floor(l/90)*90, raQuadrant=Math.floor(ra/90)*90;
    ra=(ra+lQuadrant-raQuadrant)/15;
    var sinDec=0.39782*sin(l), cosDec=cos(asin(sinDec));
    var zenith=90-altitude;
    var cosH=(cos(zenith)-sinDec*sin(latitude))/(cosDec*cos(latitude));
    if(cosH>1||cosH<-1)return null;
    var h=(rising?360-acos(cosH):acos(cosH))/15;
    var localMean=h+ra-0.06571*t-6.622;
    var rawUtcHours=localMean-lngHour;
    /* The published NOAA shortcut wraps UTC to 0–24, which loses the date
       when a local sunset is after 00:00 UTC (or a sunrise is before it).
       Re-anchor the answer near the event's expected UTC hour first. */
    var expectedUtc=(rising?6:18)-lngHour;
    var adjustedUtc=rawUtcHours+24*Math.round((expectedUtc-rawUtcHours)/24);
    var dayOffset=Math.floor(adjustedUtc/24);
    var utcHours=norm(adjustedUtc,24);
    var whole=Math.floor(utcHours), mins=Math.floor((utcHours-whole)*60);
    var secs=Math.round((((utcHours-whole)*60)-mins)*60);
    return new Date(Date.UTC(p.year,p.month-1,p.day+dayOffset,whole,mins,secs));
  }

  function julian(date){return date.getTime()/DAY-0.5+2440588}
  function position(date,latitude,longitude){
    var n=julian(date)-2451545;
    var meanLong=norm(280.460+0.9856474*n,360);
    var anomaly=norm(357.528+0.9856003*n,360)*RAD;
    var ecliptic=(meanLong+1.915*Math.sin(anomaly)+0.020*Math.sin(2*anomaly))*RAD;
    var obliquity=(23.439-0.0000004*n)*RAD;
    var rightAscension=Math.atan2(Math.cos(obliquity)*Math.sin(ecliptic),Math.cos(ecliptic));
    var declination=Math.asin(Math.sin(obliquity)*Math.sin(ecliptic));
    var sidereal=norm(280.1600+360.9856235*n+longitude,360)*RAD;
    var hourAngle=sidereal-rightAscension, lat=latitude*RAD;
    var elevation=Math.asin(Math.sin(lat)*Math.sin(declination)+Math.cos(lat)*Math.cos(declination)*Math.cos(hourAngle));
    var azimuth=Math.atan2(Math.sin(hourAngle),Math.cos(hourAngle)*Math.sin(lat)-Math.tan(declination)*Math.cos(lat))+Math.PI;
    return {elevation:elevation*DEG,azimuth:norm(azimuth*DEG,360)};
  }

  function getDay(dateString,latitude,longitude){
    var sunrise=event(dateString,latitude,longitude,-0.833,true);
    var sunset=event(dateString,latitude,longitude,-0.833,false);
    if(!sunrise||!sunset)return null;
    var noon=new Date((sunrise.getTime()+sunset.getTime())/2);
    return {
      date:dateString,
      latitude:latitude,
      longitude:longitude,
      civilDawn:event(dateString,latitude,longitude,-6,true),
      sunrise:sunrise,
      morningGoldenEnd:event(dateString,latitude,longitude,6,true),
      solarNoon:noon,
      eveningGoldenStart:event(dateString,latitude,longitude,6,false),
      sunset:sunset,
      civilDusk:event(dateString,latitude,longitude,-6,false),
      daylightMinutes:Math.round((sunset-sunrise)/60000),
      maxElevation:position(noon,latitude,longitude).elevation
    };
  }

  function phaseAt(date,day){
    var t=date.getTime();
    if(!day)return 'night';
    if(t<day.civilDawn||t>=day.civilDusk)return 'night';
    if(t<day.sunrise)return 'blue-dawn';
    if(t<day.morningGoldenEnd)return 'golden-morning';
    if(t<day.eveningGoldenStart)return 'daylight';
    if(t<day.sunset)return 'golden-evening';
    return 'blue-dusk';
  }

  function direction(degrees){
    var names=['N','NE','E','SE','S','SW','W','NW'];
    return names[Math.round(norm(degrees,360)/45)%8];
  }

  /* The synodic cycle is stable enough for a local visual phase indicator.
     This is deliberately a phase calculation, not a claim of exact moonrise,
     altitude or ephemeris-grade position. */
  function moonPhase(date){
    var ageDays=norm((date.getTime()-KNOWN_NEW_MOON)/DAY,SYNODIC_MONTH);
    var fraction=ageDays/SYNODIC_MONTH;
    var illumination=(1-Math.cos(fraction*Math.PI*2))/2;
    var label;
    if(fraction<.03||fraction>=.97)label='New moon';
    else if(fraction<.22)label='Waxing crescent';
    else if(fraction<.28)label='First quarter';
    else if(fraction<.47)label='Waxing gibbous';
    else if(fraction<.53)label='Full moon';
    else if(fraction<.72)label='Waning gibbous';
    else if(fraction<.78)label='Last quarter';
    else label='Waning crescent';
    return {fraction:fraction,illumination:illumination,ageDays:ageDays,waxing:fraction<.5,label:label};
  }

  return {event:event,position:position,getDay:getDay,phaseAt:phaseAt,direction:direction,moonPhase:moonPhase};
});
