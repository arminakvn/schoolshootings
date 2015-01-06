(function() {

    var margin = {t: 20, r: 40, b: 80, l: 70},
        margin2 = {t: 150, r: 40, b: 20, l: 70},
        width = $('.canvas').width() - margin.l - margin.r,
        height = $('.canvas').height() - margin.t - margin.b
        height2 = $('.canvas').height() - margin2.t - margin2.b;

    var eventData, circle, focusPoints, contextPoints, hoverLine, map;
//    var parseDate = d3.time.format("%m/%d/%y").parse;
//----------------------------------------------------------------------
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
    }).setView([38, -100.50], 4);
    L.control.layers({
        "Base Map": L.mapbox.tileLayer("arminavn.ib1f592g"), //satellite
        "Open Street": L.mapbox.tileLayer("arminavn.klb2p2la").addTo(map) //street map
    }).addTo(map);
    map.scrollWheelZoom.disable();
    /* Initialize the SVG layer */
    map._initPathRoot()
    /* We simply pick up the SVG from the map object */
    var svgMap = d3.select("#map").select("svg"),
        circGroup = svgMap.append("g");
    var xAxis = d3.svg.axis().scale(scales.x).orient('bottom'),
        xAxis2 = d3.svg.axis().scale(scales.x2).orient('bottom').tickSize(-height2, 0).tickSubdivide(true),
        yAxis = d3.svg.axis().scale(scales.y).tickSize(-width, 0).orient("left"),
        yAxis2 = d3.svg.axis().scale(scales.y2).orient("left").tickSize(-7, 0);
    var brush = d3.svg.brush()
        .x(scales.x2)
        .on("brush", brushed);
    var line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return scales.x(d.date); })
        .y(function(d) { return scales.y(d.totalVictims); });
    var svg = d3.select(".canvas").append("svg")
        .attr("width", width + margin.l + margin.r)
        .attr("height", height + margin.t + margin.b);
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    var focus = svg.append("g") //selected area
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")");
    var context = svg.append("g") //entire area
        .attr("clip-path", "url(#clip)")
        .attr("class", ".context")
        .attr("transform", "translate(" + margin2.l + "," + margin2.t + ")");
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;
//-----------------------------------------------------------Parallel

    function drawTimeLine(eventData) {

        scales.x.domain(d3.extent(eventData.map(function(d) { return d.date; })));
        scales.y.domain([0, d3.max(eventData.map(function(d) { return d.totalVictims; }))]);
        scales.x2.domain(scales.x.domain());
        scales.y2.domain(scales.y.domain());

        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);
        context.append("g")
            .attr("class", "y axis")
            .call(yAxis2);
        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 +7);
        contextPoints = context.append("g");
        contextPoints.selectAll('.dot')
            .data(eventData)
            .enter().append("circle")
            .attr('class', 'dot')
            .attr("cx",function(d){ return scales.x2(d.date);})
            .attr("cy", function(d){ return scales.y2(d.totalVictims);})
            .attr("r", 1.3)
        focus.append("g") //top main graph
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height  + ")")
            .call(xAxis)
        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        focus.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("transform", "translate(0," + height  + ")")
            .text("date");
        focus.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -20)
            .attr("y", 0)
            .text("total victims");
        focus.append("path")
            .datum(eventData)
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr("d", line)
            .style("opacity",.5);
        focusPoints = focus.append("g");
        focusPoints.selectAll('.dot')
            .data(eventData)
            .enter().append("circle")
            .attr('class', 'dot')
            .attr("clip-path", "url(#clip)")
            .attr("cx",function(d){ return scales.x(d.date);})
            .attr("cy", function(d){ return scales.y(d.totalVictims);})
            .attr("r", 1)
            .style("fill", "red");
        focus
            .append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {
                circle.style("display", null);
                hoverLine.style("display", null); })
            .on("mousemove", mousemove)
        hoverLine = focus.append("g");
        hoverLine
            .style("display", "none")
            .style("stroke-width",.3)
            .style("stroke", "red");
        hoverLine
            .append("line")
            .attr("y1", 0)
            .attr("y2", height+10);
        circle = focus.append("g");
        circle
            .style("display", "none");
        circle
            .append("circle")
            .attr("r",3)
            .style("fill", "red");
        drawPoint(eventData);
    }
    function drawPoint(eventData){
        console.log(map);
        var feature = circGroup.selectAll(".circle")
            .data(eventData, function(d){ return d.date; })
            .enter().append("circle")
            .style("stroke", "black")
            .style("opacity", 0.6)
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
    function brushed() {
        scales.x.domain(brush.empty() ? scales.x2.domain() : brush.extent());
        focus.select(".line").attr("d", line);
        focus.select(".x.axis").call(xAxis);
        var s = brush.extent();
        selected = focusPoints.selectAll(".dot")
            .attr("cx",function(d){ return scales.x(d.date)})
            .attr("cy", function(d){ return scales.y(d.totalVictims)})
            .classed("selected", function (d){ return s[0] <= d.date && d.date <= s[1]; });
        console.log("s", s);
        d3.selectAll(document.getElementsByClassName("map-circles"))
            .classed("selected", function (d){ return s[0] <= d.date && d.date <= s[1]; })
            .transition().duration(40)
            .style("opacity", 0)
            .style("stroke", "none");
        d3.selectAll(document.getElementsByClassName("map-circles selected"))
            .transition().duration(40)
            .style("opacity", 80)
            .style("stroke", "black")
        console.log(focusPoints);
    }
    function mousemove() {
        var x0 = scales.x.invert(d3.mouse(this)[0]),
            i = bisectDate(eventData, x0, 1),
            d0 = eventData[i - 1],
            d1 = eventData[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        circle
            .attr("transform", "translate(" + scales.x(d.date) + "," + scales.y(d.totalVictims) + ")");
        hoverLine
            .attr("transform", "translate(" + scales.x(d.date) + "," + 0 + ")");
        console.log(focus);
        d3.selectAll(".map-circles")
            .transition()
            .delay(0)
            .duration(40)
            .attr("r", 2.7);
        d3.select($("#"+ d.id)[0])
            .transition()
            .duration(40)
            .attr("r", 16);
        var infobox = d3.select('.infobox').style('visibility', 'visible');
        infobox.select('h2').html(d.title)
        infobox.select('h3').html(d.description)
    }

    //-----------------------------------------------------------Parallel

    var m = {top: 30, right: 10, bottom: 10, left: 10},
        w = 960 - margin.left - margin.right,
        h = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {};
    var paraLine = d3.svg.line(),
        paraAxis = d3.svg.axis().orient("left"),
        background,
        foreground;

//----------------------------------------------------------------Draw



//---------------------------------------------------------------------
    function dataLoaded(err, data) {
        if (err) console.error(err);

        eventData = data;

        eventData.forEach(function(d) {
            var date = new Date(d.date);
            d.date = date;
            d.LatLng = new L.LatLng(d.lat, d.lng) });

        x.domain(dimensions = d3.keys())




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
                fateOfShooter: (d["Fate of Shooter"] == " " ? undefined: d["Fate of Shooter"]),
                shooterRace: (d["Shooter Race"] == " " ? undefined: d["Shooter Race"]),
                typeOfGun: (d["Type of Gun – General"] == " " ? undefined: d["Type of Gun – General"]),
                numberOfGuns: (+d["Total Number of Guns"] == " " ? undefined: +d["Total Number of Guns"]),
                mentalIllness: (d["History of Mental Illness - General"] == " " ? undefined: d["History of Mental Illness - General"]),
                schoolRelated: (d["School Related"] == " " ? undefined: d["School Related"]),
                placeType: (d["Place Type"] == " " ? undefined: d["Place Type"]),
                description: (d["Description"] == " " ? undefined: d["Description"]),
                lat: (+d["lat"] == " " ? undefined: +d["lat"]),
                lng: (+d["lng"] == " " ? undefined: +d["lng"]),
                LatLng: [+d["lat"], +d["lng"]],
                date: (d["Date"]),
                title: (d["Title"] == " " ? undefined: d["Title"])
            }
        })
        .await(dataLoaded);
    //-----------------------------------------------------------

}).call(this);
