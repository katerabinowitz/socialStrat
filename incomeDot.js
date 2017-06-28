var radius = 3, 
    noOfCirclesInACol = 5,

    color =  d3.scaleOrdinal(d3.schemeDark2),

    margin = {top: 5, right: 5, bottom: 25, left: 80}

    height = (noOfCirclesInACol * 17) * (radius * 3) - margin.top - margin.bottom;
    width = (radius * 230) - margin.left - margin.right;


var xScale = d3.scaleLinear().range([margin.left, width]),
    yScale = d3.scaleLinear().range([height, margin.bottom]);
    yScale.domain([0,17]);

var incGroups = ["0-25","25-50","50-75","75-100","100-125","125-150","150-175","175-200","200-225","225-250","250-275", "275-300", "300-325", "325-350", "350-375", "375-400", "400+"];

var formatInc = function(d) {
    return incGroups[d % 18];      
}

var yAxis = d3.axisLeft(yScale)
              .tickFormat(formatInc)
              .ticks(17)
              .tickSize(0);

var svg = d3.select("#DotMatrixChart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
        .attr("transform", "translate(" + (margin.left - (radius * 2)) + ",0)")
        .attr("class", "yAxis")
        .call(yAxis)
        .selectAll("text")
        .attr("y", -radius * 5)
        .attr("x", "-0.2em")
        .attr("dy", "0.5em")
        .style("text-anchor", "end");

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -4)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Household Income ($ thousands)");

