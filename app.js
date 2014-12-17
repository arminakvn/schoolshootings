// Generated by CoffeeScript 1.7.1
(function() {


    var margin = {t:50,r:50,b:50,l:50},
        margin2 = {t:30,b:100};
        width = $('.canvas').width() - margin.l - margin.r,
        height = $('.canvas').height() - margin.t - margin.b,
        height2 = margin.b - margin2.t - margin2.b;

    var svg = d3.select('.canvas')
        .append('svg')
        .attr('width', width + margin.l + margin.r)
        .attr('height', height + margin.t + margin.b)
        .append('g')
        .attr('transform',"translate("+margin.l+","+margin.t+")");

//    var projection = d3.geo.mercator()
//        .translate([width+900, height*4.5])
//        .scale(700);
//
//    var path = d3.geo.path()
//        .projection(projection);

    var usTopoJson;
    var eventData;

    var parseDate = d3.time.format("%m/%d/%y").parse;
//----------------------------------------------------------------------above is the global variable so that you can use it in multiple functions
    var scales= {};
    scales.r = d3.scale.sqrt().domain([0, 70]).range([0,17]);
    scales.x = d3.time.scale().range([0, width]);
    scales.y = d3.scale.linear().domain([0, 100]).range([height, 0]);

//----------------------------------------------------------------------

    var xAxis = d3.svg.axis()
        .scale(scales.x)
        .orient('bottom')
        .tickSize(10, -5)
        .orient("bottom")
        .ticks(d3.time.years,1)
    .tickSubdivide(true);


    var yAxis = d3.svg.axis()
        .scale(scales.y)
        .tickSize(6, 0)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d){ return scales.x(d.date); })
        .y(function(d){ return scales.y(d.totalVictims); })

//----------------------------------------------------------------------

    queue()

        .defer(d3.json, "data/us-10m.json")
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
    function dataLoaded(err, us, data) {
        if (err) console.error(err);

        usTopoJson = us;
        eventData = data;

        eventData.forEach(function(d) {
            var date = new Date(d.date);
            d.date = date;
        });


        console.log("right after event data",eventData);
        console.log(d3.time.format("%m/%d/%Y"));

        scales.x.domain(d3.extent(eventData, function(d){return d.date; }));


        var minDate = eventData[0].date;
        var maxDate = eventData[eventData.length - 1].date;
        console.log(minDate, maxDate);



        drawTimeSeries(eventData);

    }




//--------------------------line graph function--------------------------------------------
    function drawTimeSeries(eventData) {

        // Add the clip path.
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

       svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis)
           .selectAll("text")
           .attr("dy", ".35em")
           .attr("transform", "rotate(45)")
           .style("text-anchor", "start");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

   var dataPath = svg.selectAll(".path")
        svg.append("path")
            .attr("d", line(eventData))
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '2')
            .attr("transform", null)
            .transition()
            .attr("transform", "translate(" + -15*scales.x(+1) + ")")
            .delay(50)
            .duration(8000)



   var dataPoints = svg.selectAll(".circles")
            .data(eventData)
            .enter()
            .append("circle")
            .attr('class', 'circle')
            .attr('cx', function(d) { return scales.x(d.date); })
            .attr('cy', function(d) { return scales.y(d.totalVictims); })
            .attr('r',.5)
            .attr('fill', 'white')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '3')
       .attr("transform", null)
       .transition()
       .attr("transform", "translate(" + -15*scales.x(+1) + ")")
       .delay(50)
       .duration(8000);

        var clip


//        var curtain = svg.append('rect')
//            .attr('x', -1 * width)
//            .attr('y', -1 * height)
//            .attr('height', height)
//            .attr('width', width)
//            .attr('class', 'curtain')
//            .attr('transform', 'rotate(180)')
//            .style('fill', '#ffffff')
//
//        /* Optionally add a guideline */
//        var guideline = svg.append('line')
//            .attr('stroke', '#333')
//            .attr('stroke-width', 0)
//            .attr('class', 'guide')
//            .attr('x1', 1)
//            .attr('y1', 1)
//            .attr('x2', 1)
//            .attr('y2', height)
//
//        /* Create a shared transition for anything we're animating */
//        var t = svg.transition()
//            .delay(750)
//            .duration(60000)
//            .ease('linear')
//            .each('end', function() {
//                d3.select('line.guide')
//                    .transition()
//                    .style('opacity', 0)
//                    .remove()
//            });
//
//        t.select('rect.curtain')
//            .attr('width', 0);
//        t.select('line.guide')
//            .attr('transform', 'translate(' + width + ', 0)')
//
//        d3.select("#show_guideline").on("change", function(e) {
//            guideline.attr('stroke-width', this.checked ? 1 : 0);
//            curtain.attr("opacity", this.checked ? 0.75 : 1);
//        })



    }


//----------------------------------------------------------------------
//Create Buttons
//    $('.control #map').on('click', onClickMap);
//    $('.control #totalVictims').on('click', onClickTotalVictims);
//    $('.control #killed').on('click', onClickKill);
//    $('.control #wounded').on('click', onClickWound);
//----------------------------------------------------------------------
//----------------------------------MAP------------------------------------
//    function drawMap(usTopoJson){
//        console.log(usTopoJson);
//
//        svg.append('path')
//            .datum(topojson.mesh(usTopoJson, usTopoJson.objects.states))
//            .attr('d', path)
//            .attr('class', 'states')
//
//    }
    //----------------------------------------------------------------------

//    function onClickMap(e){
//        e.preventDefault();
//        var circleNodes = svg.selectAll('circle')
//            .transition()
//            .attr('transform', function(d){
//                var xy = projection(d.lngLat);
//                return 'translate(' + xy[0] + ',' + xy[1] + ')'; })
//        drawMap(usTopoJson);
//    }
//
//    function onClickKill(e){
//        e.preventDefault();
//        var circleNodes = svg.selectAll('circle')
//            .transition()
//            .attr('r', function(d){return scales.r(d.kill)})
//            .attr('opacity',.3)
//            .style('fill', 'red')
//
//    }
//
//    function onClickWound(e) {
//        e.preventDefault();
//        var circleNodes = svg.selectAll('circle')
//            .transition()
//            .attr('r', function (d) {
//                return scales.r(d.wound)})
//            .attr('opacity',.3)
//            .style('fill', 'yellow')
//
//    }
//    function onClickTotalVictims(e){
//        e.preventDefault();
//
//        var circleNodes = svg.selectAll('circle')
//            .transition()
//            .attr('r', function(d){
//                return scales.r(d.totalVictims)})
//            .attr('opacity',.3)
//            .style('fill', 'white')
//    }
//
//
////--------------------------draw function--------------------------------------------this is my circles without any size or position so when ever i say "select all circles" it selects these and transforms them
//    function draw(eventData) {
//        console.log(eventData);
//
//        var circleNodes = svg.selectAll('.node')
//            .data(eventData, function (d) {
//                return d.date;
//            });
//
//        var circleNodesEnter = circleNodes.enter()
//            .append('g')
//            .attr('class', 'node')
//
//        circleNodesEnter
//            .append('circle')
//            .attr('r', 0)
//            .attr('stroke-width',.5)
//            .attr('stroke', 'black')
//
//        circleNodes
//            .exit()
//            .remove();
//
//    }


}).call(this);
