map_el = $("body").append("<div id='map'></div>")
L.mapbox.accessToken = "pk.eyJ1IjoiYXJtaW5hdm4iLCJhIjoiSTFteE9EOCJ9.iDzgmNaITa0-q-H_jw1lJw"
map = L.mapbox.map("map", "arminavn.ib1f592g").setView([40, -74.50], 9)


margin =
  t: 20
  r: 20
  b: 60
  l: 20

margin2 =
  t: 30
  r: 100
  b: 100
  l: 100

width = $(".canvas").width() - margin.l - margin.r
height = $(".canvas").height() - margin.b - margin.t
height2 = margin.b - margin2.t - margin2.b

svg = d3.select(".canvas").append("svg").attr("width", width + margin.l + margin.r).attr("height", height + margin.t + margin.b).append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")")
graph = d3.select(".lineGraph").append("svg").attr("width", width + margin.l + margin.r).attr("height", height + margin.t + margin.b).append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")")
projection = d3.geo.mercator().translate([
  width / 2
  height / 1.5
]).scale(200)
path = d3.geo.path().projection(projection)
eventData = undefined
usTopoJson = undefined
parseDate = d3.time.format("%m/%d/%y").parse

#Set up another <g> element to draw the timeline with

scales = {}
scales.cSize = d3.scale.sqrt().domain([
  0
  100
]).range([
  0
  20
])
scales.r = d3.scale.sqrt().domain([
  0
  70
]).range([
  0
  17
])
scales.x = d3.time.scale().range([
  0
  width / 1.1
]).clamp(true)
scales.x2 = d3.time.scale().range([
  0
  width / 1.7
]).clamp(true)
scales.y = d3.scale.linear().domain([
  0
  75
]).range([
  height
  0
])



svgLine = svg.append("g").attr("class", "time-series").attr("transform", "translate(" + margin.l + "," + (margin.t + height + margin2.t) + ")")
xAxis = d3.svg.axis().scale(scales.x).orient("bottom").tickSize(-height, 0).orient("bottom").tickSubdivide(true)
yAxis = d3.svg.axis().scale(scales.y).tickSize(-width / 1.7, 0).orient("left")
xAxis2 = d3.svg.axis().scale(scales.x2).orient("bottom").tickSize(-height, 0).orient("bottom").tickSubdivide(true)

#GENERATORS
line = d3.svg.line().x((d) ->
  scales.x2 d.date
).y((d) ->
  scales.y d.totalVictims
)

dataLoaded = (err, us, data) ->
  console.error err  if err
  usTopoJson = us
  eventData = data
  eventData.forEach (d) ->
    date = new Date(d.date)
    d.date = date
    return

  console.log "right after event data", eventData
  console.log d3.time.format("%m/%d/%Y")
  scales.x2.domain d3.extent(eventData, (d) ->
    d.date
  )
  scales.x.domain d3.extent(eventData, (d) ->
    d.date
  )
  minDate = eventData[0].date
  maxDate = eventData[eventData.length - 1].date
  console.log minDate, maxDate
  drawGraph()
  drawTimeSeries eventData
  createSlider(eventData)
  # drawMap usTopoJson
  # console.log usTopoJson
  return

queue().defer(d3.json, "data/us-10m.json").defer(d3.csv, "data/MSA_Stanford_Complete_Database.csv", (d) ->
  totalVictims: ((if +d["Total Number of Victims"] is " " then `undefined` else +d["Total Number of Victims"]))
  kill: ((if +d["Number of Victim Fatalities"] is " " then `undefined` else +d["Number of Victim Fatalities"]))
  wound: ((if +d["Number of Victims Injured"] is " " then `undefined` else +d["Number of Victims Injured"]))
  id: +d["CaseID"]
  shooterAge: ((if +d["Average Shooter Age"] is " " then `undefined` else +d["Average Shooter Age"]))
  shooterSex: ((if d["Shooter Sex"] is " " then `undefined` else d["Shooter Sex"]))
  shooterRace: ((if d["Shooter Race"] is " " then `undefined` else d["Shooter Race"]))
  typeOfGun: ((if d["Type of Gun – General"] is " " then `undefined` else d["Type of Gun – General"]))
  numberOfGuns: ((if +d["Total Number of Guns"] is " " then `undefined` else +d["Total Number of Guns"]))
  fateOfShooter: ((if d["Fate of Shooter"] is " " then `undefined` else d["Fate of Shooter"]))
  mentalIllness: ((if d["History of Mental Illness - General"] is " " then `undefined` else d["History of Mental Illness - General"]))
  schoolRelated: ((if d["School Related"] is " " then `undefined` else d["School Related"]))
  placeType: ((if d["Place Type"] is " " then `undefined` else d["Place Type"]))
  description: ((if d["Description"] is " " then `undefined` else d["Description"]))
  lat: ((if +d["lat"] is " " then `undefined` else +d["lat"]))
  lng: ((if +d["lng"] is " " then `undefined` else +d["lng"]))
  lngLat: [
    +d["lng"]
    +d["lat"]
  ]
  date: (d["Date"])
).await dataLoaded


