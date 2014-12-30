// Generated by CoffeeScript 1.7.1
(function() {


    var margin = {t: 10, r: 10, b: 80, l: 40},
        margin2 = {t: 230, r: 10, b: 20, l: 40},
        width = $('.canvas').width() - margin.l - margin.r,
        height = $('.canvas').height() - margin.t - margin.b
        height2 = $('.canvas').height() - margin2.t - margin2.b;

    var eventData;
    var circleGroup;
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

    map = L.mapbox.map("map").setView([40, -74.50], 5);

    L.control.layers({
        "Base Map": L.mapbox.tileLayer("arminavn.ib1f592g"), //satellite
        "Open Street": L.mapbox.tileLayer("arminavn.jl495p2g").addTo(map) //street map
    }).addTo(map);


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

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.l + "," + margin2.t + ")");


//----------------------------------------------------------------------

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
                lngLat: [+d["lng"], +d["lat"]],
                date: (d["Date"])
            }
        })
        .await(dataLoaded);

//----------------------------------------------------------------------below is when i say the global = the parses data
    function dataLoaded(err, data) {
        if (err) console.error(err);

        eventData = data;

        eventData.forEach(function(d) {
            var date = new Date(d.date);
            d.date = date;
        });

        console.log("right after event data",eventData);
        console.log(d3.time.format("%m/%d/%Y"));


        drawTimeSeries(eventData);


    }

//--------------------------
    function drawTimeSeries(eventData) {

        scales.x.domain(d3.extent(eventData.map(function(d) { return d.date; })));
        scales.y.domain([0, d3.max(eventData.map(function(d) { return d.totalVictims; }))]);
        scales.x2.domain(scales.x.domain());
        scales.y2.domain(scales.y.domain());


        focus.append("path")
            .datum(eventData)
            .attr("class", "line")
            .attr("d", line);

        circleGroup = focus.append("g");
        circleGroup.attr("clip-path", "url(#clip)");
        circleGroup.selectAll('.dot')
            .data(eventData)
            .enter().append("circle")
            .attr('class', 'dot')
            .attr("cx",function(d){ return scales.x(d.date);})
            .attr("cy", function(d){ return scales.y(d.totalVictims);})
            .attr("r", function(d){ return 3;})
            .on('mouseover', function(d){ d3.select(this).attr('r', 8)})
            .on('mouseout', function(d){ d3.select(this).attr('r', 3)})
            .on('mouseenter', onMouseEnter)
            .on('mouseleave', onMouseLeave);

        focus.append("g") //top main graph
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

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
    }

    function brushed() {
        scales.x.domain(brush.empty() ? scales.x2.domain() : brush.extent());
        focus.select(".line").attr("d", line);
        focus.select(".x.axis").call(xAxis);
        circleGroup.selectAll(".dot").attr("cx",function(d){ return scales.x(d.date)}).attr("cy", function(d){ return scales.y(d.totalVictims)});
    }


    function onMouseEnter(d) {

        var container = d3.select('.canvas').node();
        var mouse = d3.mouse(container);

        var tooltip = d3.select('.tooltip')
            .style('visibility', 'visible');

        tooltip

            .select('h2').html(d.name + "<br/>" + "desc: " + d.description + "<br/>" + "wounded: " + d.wound + "<br/>" + "year: " + d.date)

        console.log(d);

        map.setView(new L.LatLng(d.lat, d.lng), 5);


        map.append("circle")
            .data(eventData)
            .enter()
            .append("circle")
            .attr("transform", function(d){
                return(path)
            })

        var tooltipWidth = $('.tooltip').width();

    drawPoint(eventData);

    }


    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(d) {
        var point = map.latLngToLayerPoint(new L.LatLng(d.lat, d.lng));
        this.stream.point(point.d.lat, point.d.lng);
    }

    var transform = d3.geo.transform({ point: projectPoint });
    var path = d3.geo.path().projection(transform);




//
//    function drawPoint(eventData){
//        svg.selectAll(".circle")
//            .data(eventData)
//            .enter()
//            .append("circle")
//            .attr("transform", function(d) {
//                var xy = path(projectPoint);
//                return 'translate(' + xy[0] + ',' + xy[1] + ')'; })
//            .attr("r", 2);
//
//    }


    function onMouseLeave(d) {
        d3.select('.tooltip')
            .style('visibility', 'hidden');

    }

}).call(this);