var loadData = function() {
d3.csv("https://raw.githubusercontent.com/katerabinowitz/socialStrat/master/data/iconsFilled.csv", function(error, csv_data) {
  if (error) throw error;

  // Pull in dropdown selections
  var metric = d3.select("#metric").node().value;
  var metric2 = d3.select("#metric2").node().value;

  // Sum icon counts by selected groups
  var data = d3.nest()
            .key(function(d){return d.income;})
            .key(function(d){return d[metric2];})
            .key(function(d){return d[metric];})
            .rollup(function(leaves){
              return d3.sum(leaves, function(d){return d.icon;});
            })
            .entries(csv_data)

  var dataset = new Array();
    for (var i = 0; i < data.length; i++) {
      for (var x = 0; x < Object.values(data[i])[1].length; x++) {
        for (var y = 0; y < Object.values(Object.values(data[i])[1][x])[1].length; y++) {
          Object.values(Object.values(data[i])[1][x])[1][y]["income"] = data[i]["key"]
          Object.values(Object.values(data[i])[1][x])[1][y]["dropdown2"] = Object.values(data[i])[1][x]["key"]
          dataset.push(Object.values(Object.values(data[i])[1][x])[1][y])
        }
      }
    }

  for (var i = 0; i < dataset.length; i++) {
    dataset[i]["dropdown"] = dataset[i]["key"];
    delete dataset[i]["key"];

    dataset[i]["icon"] = dataset[i]["value"];
    delete dataset[i]["value"];
  }


// Sum icon counts only by second dropdown - to offset column locations proportionally
  var dataOff = d3.nest()
            .key(function(d){return d[metric2];})
            .key(function(d){return d.income;})
            .rollup(function(leaves){
              return d3.sum(leaves, function(d){return d.icon;});
            })
            .entries(csv_data)

    var offset = new Array();
    for (var i = 0; i < dataOff.length; i++) {
      for (var x = 0; x < Object.values(dataOff[i])[1].length; x++) {
          Object.values(dataOff[i])[1][x]["dropdown2"] = dataOff[i]["key"]
          Object.values(dataOff[i])[1][x]["income"] = Object.values(dataOff[i])[1][x]["key"]
          Object.values(dataOff[i])[1][x]["icon"] = Object.values(dataOff[i])[1][x]["value"]
          offset.push(Object.values(dataOff[i])[1][x])
      }
    }

  for (var i = 0; i < offset.length; i++) {
    delete offset[i]["key"];
    delete offset[i]["value"];
  }

// Create unique lists of dropdown groups for labeling and counts
  var flags = [], 
      unqDropdown = [], 
      unqDropdown2=[], 
      unqIncome=[], 
      l = dataset.length, 
      i;

  for(i = 0; i < l; i++) {
    if(flags[dataset[i].dropdown]) continue;
      flags[dataset[i].dropdown] = true;
      unqDropdown.push(dataset[i].dropdown);
  }
  flags = [];
    
  for(i = 0; i < l; i++) {
    if(flags[dataset[i].dropdown2]) continue;
      flags[dataset[i].dropdown2] = true;
      unqDropdown2.push(dataset[i].dropdown2);
  }
  flags = [];

  for(i = 0; i < l; i++) {
    if( flags[dataset[i].income]) continue;
      flags[dataset[i].income] = true;
      unqIncome.push(dataset[i].income);
  }

// Create previous variable of last dropdown2 type w icon count
// allows for horizontal spacing
  for (i = 0; i < dataset.length; i++) {
      if (i == 0) {
          dataset[i].previous = null;
      }
      else {
        for (var j = 1; j < unqDropdown.length; j++) {
            if (dataset[i-j].icon != 0) {
                dataset[i].previous = dataset[i-j].dropdown2;
                break;
            }
        }
      }
  }

// Calculate each dropdown2 max number of columns and then assign proportion to each based on max
  var max = 0;
  var maxArray = [];
  for (i = 1; i < offset.length; i++) {
    if (offset[i - 1]["dropdown2"] == offset[i]["dropdown2"]) {
        if (offset[i - 1]["icon"] > max) {
            max = offset[i - 1]["icon"];
        }
    }
    else {
        if (offset[i - 1]["icon"] > max) {
            max = offset[i - 1]["icon"];
        }

        maxObj = {"dd2":offset[i - 1]["dropdown2"], "maxIcon": max}
        maxArray.push(maxObj);
        max = 0;
    }
  }
  maxObj = {"dd2":offset[i - 1]["dropdown2"], "maxIcon": max}
  maxArray.push(maxObj);

  var sum = 0;
  for (i = 0; i < maxArray.length; i++) {
    sum += maxArray[i].maxIcon;
  }

  for (var i = 0; i < maxArray.length; i++) {
    maxArray[i]["prop"] = maxArray[i]["maxIcon"] / sum;
  }

  position = [];
  for (var i = 0; i < maxArray.length; i++) {
    if (i === 0) {
      pos = {dd2:maxArray[i]["dd2"], max: 0, prop: 0};
    } else if (i === 1){
      pos = {dd2:maxArray[i]["dd2"], max: maxArray[i-1]["maxIcon"], prop: maxArray[i-1]["prop"]};
    } else {
      pos = {dd2:maxArray[i]["dd2"], max: maxArray[i-1]["maxIcon"] + position[i-1]["max"], 
      prop: maxArray[i-1]["prop"] + position[i-1]["prop"]}
    }
    position.push(pos)
  }

  // Scales and domains
  var incomeScale = d3.scalePoint().domain(unqIncome).range([0, unqIncome.length-1]);
  var dropdown2Scale = d3.scalePoint().domain(unqDropdown2).range([0, sum]);

  xScale.domain([0, sum]);

  // generate dataset with x, y coordinates for dotplot
  var rowN = {},
      iconN = {},
      yPosition = {},
      counter=0;

  function generate_array(d, i){
    if(iconN[d.income] == null){
        iconN[d.income] = 5;
    }
    if(rowN[d.income] == null){
        rowN[d.income] = 0;
    }
    if(yPosition[d.income] == null){
        yPosition[d.income] = 0;
    }

    var arr = new Array(d.icon);
      for(var i=0; i < d.icon; i++){

        //with only one categorical axis
        if (d.dropdown2=="undefined") {
            if(iconN[d.income]!=0 && (iconN[d.income] % noOfCirclesInACol == 0)){
                rowN[d.income] += 3.5;
                yPosition[d.income] = incomeScale(d.income) + 0.025;
            } 
            else {
                yPosition[d.income] += 0.8/noOfCirclesInACol;
            }
          }

        //with two categorical axes -- previous allows horizontal break in data
        else {

            if (iconN[d.income]==0) {
                  counter=0;
            } 
            else if ((d.previous != "null") && (d.dropdown2 != d.previous) && (i==0)) {
                  counter=0;
            } 
            else {
                  counter +=1;
            }

            if (counter==0) {

            function findDropdown2(offset) { 
              return offset.dd2 === d.dropdown2;
            }

            found = position.find(findDropdown2)

            yPosition[d.income] = incomeScale(d.income) + 0.04;

            if (d.dropdown2 === "Couple") {
                rowN[d.income] = (width - 340) * (found.prop);
            } else if (d.dropdown2 === "Graduate Degree") {
                rowN[d.income] = (width - 390) * (found.prop);
            } else {
                rowN[d.income] = (width - 400) * (found.prop);
            }}

            else if  (counter!=0 && (counter % noOfCirclesInACol == 0 )) {
                  yPosition[d.income] = incomeScale(d.income) + 0.04;
                  rowN[d.income] += 3.5;
            } 
            else {
                  yPosition[d.income] += .8/noOfCirclesInACol;
            }
        }            
        arr[i] = {x:rowN[d.income], y:yPosition[d.income], income:d.income, dropdown:d.dropdown, dropdown2:d.dropdown2};
        iconN[d.income] += 1;
      }
        return arr;
  }

// Plot circles
  svg.selectAll(".group").remove();
  var groups = svg
      .selectAll("rect")
      .data(dataset, function(d){return d;})
      .enter()
      .append("g")
      .attr("class", "group");

  var circleArray = groups.selectAll("g.circleArray")
      .data(function(d) {return generate_array(d,i);});

  circleArray.exit().remove();
  circleArray.enter()
      .append("g")
      .attr("class", "circleArray")

      .append("circle")
  
      .merge(circleArray)
      .attr("r", radius)
      .attr("cx", function(d,i) {return xScale(d.x); })
      .attr("cy", function(d,i) { return yScale(d.y); })
      .style("fill",function(d){return color(d.dropdown);})
      // allow icon count on click
      .on("click", function(d) 
        {
        var active   = circleArray.active ? false : true,
        newOpacity = active ? 0.1 : 1;
          d3.selectAll(".circleArray").style("opacity", newOpacity);
        circleArray.active = active;

        var active2   = circleLabel.active ? true : false,
        newOpacity2 = active ? 1 : 0;
          d3.selectAll(".circleLabel").style("opacity", newOpacity2);
        circleLabel.active = active2;
      });

// Create color legend for when dropdown is selected
  svg.selectAll(".legend").remove();
  var legend = svg
      .selectAll(".legend")
      .data(unqDropdown)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + -20  + "," + (((height-margin.bottom-margin.top)/2) - ((height-margin.bottom-margin.top)/4)) + ")");

  legend
      .append("circle")
      .attr("cx", width + 15)
      .attr("cy", function(d,i){return i * radius * 15;})
      .attr("r", 3)
      .style("fill", function(d) {
        if (d=="undefined") {
          return "#FFFFFF";
        } else {
        return color(d);
      }})

  legend
      .append("text")
      .attr("x", width + 20)
      .attr("text-anchor","start")
      .attr("class", "legendText")
      .attr("y", function(d,i){return (i * radius * 15) + 5;})
      .text(function(d){
        if (d == "undefined") {
          return "";
        } else {
          return d;
        }
      })
      .call(wrap);
      

// Position and create x axis labels for when dropdown2 is selected
  first=[];
  for (i = 0; i < circleArray._enter.length - 1; i++) {
    if (circleArray._enter[i][0] != undefined && 
       (i % unqDropdown.length === 0 || circleArray._enter[i][0].__data__.dropdown === circleArray._enter[i][0].__data__.dropdown2)) {
          first.push(circleArray._enter[i][0].__data__);
      }
  }

  var unqX = first.filter(function(data){
    return data.income === "inc025";
  })

  svg.selectAll(".Xlabel").remove();
  var xLabels = svg
    .selectAll(".Xlabel")
    .data(unqX)
    .enter()
    .append("text")
    .attr("class", "Xlabel")
    .attr("x", function(d) {return xScale(d.x)})
    .attr("y", 12)
    .style("text-anchor","right")
    .text(function(d){
      if (d.dropdown2 === "undefined") {
        return "";
      } else {
        return d.dropdown2}})
    .call(wrap);


// Create circle counts for click action
  var circleData = [];

  for (i = 0; i < circleArray._enter.length; i++) {
    if (circleArray._enter[i][0] != undefined) {
      collect = {total : circleArray._enter[i].length, 
      tempX : circleArray._enter[i][0].__data__.x, 
      y : incomeScale(circleArray._enter[i][0].__data__.income) + 0.025,
      dropdown :  circleArray._enter[i][0].__data__.dropdown,
      dropdown2 :  circleArray._enter[i][0].__data__.dropdown2,
      income : circleArray._enter[i][0].__data__.income}
    circleData.push(collect)
    }
  }

  for (i = 0; i < circleData.length ; i++) {
    if (i === 0) {
      circleData[i].x = circleData[i].tempX;
    } else {
      if  (circleData[i-1].income === circleData[i].income &&
          circleData[i-1].dropdown != circleData[i].dropdown &&
          (circleData[i].tempX - circleData[i - 1].x) < 10) {
            circleData[i].x = circleData[i-1].x + 10;
      } else {
            circleData[i].x = circleData[i].tempX;
      }
    }
  }

  svg.selectAll(".circleLabel").remove();
  var circleLabel = svg
    .selectAll("rect")
    .data(circleData)
    .enter()
    .append("text")
    .attr("class", "circleLabel")
    .attr("x", function(d) {return xScale(d.x)})
    .attr("y", function(d) {return yScale(d.y)})
    .text(function(d){return d.total})
    .style("text-anchor","right")
    .style("fill", function(d){return color(d.dropdown);})
    .style("opacity", 0);


// wrapping text, courtesy https://bl.ocks.org/ericsoco/647db6ebadd4f4756cae, with a couple changes 
  function wrap (text) {
    text.each(function() {

    var breakChars = ["/", "&", "-"],
      text = d3.select(this),
      textContent = text.text(),
      spanContent;

    breakChars.forEach(char => {
      textContent = textContent.replace(char, char + ' ');
    });

    var words = textContent.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1,
      x = text.attr("x"),
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy") || 0),
      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > 80) {
        line.pop();
        spanContent = line.join(' ');
        breakChars.forEach(char => {
          spanContent = spanContent.replace(char + ' ', char);
        });
        tspan.text(spanContent);
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  }) };

function type(d) {
  d.icon = +d.icon;
  return d;
  }

});
}

loadData()