createSlider = (eventData)->
	brush = d3.svg.brush().x(scales.x).extent([
	  eventData.length
	  eventData.length
	]).on("brush", brushed)
	slider = svgLine.append("g").attr("class", "slider").call(brush)
	slider.selectAll(".extent, .resize").remove()
	slider.select(".canvas").attr "height", height2
	handle = slider.append("g").attr("class", "handle")
	handle.append("path").attr("transform", "translate(0," + height2 + ")").datum([
	  [
	    -35
	    0
	  ]
	  [
	    -35
	    22
	  ]
	  [
	    35
	    22
	  ]
	  [
	    35
	    0
	  ]
	]).attr "d", d3.svg.area()
	handle.append("text").attr("text-anchor", "middle").attr "y", height2

	hendleSlides = =>
	  console.log "inside handle slide"
	  return

	# var year = brush.extent()[0];

	brushed = =>
	  year = brush.extent()[0]
	  year = (scales.x.invert(d3.mouse(this)[0]))  if d3.event.sourceEvent
	  brush.extent [
	    year
	    year
	  ]
	  xPos = scales.x(year)
	  handle.attr("transform", "translate(" + xPos + "0)").select("text").text(year).call hendleSlides
	  return
	slider.call brush.event
	return 
#--------------------------line graph function--------------------------------------------
drawGraph = ->
  console.log "eventData", eventData
  console.log "graph", graph
  graph.append("g").attr("class", "x axis").attr("transform", "translate(0, " + height + ")").call(xAxis2).selectAll("text").attr("dy", ".35em").attr("transform", "rotate(45)").style "text-anchor", "start"
  graph.append("g").attr("class", "y axis").call yAxis
  stillPath = graph.append("path").attr("d", line(eventData)).attr("fill", "none").attr("stroke", "rgb(14, 80, 14").attr("stroke-width", "2").attr("stroke-dashoffset", 0)
  return
drawTimeSeries = (eventData) ->
  console.log "eventData", eventData
  console.log "graph", graph
  
  # graph.append("g")
  #     .attr("class", "x axis")
  #     .attr("transform", "translate(0, " + height + ")")
  #     .call(xAxis2)
  #     .selectAll("text")
  #     .attr("dy", ".35em")
  #     .attr("transform", "rotate(45)")
  #     .style("text-anchor", "start");
  
  # graph.append("g")
  #     .attr("class", "y axis")
  #     .call(yAxis);
  
  # stillPath = graph.append("path")
  #     .attr("d", line(eventData))
  #     .attr('fill', 'none')
  #     .attr('stroke', 'rgb(14, 80, 14')
  #     .attr('stroke-width', '2')
  #     .attr("stroke-dashoffset", 0);
  dataPath = graph.append("path").attr("d", line(eventData)).attr("fill", "none").attr("stroke", "rgb(170, 270, 170").attr("stroke-width", "2")
  totalLength = dataPath.node().getTotalLength()
  console.log "totalLength", totalLength
  dataPath.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().delay(30).duration(20000).ease("linear").attr "stroke-dashoffset", 0
  dataPath2 = graph.append("path").attr("d", line(eventData)).attr("fill", "none").attr("stroke", "rgb(100, 150, 100)").attr("stroke-width", "2")
  totalLength = dataPath2.node().getTotalLength()
  dataPath2.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().delay(70).duration(20000).ease("linear").attr "stroke-dashoffset", 0
  return
# console.log "line(eventData)", line(eventData)


# .call(drawTimeSeries());

