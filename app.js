// Generated by CoffeeScript 1.7.1
(function() {
  var map, map_el;

  map_el = $("body").append("<div id='map'></div>");

  L.mapbox.accessToken = "pk.eyJ1IjoiYXJtaW5hdm4iLCJhIjoiSTFteE9EOCJ9.iDzgmNaITa0-q-H_jw1lJw";

  map = L.mapbox.map("map", "arminavn.ib1f592g").setView([40, -74.50], 9);

}).call(this);
