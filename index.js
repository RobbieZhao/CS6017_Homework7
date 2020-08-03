function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

// Get the max from all the  specified columns
function getMax(data, countries) {
	let max = d3.max(data, d => d[countries[0]]);
	for (let i = 0; i < countries.length; i++) {
		let newItem = d3.max(data, d => d[countries[i]]);
		if (newItem > max) {
			max = newItem;
		}
	}

	return max;
}

function plotButtons(countries) {
	var svg = d3.select(".selector");
	var width = +svg.attr('width');
	var height = +svg.attr('height'); 

	let margin = 20;
	let buttonHeight = height - 2 * margin;
	let buttonWidth = (width - (countries.length+1) * margin) / countries.length;

	for (let i = 0; i < countries.length; i++) {
		svg.append("rect")
		   .attr("class", "unclicked")
		   .attr("width", buttonWidth)
		   .attr("height", buttonHeight)
		   .attr("fill", "steelblue")
		   .attr("x", margin + (buttonWidth + margin) * i)
		   .attr("y", margin)
		   .on('mouseenter', function() {
		   	   d3.select(this).style("fill", "#B2BEB5");
		   })
		   .on('mouseleave', function() {
		   	   d3.select(this).style("fill", "steelblue");
		   })
		   .on('click', function() {
		   	    let rect = d3.select(this);

		   	    if (rect.attr("class") == "unclicked") {
	   	        	rect.attr("class", "clicked")
	   	        	    .style("fill", "grey")
	   	                .on('mouseenter',null)
	   	                .on('mouseleave',null)

			   	    selectedCountries.add(countries[i]);
			   	} else {
			   		rect.attr("class", "unclicked")
			   		    .style("fill", "steelblue")
			   		    .on('mouseenter', function() {
					   	   d3.select(this).style("fill", "#B2BEB5");
					    })
					    .on('mouseleave', function() {
					   	   d3.select(this).style("fill", "steelblue");
					    })
					selectedCountries.delete(countries[i]);
			   	}

		   	    plotLines(window.data, Array.from(selectedCountries));

		   });
		svg.append("text")
	     .attr("class", "country")
	     .attr("text-anchor", "middle")
	     .attr("x", margin + buttonWidth / 2 + (margin + buttonWidth) * i)
	     .attr("y", height / 2)
	     .text(countries[i]);
	}

}

function plotLines(data, countries) {

	var svg = d3.select('.linechart');
   	d3.selectAll(".linechart > *").remove();

	var width = +svg.attr('width');
	var height = +svg.attr('height'); 

	let title = "GDP 1970-2019";
	let xLabel = "Year";
	let yLabel = "GDP($ trillion)"

	let margin = {left:130, right:150, top:20, bottom: 100};
	let innerWidth = width - margin.left - margin.right;
	let innerHeight = height - margin.top - margin.bottom;

	var xScale = d3.scaleLinear()
	               .domain([d3.min(data, d => d["Year"]), d3.max(data, d => d["Year"])])
	               .range([0, innerWidth])

	var yScale = d3.scaleLinear()
				   .domain([0, getMax(data, countries)])
				   .range([innerHeight, 0]);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	let g = svg.append('g')
	           .attr('transform', `translate(${margin.left}, ${margin.top})`)

	g.append('g').call(d3.axisLeft(yScale));
    g.append('g').call(d3.axisBottom(xScale))
    	         .attr('transform', `translate(0, ${innerHeight})`);

    for (let i = 0; i < countries.length; i++) {
	    g.append("path")
	     .datum(data)
	     .attr("fill", "none")
	     .attr("stroke", colorScale(i))
	     .attr("stroke-width", 5)
	     .attr("d", d3.line()
	        .x(function(d) { return xScale(d.Year) })
	        .y(function(d) { return yScale(d[countries[i]]) })
	    );
	    g.append("circle")
	     .attr("fill", colorScale(i))
	     .attr("cx", innerWidth + 20)
	     .attr("cy", (i + 1/2) * innerHeight / countries.length / 2)
	     .attr("r", 5);
	    g.append("text")
	     .attr("class", "legendLabel")
	     .attr("x", innerWidth + 20 + 20)
	     .attr("y", (i + 1/2) * innerHeight / countries.length / 2)
	     .text(countries[i]);
 	}
	g.append('line')
	 .attr('class', 'selectedYear')
	 .attr('x1', xScale(selectedYear))
	 .attr('x2', xScale(selectedYear))
	 .attr('y1', 0)
	 .attr('y2', innerHeight)

	g.append('rect')
	 .attr('width', innerWidth)
	 .attr('height', innerHeight)
	 .attr('fill', 'none')
	 .attr('pointer-events', 'all')
	 .on('mousemove', () => {
	 	let x = d3.mouse(g.node())[0]

	 	selectedYear = Math.ceil(xScale.invert(x));
	 	selectedYear = clamp(selectedYear, minYear, maxYear);

	 	var line = d3.select(".selectedYear");
	 	line.attr("x1", x);
	 	line.attr("x2", x);
	 })
	 .on('click', () => {
	 	dataOfYear.clear();

	 	for (let [key, value] of Object.entries(data[selectedYear - minYear])) {
	 		if (selectedCountries.has(key))
		    	dataOfYear.add([key, value]);
		}

		let arr = Array.from(dataOfYear);
		arr.sort(function(a,b){
		    return b[1] - a[1];
		});

	 	plotBar(arr);
	 });

	g.append("text")
     .attr("class", "xLabel")
     .attr("x", innerWidth / 2)
     .attr("y", innerHeight + 50)
     .text(xLabel);

    g.append("text")
     .attr("class", "yLabel")
     .attr("x", -margin.left)
     .attr("y", innerHeight / 2)
     .text(yLabel);

}


