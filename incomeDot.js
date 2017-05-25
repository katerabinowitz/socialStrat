var radius = 2, 
    noOfCirclesInACol = 5,
    dotPadLeft = 2,
    dotPadRight = 2,
    dotPadTop = 2,
    dotPadBottom = 2,

    color =  d3.scaleOrdinal(d3.schemeDark2),

    margin = {top: radius*10, right: radius*15, bottom: radius*5, left: radius*35};


height = (noOfCirclesInACol * 17) * (radius*2 + dotPadBottom + dotPadTop);
width = (radius*4 + dotPadLeft + dotPadRight) * 50;

var xScale = d3.scaleLinear().range([margin.left, width]),
    yScale = d3.scaleLinear().range([height, margin.bottom]);
      xScale.domain([0,50]);
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
        .attr("y", -radius * 7)
        .attr("x", "-0.1em")
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

// Create unique lists of dropdown groups for labeling and counts
  var flags = [], 
      unqDropdown = [], 
      unqDropdown2=[], 
      unqIncome=[], 
      l = dataset.length, 
      i;

  for(i=0; i<l; i++) {
    if(flags[dataset[i].dropdown]) continue;
      flags[dataset[i].dropdown] = true;
      unqDropdown.push(dataset[i].dropdown);
  }
  flags = [];
    
  for(i=0; i<l; i++) {
    if( flags[dataset[i].dropdown2]) continue;
      flags[dataset[i].dropdown2] = true;
      unqDropdown2.push(dataset[i].dropdown2);
  }
  flags = [];

  for(i=0; i<l; i++) {
    if( flags[dataset[i].income]) continue;
      flags[dataset[i].income] = true;
      unqIncome.push(dataset[i].income);
  }

// Create previous variable of last dropdown2 type w icon count
// allows for horizontal spacing
  for (var i = 0; i < dataset.length; i++) {
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

  var incomeScale = d3.scalePoint().domain(unqIncome).range([0, unqIncome.length-1]);
  var dropdown2Scale = d3.scalePoint().domain(unqDropdown2).range([0, unqDropdown2.length-1]);

  xScale.domain([0,d3.max(dataset,function(d){return dropdown2Scale(d.dropdown2) + 1;})]);
  yScale.domain([0,d3.max(dataset,function(d){return incomeScale(d.income) + 1;})]);

  var xAxis = d3.axisTop(xScale)                
                .tickArguments(unqDropdown2)
                .tickFormat(function (d) {
                  if (unqDropdown2[d]=="undefined") {
                      return "";
                  }
                  else {
                    return unqDropdown2[d];
                  }
                })
                .ticks(unqDropdown2.length)
                .tickSize(0);

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
                rowN[d.income] += 0.01;
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
                  yPosition[d.income] = incomeScale(d.income) + 0.025;
                  rowN[d.income] = dropdown2Scale(d.dropdown2);
            }
            else if  (counter!=0 && (counter % noOfCirclesInACol == 0 )) {
                  yPosition[d.income] = incomeScale(d.income) + 0.025;
                  rowN[d.income] += 0.03;
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

  svg.selectAll(".xAxis").remove();
  svg.append("g")
      .attr("transform", "translate(" + ("0," + margin.top + ")"))
      .attr("class", "xAxis")
      .call(xAxis)
      .selectAll("text")
      .attr("y", -radius*5)
      .attr("x", 0)
      .attr("dy", ".35em")
      .style("text-anchor", "start");

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
      .append('g')
      .attr("class", "circleArray")
      .append("circle")
    
      .merge(circleArray)
      .attr("r", radius)
      .attr("cx", function(d,i) {return xScale(d.x); })
      .attr("cy", function(d,i) { return yScale(d.y); })
      .style("fill",function(d){return color(d.dropdown);});

  svg.selectAll(".legend").remove();
  var legend = svg
      .selectAll(".legend")
      .data(unqDropdown)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + -20  + "," + ((height-margin.bottom-margin.top)/2) + ")");

  legend
      .append("circle")
      .attr("cx", width - (radius * 7))
      .attr("cy", function(d,i){return i * radius * 8;})
      .attr("r", 3)
      .attr("data-style-padding", 10)
      .style("fill", function(d) {
        if (d=="undefined") {
          return "#FFFFFF";
        } else {
        return color(d);
      }})

  legend
      .append("text")
      .attr("x", width - (radius * 5))
      .attr("text-anchor",'start')
      .attr("y", function(d,i){return (radius*2) + (i * radius * 8);})
      .text(function(d){
        if (d=="undefined") {
          return "";
        } else {
        return d;
      }})

  function type(d) {
    d.icon = +d.icon;
    return d;
  }

});
}

loadData()