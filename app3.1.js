/**
 * Created by liapetronio on 1/2/15.
 */
// Generated by CoffeeScript 1.7.1
(function() {


    var margin = {t: 10, r: 10, b: 80, l: 40},
        margin2 = {t: 230, r: 10, b: 20, l: 40},
        width = $('.canvas').width() - margin.l - margin.r,
        height = $('.canvas').height() - margin.t - margin.b
        height2 = $('.canvas').height() - margin2.t - margin2.b;

    var eventData;
    var circle;
    var map;
    var parseDate = d3.time.format("%m/%d/%y").parse;
//----------------------------------------------------------------------above is the global variable so that you can use it in multiple functions
    var scales= {};
    scales.cSize = d3.scale.sqrt().domain([0, 100]).range([0,20]);
    scales.r = d3.scale.sqrt().domain([0, 70]).range([0,17]);
    scales.x = d3.time.scale().range([0, width]);
    scales.x2 = d3.time.scale().range([0, width]);
    scales.y = d3.scale.linear().domain([0, 75]).range([height, 0]);
    scales.y2 = d3.scale.linear().domain([0, 75]).range([height2, 0]);

//----------------------------------------------------------------------
    map_el = $("body").append("<div id='map'></div>");

    L.mapbox.accessToken = "pk.eyJ1IjoiYXJtaW5hdm4iLCJhIjoiSTFteE9EOCJ9.iDzgmNaITa0-q-H_jw1lJw";

    map = L.mapbox.map("map", {
        zoomControl: false
    }).setView([40, -100.50], 5);

    L.control.layers({
        "Base Map": L.mapbox.tileLayer("arminavn.ib1f592g"), //satellite
        "Open Street": L.mapbox.tileLayer("arminavn.jl495p2g").addTo(map) //street map
    }).addTo(map);
    map.scrollWheelZoom.disable();


    var xAxis = d3.svg.axis().scale(scales.x).orient('bottom').tickSize(-height, 0).tickSubdivide(true),
        xAxis2 = d3.svg.axis().scale(scales.x2).orient('bottom').tickSize(-height2, 0).tickSubdivide(true),
        yAxis = d3.svg.axis().scale(scales.y).tickSize(-width, 0).orient("left");

    var brush = d3.svg.brush()
        .x(scales.x2)
        .on("brush", brushed);

    var line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return scales.x(d.date); })
        .y(function(d) { return scales.y(d.totalVictims); });

    var line2 = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return scales.x2(d.date); })
        .y(function(d) { return scales.y2(d.totalVictims); });


    var svg = d3.select(".canvas").append("svg")
        .attr("width", width + margin.l + margin.r)
        .attr("height", height + margin.t + margin.b);

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    /* Initialize the SVG layer */
    map._initPathRoot()

    /* We simply pick up the SVG from the map object */
    var svgMap = d3.select("#map").select("svg"),
        circGroup = svgMap.append("g");

    var focus = svg.append("g") //selected area
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")");

    var context = svg.append("g") //entire area
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.l + "," + margin2.t + ")");

    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    var div = d3.select(".tracker-chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

var hoverLineGroup = focus.append("g")
    .attr("class", "hover-line");

var hoverLine = hoverLineGroup
    .append("line")
    .attr("x1", 10).attr("x2", 10)
    .attr("y1", 0).attr("y2", height+10);

    var hoverDate = hoverLineGroup.append('text')
        .attr("class", "hover-text")
        .attr('y', height - (height-10));

hoverLine.style("opacity", 1e-6);
    var div = d3.select(".tracker-chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);





//-----------------------------------------------------------
    function drawTimeLine(eventData) {

        scales.x.domain(d3.extent(eventData.map(function(d) { return d.date; })));
        scales.y.domain([0, d3.max(eventData.map(function(d) { return d.totalVictims; }))]);
        scales.x2.domain(scales.x.domain());
        scales.y2.domain(scales.y.domain());


        focus.append("path")
            .datum(eventData)
            .attr("class", "line")
            .attr("d", line);

        circle = focus.append("g");
        circle
            .style("display", "none");
        circle
            .append("circle")
            .attr("r",3);

//        focus
//            .append("rect")
//            .attr("class", "overlay")
//            .attr("width", width)
//            .attr("height", height)
//            .on("mouseover", function() { circle.style("display", null); })
////            .on("mousemove", mousemove)

        context.append("path") //bottom brush part
            .datum(eventData)
            .attr("class", "line")
            .attr("d", line2);

        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7);

        addTooltip(div, eventData[0], "Assets");

        drawPoint(eventData);

    }

    d3.select(".tracker-chart").on("mouseover", function() {
    }).on("mousemove", function() {
        //console.log('mousemove', d3.mouse(this));
        var mouse_x = d3.mouse(this)[0];
        var mouse_y = d3.mouse(this)[1];
        var graph_y = scales.y.invert(mouse_y);
        var graph_x = scales.x.invert(mouse_x);

        hoverDate.text(function(d){return d.date}(graph_x));
        hoverDate.attr('x', mouse_x);

        hoverLine.attr("x1", mouse_x).attr("x2", mouse_x)
        hoverLine.style("opacity", 1);
    }).on("mouseout", function() {

    });

    function addTooltip(div, eventData, label) {
        focus.selectAll("dot")
            .data(eventData)
            .enter().append("circle")
            .attr("class", ".dot")
            .attr("r", 5)
            .attr("cx", function (d) {
                return scales.x(d.date);
            })
            .attr("cy", function (d) {
                return scales.y(d.totalVictims);
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(50)
                    .style("opacity", .9);
                div.html(label + "<br />" + d.date + "<br />" + "$" + (d.totalVictims).toFixed(3) + " Million")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

            }).on("mouseout", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
    }
//-----------------------------------------------------------
    function brushed() {
        scales.x.domain(brush.empty() ? scales.x2.domain() : brush.extent());
        focus.select(".line").attr("d", line);
        focus.select(".x.axis").call(xAxis);
        circle
            .attr("cx",function(d){ return scales.x(d.date)})
            .attr("cy", function(d){ return scales.y(d.totalVictims)})

    }
//
//    function mousemove() {
//        var x0 = scales.x.invert(d3.mouse(this)[0]),
//            i = bisectDate(eventData, x0, 1),
//            d0 = eventData[i - 1],
//            d1 = eventData[i],
//            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
//        circle
//            .attr("transform", "translate(" + scales.x(d.date) + "," + scales.y(d.totalVictims) + ")");
//
//
//        console.log(focus);
//
//        d3.selectAll(".map-circles")
//            .transition()
//            .delay(0)
//            .duration(40)
//            .attr("r", 2.7);
//
//        d3.select($("#"+ d.id)[0])
//            .transition()
//            .duration(40)
//            .attr("r", 16);
//    }

    function drawPoint(eventData){

        console.log(map);
        var feature = circGroup.selectAll(".circle")

            .data(eventData, function(d){ return d.date; })
            .enter().append("circle")
            .style("stroke", "black")
            .style("opacity", .6)
            .style("fill", "red")
            .attr("r", 2.7)
            .attr("class","map-circles")
            .attr("id",function(d){ return d.id} );



        map.on("viewreset", update);
        update();

        function update() {
        feature.attr("transform",
        function(d) { return "translate("+ map.latLngToLayerPoint(d.LatLng).x +","+ map.latLngToLayerPoint(d.LatLng).y +")"; })}

    }

    //-----------------------------------------------------------
//    function onMouseEnter(d) {
//
//        var container = d3.select('.canvas').node();
//        var mouse = d3.mouse(container);
//
//        var tooltip = d3.select('.tooltip').style('visibility', 'visible');
//
//        tooltip.select('h2').html(d.name + "<br/>" + "desc: " + d.description + "<br/>" + "wounded: " + d.wound + "<br/>" + "year: " + d.date)
//
//        console.log(d);
//        var tooltipWidth = $('.tooltip').width();
//
//        map.setView(new L.LatLng(d.lat, d.lng), 5);
//        d3.select($("#"+ d.id)[0])
//            .transition()
//            .duration(400)
//            .attr("r", 16);
//    }




//---------------------------------------------------------------------
    function dataLoaded(err, data) {
        if (err) console.error(err);

        eventData = data;

        eventData.forEach(function(d) {
            var date = new Date(d.date);
            d.date = date;
            d.LatLng = new L.LatLng(d.lat, d.lng) });


        console.log("right after event data",eventData);
        console.log(d3.time.format("%m/%d/%Y"));

        drawTimeLine(eventData);

    }
    //-----------------------------------------------------------QUEUE
    queue()

        .defer(d3.csv, "data/MSA_Stanford_Complete_Database.csv", function(d){
            return {
                totalVictims: (+d["Total Number of Victims"] == " " ? undefined: +d["Total Number of Victims"]),
                kill: (+d["Number of Victim Fatalities"] == " " ? undefined: +d["Number of Victim Fatalities"]),
                wound: (+d["Number of Victims Injured"] == " " ? undefined: +d["Number of Victims Injured"]),
                id: +d["CaseID"],
                shooterAge: (+d["Average Shooter Age"] == " " ? undefined: +d["Average Shooter Age"]),
                shooterSex: (d["Shooter Sex"] == " " ? undefined: d["Shooter Sex"]),
                shooterRace: (d["Shooter Race"] == " " ? undefined: d["Shooter Race"]),
                typeOfGun: (d["Type of Gun – General"] == " " ? undefined: d["Type of Gun – General"]),
                numberOfGuns: (+d["Total Number of Guns"] == " " ? undefined: +d["Total Number of Guns"]),
                fateOfShooter: (d["Fate of Shooter"] == " " ? undefined: d["Fate of Shooter"]),
                mentalIllness: (d["History of Mental Illness - General"] == " " ? undefined: d["History of Mental Illness - General"]),
                schoolRelated: (d["School Related"] == " " ? undefined: d["School Related"]),
                placeType: (d["Place Type"] == " " ? undefined: d["Place Type"]),
                description: (d["Description"] == " " ? undefined: d["Description"]),
                lat: (+d["lat"] == " " ? undefined: +d["lat"]),
                lng: (+d["lng"] == " " ? undefined: +d["lng"]),
                LatLng: [+d["lat"], +d["lng"]],
                date: (d["Date"])
            }
        })
        .await(dataLoaded);
    //-----------------------------------------------------------

}).call(this);