function plotBar(data) {

	var svg = d3.select('.barchart');

   	d3.selectAll(".barchart > *").remove();


	var width = +svg.attr('width');
	var height = +svg.attr('height'); 

	let yLabel = "GDP($ trillion)";

	let margin = {left:120, right:20, top:20, bottom: 100};
	let innerWidth = width - margin.left - margin.right;
	let innerHeight = height - margin.top - margin.bottom;

	var xScale = d3.scaleBand()
	               .domain(data.map(d => d[0]))
	               .range([0, innerWidth])
	               .padding(0.2);
	var yScale = d3.scaleLinear()
				   .domain([0, d3.max(data, d => d[1])])
				   .range([innerHeight, 0]);

	let g = svg.append('g')
	           .attr('transform', `translate(${margin.left}, ${margin.top})`)

    g.append('g').call(d3.axisLeft(yScale));
    g.append('g').call(d3.axisBottom(xScale))
    	         .attr('transform', `translate(0, ${innerHeight})`);

	g.selectAll('rect')
	   .data(data)
	   .enter()
	   .append('rect')
	   .attr('x', d => xScale(d[0]))
	   .attr('y', d => yScale(d[1]))
	   .attr('fill', "steelblue")
	   .attr('width', xScale.bandwidth())
	   .attr('height', d => innerHeight - yScale(d[1]));
	g.append("text")
     .attr("class", "yLabel")
     .attr("x", -margin.left)
     .attr("y", innerHeight / 2)
     .text(yLabel);
    g.append("text")
     .attr("class", "xLabel")
     .attr("text-anchor", "middle")
     .attr("x", innerWidth / 2)
     .attr("y", innerHeight + 50)
     .text("Year: " + selectedYear);

};

// Global variables
let dataOfYear = new Set();
let selectedYear = 2010;
let selectedCountries = new Set();
let minYear;
let maxYear;

d3.csv('gdp.csv').then(data => {
	// Scale down the numbers since they are so big.
	let scale = 1000000000000;

	// Convert the strings to numbers
	data.forEach(d => {
		d.Year = +d.Year;
		d.China = +d.China / scale;
		d.Germany = +d.Germany / scale;
		d.France = +d.France / scale;
		d["United Kingdom"] = +d["United Kingdom"] / scale;
		d.India = +d.India / scale;
		d.Japan = +d.Japan / scale;
		d["United States"]= +d['United States'] / scale;
	});

	let countries = data.columns.slice();
	countries.shift();
	plotButtons(countries);

	minYear = d3.min(data, d => d["Year"]);
	maxYear = d3.max(data, d => d["Year"]);

    // Save data as a global variable for later use.
	window.data = data;
});





































