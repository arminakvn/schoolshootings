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

    var eventData;

    var parseDate = d3.time.format("%m/%d/%y").parse;
//----------------------------------------------------------------------above is the global variable so that you can use it in multiple functions
    var scales= {};
    scales.r = d3.scale.sqrt().domain([0, 70]).range([0,17]);
    scales.x = d3.time.scale().range([0, width]);
    scales.y = d3.scale.linear().domain([0, 75]).range([height, 0]);

//----------------------------------------------------------------------

    var xAxis = d3.svg.axis()
        .scale(scales.x)
        .orient('bottom')
        .tickSize(10, 0)
        .orient("bottom")
        .ticks(d3.time.years,1)
        .tickSubdivide(true)



    var yAxis = d3.svg.axis()
        .scale(scales.y)
        .tickSize(-width, 0)
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

        var stillPath = svg.append("path")
            .attr("d", line(eventData))
            .attr('fill', 'none')
            .attr('stroke', 'rgb(14, 80, 14')
            .attr('stroke-width', '2')
            .attr('opacity', '.4')

   var dataPath = svg.append("path")
            .attr("d", line(eventData))
            .attr('fill', 'none')
            .attr('stroke', 'rgb(170, 270, 170')
            .attr('stroke-width', '2')


        var totalLength = dataPath.node().getTotalLength();

        dataPath
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(20000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        var dataPath2 = svg.append("path")
            .attr("d", line(eventData))
            .attr('fill', 'none')
            .attr('stroke', 'rgb(14, 80, 14')
            .attr('stroke-width', '2')

        var totalLength = dataPath2.node().getTotalLength();

        dataPath2
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .delay(30)
            .duration(20000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);







        function onMouseEnter(d) {

            var container = d3.select('.canvas').node();
            var mouse = d3.mouse(container);

            var tooltip = d3.select('.tooltip')
                .style('visibility', 'visible');

            tooltip

                .select('h2').html(d.name + "<br/>" + "killed: "+d.kill +"<br/>" + "wounded: "+ d.wound + "<br/>" + "year: "+ d.yr)


            var tooltipWidth = $('.tooltip').width();

            tooltip
                .style('left', mouse[0] - tooltipWidth / 2 + 'px')
                .style('top', mouse[1] - 80 + 'px');

        }

        function onMouseLeave(d) {
            d3.select('.tooltip')
                .style('visibility', 'hidden');

        }



    }




}).call(this);
