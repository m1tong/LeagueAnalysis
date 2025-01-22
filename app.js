function finalproject(){
    var filePath="data.csv";
    question0(filePath);
    question1(filePath);
    question2(filePath);
    question3(filePath);
    question4(filePath);
    question5(filePath);
}

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data)
    });
}

var question1=function(filePath){
    d3.csv(filePath).then(function(data){
        var filteredData = data.filter(function(d) { return d['GP_player'] > 0; });

        // Group data by region and count the number of players
        var groupedData = d3.rollup(data, 
            // Group by country
            v => (v.length),
            // Count number of players per country
            d => d.Region
          );
        
        const dataArray = Array.from(groupedData, ([key, value]) => ({ Region: key, Count: value }));

        // --------------------------- create svg ----------------------------------
        
        max = d3.max(groupedData.values())
        min = d3.min(groupedData.values())

        const legendScale = d3.scaleLinear().domain([min, max]);
        
        var width = 800;
        var height = 500;
        var smallfix = 0;
        const margin = {top: 30, right: 60, bottom: 100, left: 30};
        var colors = ["#FF6D56", "#FFC756", "#9DF373", "#ED73F3", "#7F73F3"];
        var hue = d3.scaleOrdinal()
        .domain(['LPL', 'LCS', 'LEC', 'LMS', 'LCK'])
        .range(colors)

        const projection  = d3.geoNaturalEarth1()
            .scale(width / 1.8 / Math.PI)
            .translate([width / 2, height / 2])
        const pathgeo2 = d3.geoPath().projection(projection);

        var svg = d3.select("#world_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            // .style("background-color", '#1A2949')


        //base sphere for the world map
        svg.append('path')
            .attr('class', 'sphere')
            .attr('d', pathgeo2({ type: 'Sphere' }))
            .attr('fill', '#228AA1')
            .attr("transform", `translate(0, ${margin.top})`)
            .attr("stroke", "white") // #75c0bc

        //TO DO: Load JSON file and create the map
        const worldmap = d3.json("world.json")

        worldmap.then(function(data){

            // Set up the circle radius scale
            var radiusScale = d3.scaleLinear()
            .domain([d3.min(groupedData.values()), d3.max(groupedData.values())])
            .range([d3.min(groupedData.values()), d3.max(groupedData.values())]);

            const regionCoords = {};

    
            filteredData.forEach(function(d){
                const cent = [+d.Longitude, +d.Latitude];
                const coords = projection(cent)
                regionCoords[d.Region] = coords
            })

            svg.append('g')
                .selectAll('path')
                .data(data.features)
                .enter().append('path')
                .attr('fill', '#96D9DD')
                .attr("d", pathgeo2)
                .attr("stroke", "#ffff")
                .attr("transform", `translate(0, ${margin.top})`);

            var tooltip = d3.select("#world_plot").append("div").style("opacity", 0).attr("class", "tooltip");


             // Draw the circles on top of the countries
            svg.selectAll(".circle")
            .data(groupedData)
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", function(d) { return regionCoords[d[0]][0] })
            .attr("cy", function(d) { return regionCoords[d[0]][1]})
            .attr("r", function(d) { 
                return radiusScale(d[1]) + smallfix })
            .attr("fill", function(d) { 
                return hue(d[0]); })
            .attr("opacity", 0.8)
            .attr("stroke", "black")   // Add red outline
            .attr("stroke-width", 1) 
            .attr("transform", `translate(0, ${margin.top})`)
            .on("mouseover", function (event, d) {
                tooltip.transition()
                  .duration(400)
                  .style("opacity", 0.9);
                tooltip.html(d[0] + ": Total " + d[1])
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function (d) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 0);
              });

            svg.selectAll("text")
            .data(groupedData)
            .enter()
            .append("text")
            // Add your code below this line
            .text((d) => d[0])
            .attr("x", (d, i) => regionCoords[d[0]][0] - 8)
            .attr("y", (d, i) => regionCoords[d[0]][1] + 32)
            .attr("font-size", "8px")


            // Add plot title
            // svg.append("text")
            // .attr("class", "title")
            // .attr("text-anchor", "middle")
            // .attr("x", width / 2)
            // .attr("y", margin.top)
            // .text("Number of Players in Each Region")
            // .attr("fill", "black")
            // .attr("font-size", "10px")

            // Add the legend
            var legend = svg.selectAll(".legend")
            .data(radiusScale.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(" + 50 + "," + (height - i * 40) + ")"; });

            legend.append("circle")
            .attr("r", function(d) { return radiusScale(d) + smallfix; })
            .attr("fill", "white")
            .attr("stroke", "black")   // Add red outline
            .attr("stroke-width", 1) 
            .attr("opacity", 0.7);

            legend.append("text")
            .attr("x", 30)
            .attr("y", 5)
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .text(function(d) { return d; })
            .attr("fill", "black")


        })
        


    });
    
}
//
var question2=function(filePath){
    d3.csv(filePath).then(function(data){
        // KDA vs DPM
        var margin = {left: 100, right: 100, top: 100, bottom: 100, padding: 30}
        let svgwidth = 800 - margin.left - margin.right;
        let svgheight = 800 - margin.top - margin.bottom;
    
        let svg = d3.select("#scatter_plot").append("svg")
            .attr("width", svgwidth + margin.left + margin.right)
            .attr("height", svgheight+ margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // scale
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.KDA)]) //notice how the domain is set
            .range([0, svgwidth])

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {
                return d.DPM;
            })])
            .range([svgheight, 0]);

        var colors = ["#FF6D56", "#FFC756", "#9DF373", "#ED73F3", "#7F73F3"];
        var hue = d3.scaleOrdinal()
            .domain(['Top', 'Jungle', 'Middle', 'ADC', 'Support'])
            .range(colors)
        

        // axis
        svg.append("g")
        .attr("transform", "translate(0," + svgheight + ")")
        .call(d3.axisBottom(xScale))
    
        svg.append("g")
            .call(d3.axisLeft(yScale))

        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", svgheight + margin.bottom  - 10)
        .text("KDA");

        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -svgheight / 2)
        .attr("y", -margin.left + margin.left / 2)
        .attr("transform", "rotate(-90)")
        .text("DPM");

        var tooltip = d3.select("#scatter_plot").append("div").style("opacity", 0).attr("class", "tooltip");

        let plot = svg.append("g").selectAll("dot")
            .data(data).enter()
            .append("circle")
            .attr("cx", function(d){ return xScale(d.KDA); })
            .attr("cy", function(d){ return yScale(d.DPM); })
            .attr("r", 6)
            .attr("opacity", 0.8)
            .attr("fill", d => hue(d.Player))
            .on("mouseover", function (event, d) {
                tooltip.transition()
                  .duration(400)
                  .style("opacity", 0.9);
                tooltip.html(d.Player + "<br>KDA: " + d.KDA + "<br>DPM: " + d.DPM)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
        
         // Add plot title
        svg.append("text")
        .attr("class", "plottitle")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", -margin.top / 2)
        .text("KDA vs DPM for Each Player")
        .attr("font-size", "20px")
        

        // add legend
        var legend = svg.append('g')
            .attr("class", "legend")
            // .attr("width", 200)
            // .attr("height", 200)
            .selectAll("g")
            .data(colors)
            .enter()
            .append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", function(d) { return d; })
            .attr("opacity", 0.8)

        legend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(function(d, i) { return ['Top', 'Jungle', 'Middle', 'ADC', 'Support'][i]; });

        // const legend = svg.append('g')
        //     .attr('class', 'legend')
        //     .selectAll('g')
        //     .data(key)
        //     .enter()
        //     .append('g')
        //     .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        // // Add a rectangle and text element for each item in the legend
        // legend.append('rect')
        // .attr('width', 10)
        // .attr('height', 10)
        // .attr('fill', d => d.color)
        // .attr('transform', `translate(${svgwidth - margin.right},${margin.top -30})`);

        // legend.append('text')
        // .attr('x', svgwidth - margin.right + 15)
        // .attr('y', margin.top - 20)
        // .text(d => d.label);


    });
    
}
var question3=function(filePath){
    d3.csv(filePath).then(function(data){
        // Bar plot of Team vs GP (game play), look at one of the lab/lecture exercise for sorting

        // Use d3.rollup to group the data and get the maximum GP_team value for each team
        const groupedData = d3.rollup(data, 
        // Specify the reducer function for each group
        group => d3.max(group, d => +d.GP_team), 
        // Specify the key function used for grouping
        d => d.Team
        );
        
        // const dataArray = Array.from(groupedData, ([key, value]) => ({ Team: key, GP: value }));
        const mapData = d3.map(groupedData, ([key, value]) => ({ Team: key, GP: value }));

        // get the rank for each team
        const rankData = d3.rollup(data, 
            // Specify the reducer function for each group
            group => d3.max(group, d => +d.Rank),
            // Specify the key function used for grouping
            d => d.Team
            );

        const rankMap = d3.map(rankData, ([key, value]) => ({ Team: key, Rank: value }));

        var teamNames = [...d3.map(mapData, d=> d.Team)]


        // set the dimensions and margins of the graph
        var margin = {top: 60, right: 100, bottom: 100, left: 150, padding: 5};
        let svgwidth = 1000 - margin.left - margin.right
        let svgheight = 800 - margin.top - margin.bottom

        // append the svg object to the div "stream" of the page
        var svg = d3.select("#gp_plot")
            .append("svg")
            .attr("width", svgwidth + margin.left + margin.right)
            .attr("height", svgheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // scale
        var xScale = d3.scaleLinear()
							.domain([0,
									 d3.max(mapData, function(d){return d.GP;})
									])
							.range([0, svgwidth])

        var yScale = d3.scaleBand()
                        .domain(teamNames)
                        .range([svgheight, 0]);

        // axis                            
        var xaxis = svg.append("g")
        .attr('class', 'x-axis')
        .attr("transform", "translate(0," + svgheight + ")")
        .call(d3.axisBottom(xScale))
        
        xaxis.selectAll("line")
        .style("stroke", "white");
    
        xaxis.selectAll("path")
        .style("stroke", "white");
    
        xaxis.selectAll("text")
        .attr("fill", "white")
        .attr("font-size", "12px")
    
        var yaxis = svg.append("g")
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))

        yaxis.selectAll("line")
        .style("stroke", "white");
    
        yaxis.selectAll("path")
        .style("stroke", "white");
    
        yaxis.selectAll("text")
        .attr("fill", "white")
        .attr("font-size", "12px")

    
        var tooltip = d3.select("#gp_plot").append("div").style("opacity", 0).attr("class", "tooltip");

        var svg_bars = svg.selectAll(".bar")
					.data(mapData).enter().append("rect")
				  	.attr("class", "bar")
                    .attr("fill", "rgb(232, 202, 38)")
				  	.on("mouseover", function(event, d){  		
				  		d3.select(this)
				  			.attr("fill", "white")
                        tooltip.transition()
                            .duration(400)
                            .style("opacity", 0.9);
                        tooltip.html(d.Team + "<br>Total Game Play: " + d.GP)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
				  	})
                    //TO DO : Add code for mouseout
					.on("mouseout", function(event, d) {
						d3.select(this)
							.transition()
  							.duration(300)
        					.attr("fill", "rgb(232, 202, 38)");
                            tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
					})
				  	.attr("x", function(d){
						return 0;
				  	})
					.attr("y", function(d, i){
						return yScale(d.Team);
					})
					.attr("width", function(d){
						return xScale(d.GP);
					})
					.attr("height", function(d){
						return (svgheight/mapData.length)-2;
					})


        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", svgheight + 50)
        .text("Total Game Play")
        .attr("font-size", "20px")
        .attr("fill", "rgb(232, 202, 38)")
        

        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -svgheight / 2)
        .attr("y", -margin.left + 25)
        .attr("transform", "rotate(-90)")
        .text("Team")
        .attr("font-size", "20px")
        .attr("fill", "rgb(232, 202, 38)")

        // Add plot title
        svg.append("text")
        .attr("class", "plottitle")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", -margin.top / 2)
        .text("Total Game Play in Each Team")
        .attr("font-size", "20px")
        .attr("fill", "white")

		// Add event listener to sort button
        d3.select("#sort_button_GP").on("click", function() {
            // Sort data by GP value
            mapData.sort((a, b) => a.GP - b.GP);
        
            var teamNames = [...d3.map(mapData, d=> d.Team)]
            // Update the yScale domain with the sorted team names
            yScale = d3.scaleBand()
                    .domain(teamNames)
                    .range([svgheight, 0]);
        
            // Update y-axis
            svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", "12px");
 
            // Update bars
            svg.selectAll(".bar")
            .data(mapData)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return yScale(d.Team);
                })
            .attr("width", function(d) {
            return xScale(d.GP);
            });

            // update title
            svg.selectAll(".plottitle")
            .transition()
            .duration(1000)
            .text("Total Game Play in Each Team Sort By Game Play")
            .attr("font-size", "20px")
        
        });

        // Add event listener to sort button
        d3.select("#sort_button_Rank").on("click", function() {
            // Sort data by GP value
            rankMap.sort((a, b) => b.Rank - a.Rank);
        
            var teamNames = [...d3.map(rankMap, d=> d.Team)]
            // Update the yScale domain with the sorted team names
            yScale = d3.scaleBand()
                    .domain(teamNames)
                    .range([svgheight, 0]);
        
            // Update y-axis
            svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", "12px");
 
            // Update bars
            svg.selectAll(".bar")
            .data(mapData)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return yScale(d.Team);
                })
            .attr("width", function(d) {
            return xScale(d.GP);
            })

            // update title
            svg.selectAll(".title")
            .transition()
            .duration(1000)
            .text("Total Game Play in Each Team Sort By Rank")
            .attr("font-size", "20px")
        
        });

    

})
}

var question4=function(filePath){
    d3.csv(filePath).then(function(data){
        // Group the data by state
        const groupedData = d3.rollup(
            data,
            teamData => {
              const subcatPos = d3.rollup(
                teamData,
                teamData => {
                    const wpm = d3.sum(teamData, d => +d.WPM_player);
                    return  isNaN(wpm) ? 0 : wpm;
                  },
                d => d['Pos']
              );
              return Object.fromEntries(subcatPos);
            },
            d => d.Team
          );
        
        console.log(groupedData)

        // Convert the grouped data into an array of objects for easier processing
        const processedData = Array.from(groupedData.entries(), d => {
            // const sortedwpm = Object.fromEntries(
            //   Object.entries(d[1]).sort((a, b) => a[0].localeCompare(b[0]))
            // );
            return {
                Team: d[0],
                wards: d[1]
            };
        })

        console.log(processedData)

        //Transform grouped data into an array of objects for use with d3.stack()
        const stackedData = Array.from(groupedData, ([team, wpm]) => {
            return {
                Team: team,
                ...wpm
            };
        });

        console.log(stackedData)
        var series =  d3.stack().keys(Object.keys(stackedData[0]).slice(1))
        // var series =  d3.stack().keys(['Top', 'Jungle', 'Middle', 'ADC', 'Support'])
		var stacked = series(stackedData)

        const rankData = d3.rollup(data, 
            // Specify the reducer function for each group
            group => d3.max(group, d => +d.Rank),
            // Specify the key function used for grouping
            d => d.Team
            );

        const rankMap = d3.map(rankData, ([key, value]) => ({ Team: key, Rank: value }));
        rankMap.sort((a, b) => a.Rank - b.Rank);
        
        var teamNames = [...d3.map(rankMap, d=> d.Team)]
        
        // Define the dimensions of the plot
        const width = 800;
        const height = 500;

        // Define the margins
        const margin = {top: 100, right: 60, bottom: 100, left: 100};

        // Create the SVG element and set its dimensions
        const svg = d3.select("#wpm_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Define the x scale
        const xScale = d3.scaleBand()
        .domain(teamNames)
        .range([0, width])
        .paddingInner(0.5)
        .paddingOuter(0.5)
        .padding(0.2);

        // Define the y scale
        const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.WPM_player)])
        .range([height, 0]);

        // // Define the color scale
        // var colors = ["brown", "red", "yellow", "orange"]
        // const colorScale = d3.scaleOrdinal()
        // .domain(Object.keys(processedData[0].sales))
        // .range(colors);

        var colors = ["#FF6D56", "#FFC756", "#9DF373", "#ED73F3", "#7F73F3"];
        var colorScale = d3.scaleOrdinal()
            .domain(['Top', 'Jungle', 'Middle', 'ADC', 'Support'])
            .range(colors)

        // Define the x axis
        const xAxis = d3.axisBottom(xScale);

        // Define the y axis
        const yAxis = d3.axisLeft(yScale)

        // Draw the x axis
        xaxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)

        xaxis.selectAll("line")
        .style("stroke", "white");
    
        xaxis.selectAll("path")
        .style("stroke", "white");
    
        xaxis.selectAll("text")
        .attr("fill", "white")
        .attr("font-size", "12px")
        .attr("transform", "rotate(-20)")
        .attr("text-anchor", "end")


        // Draw the y axis
        yaxis = svg.append("g")
        .call(yAxis)

        yaxis.selectAll("line")
        .style("stroke", "white");
    
        yaxis.selectAll("path")
        .style("stroke", "white");
    
        yaxis.selectAll("text")
        .attr("fill", "white")
        .attr("font-size", "12px")

        var tooltip = d3.select("#wpm_plot").append("div").style("opacity", 0).attr("class", "tooltip");


        var categories = svg.selectAll(".category")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "category")
        .attr("transform", function(d) { return "translate(" + xScale(d.Team) + ",0)"; });

        categories.append("rect")
        .attr("class", "variable1")
        .attr("x", 0)
        .attr("y", function(d) { return yScale(d.Top); })
        .attr("width", xScale.bandwidth() / 5)
        .attr("height", function(d) { return height - yScale(d.Top); })
        .attr("fill", d => colorScale("Top"))
        .on("mouseover", function (event, d) {
            tooltip.transition()
              .duration(400)
              .style("opacity", 0.9);

            var name = data.filter(function(full) { return full['Team'] == d.Team && full['Pos'] == "Top" })[0].Player
            tooltip.html(name + "<br>WPM: " + d.Top)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

        categories.append("rect")
        .attr("class", "variable2")
        .attr("fill", d => colorScale("Jungle"))
        .attr("x", xScale.bandwidth() / 5)
        .attr("y", function(d) { return yScale(d.Jungle); })
        .attr("width", xScale.bandwidth() / 5)
        .attr("height", function(d) { return height - yScale(d.Jungle); })
        .on("mouseover", function (event, d) {
            tooltip.transition()
              .duration(400)
              .style("opacity", 0.9);

            var name = data.filter(function(full) { return full['Team'] == d.Team && full['Pos'] == "Jungle" })[0]
            tooltip.html(name.Player + "<br>WPM: " + d.Jungle)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

        categories.append("rect")
        .attr("class", "variable3")
        .attr("fill", d => colorScale("Middle"))
        .attr("x", xScale.bandwidth() / 5 * 2)
        .attr("y", function(d) { return yScale(d.Middle); })
        .attr("width", xScale.bandwidth() / 5)
        .attr("height", function(d) { return height - yScale(d.Middle); })
        .on("mouseover", function (event, d) {
            tooltip.transition()
              .duration(400)
              .style("opacity", 0.9);

            var name = data.filter(function(full) { return full['Team'] == d.Team && full['Pos'] == "Middle" })[0].Player
            tooltip.html(name + "<br>WPM: " + d.Middle)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

        categories.append("rect")
        .attr("class", "variable4")
        .attr("fill", d => colorScale("ADC"))
        .attr("x", xScale.bandwidth() / 5 * 3)
        .attr("y", function(d) { return yScale(d.ADC); })
        .attr("width", xScale.bandwidth() / 5)
        .attr("height", function(d) { return height - yScale(d.ADC); })
        .on("mouseover", function (event, d) {
            tooltip.transition()
              .duration(400)
              .style("opacity", 0.9);

            var name = data.filter(function(full) { return full['Team'] == d.Team && full['Pos'] == "ADC" })[0].Player
            tooltip.html(name + "<br>WPM: " + d.ADC)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

        categories.append("rect")
        .attr("class", "variable5")
        .attr("fill", d => colorScale("Support"))
        .attr("x", xScale.bandwidth() / 5 * 4)
        .attr("y", function(d) { return yScale(d.Support); })
        .attr("width", xScale.bandwidth() / 5)
        .attr("height", function(d) { return height - yScale(d.Support); })
        .on("mouseover", function (event, d) {
            tooltip.transition()
              .duration(400)
              .style("opacity", 0.9);

            var name = data.filter(function(full) { return full['Team'] == d.Team && full['Pos'] == "Support" })[0].Player
            tooltip.html(name + "<br>WPM: " + d.Support)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    
        // var groups = svg.selectAll(".gbars")
        //     .data(stacked).enter().append("g")
        //     .attr("class", "gbars")
        //     .attr("fill", d => colorScale(d.key))

        // console.log(stacked)
        // var rects = groups.selectAll("rect")
        //     .data(function(d){
        //         return d;
        //     }).enter().append("rect")
        //     .attr("x", d => xScale(d.data.Team))
        //     .attr("y", function(d) { 
        //         return yScale(d[1])} )
        //     .attr("height", d => isNaN(yScale(d[0]) - yScale(d[1])) ? 0 : (yScale(d[0]) - yScale(d[1])))
        //     .attr("width", xScale.bandwidth())
        //     .on("mouseover", function (event, d) {
        //         // const stackedItem = stacked.find(item => item.Team === d.data.Team);
        //         // const player = stackedItem && Object.keys(stackedItem[d.data.Pos]).find(player => stackedItem[d.data.Pos][player] === d[1]);            
        //         tooltip.transition()
        //           .duration(400)
        //           .style("opacity", 0.9);
        //         tooltip.html(d.data.Team + "<br>WPM: " + d[1])
        //           .style("left", (event.pageX + 10) + "px")
        //           .style("top", (event.pageY - 28) + "px");
        //       })
        //     .on("mouseout", function (d) {
        //         tooltip.transition()
        //             .duration(200)
        //             .style("opacity", 0);
        //     });

        // Add x-axis label
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .text("Team Order by Rank")
        .attr("fill", "rgb(232, 202, 38)")
        
        // Add y-axis label
        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .text("Ward Per Minute")
        .attr("fill", "rgb(232, 202, 38)")
        
        // Add plot title
        svg.append("text")
        .attr("class", "plottitle")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .text("Total Ward Per Minute by Team")
        .attr("font-size", "20px")
        .attr("fill", "white")

    // add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .selectAll('g')
        .data(['Top', 'Jungle', 'Middle', 'ADC', 'Support'])
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(-180, ${i * 20 - 180})`);

    // Add a rectangle and text element for each item in the legend
    legend.append('rect')
    // .attr("x", width- margin.left - margin.right)
    // .attr("y", 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr("fill", d => colorScale(d))
    .attr('transform', `translate(${width - margin.right - 500},${margin.top})`);

    legend.append('text')
    .attr('x', width - margin.right + 15 - 500)
    .attr('y', margin.top + 10)
    .text((d, i)=> d)
    .attr("fill", "white")

    });

}


var question5=function(filePath){
    d3.csv(filePath).then(function(data){
        const regionData = {
            "LPL": [],
            "LCK": [],
            "LCS": [],
            "LEC": [],
            "LMS": []
          };
        
        data.forEach(function(d){
            regionData[d.Region].push(+d.DPM)
        })
        console.log(regionData)

        const statsData = {
            "LPL": [{min:0}],
            "LCK": [],
            "LCS": [],
            "LEC": [],
            "LMS": []
        }
        console.log(statsData)
        // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        for (let region in regionData) {
            // let sorted = regionData[region].sort((a, b) => a - b);
            let data_sorted = regionData[region].sort((a,b) => a - b)
            var q1 = d3.quantile(data_sorted, .25)
            var median = d3.quantile(data_sorted, .5)
            var q3 = d3.quantile(data_sorted, .75)
            var interQuantileRange = q3 - q1
            var min = q1 - 1.5 * interQuantileRange
            var max = q3 + 1.5 * interQuantileRange
        
            // statsData[region].push({min: min}, {q1: q1}, {median: median}, {q3:q3}, {max: max})
            statsData[region] = ({min: min, q1: q1, median: median, q3:q3, max: max})


            // let n = sorted.length;
            // let median = n % 2 == 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[(n - 1) / 2];
            // let q1 = sorted.slice(0, Math.floor(n/2)).length % 2 == 0 ? (sorted[Math.floor(n/4) - 1] + sorted[Math.floor(n/4)]) / 2 : sorted[Math.floor(n/4)];
            // let q3 = sorted.slice(Math.ceil(n/2)).length % 2 == 0 ? (sorted[Math.ceil(n*3/4) - 1] + sorted[Math.ceil(n*3/4)]) / 2 : sorted[Math.ceil(n*3/4)];
            // let iqr = q3 - q1;
            // let lowerLimit = q1 - 1.5 * iqr;
            // let upperLimit = q3 + 1.5 * iqr;
            // let outliers = sorted.filter(x => x < lowerLimit || x > upperLimit);
            // console.log(region + ":");
            // console.log("Median: " + median);
            // console.log("Q1: " + q1);
            // console.log("Q3: " + q3);
            // console.log("IQR: " + iqr);
            // console.log("Outliers: " + outliers);
          }
        
        console.log(Object.keys(statsData))

        // set the dimensions and margins of the graph
        var margin = {top: 100, right: 100, bottom: 100, left: 100, padding: 5};
        let svgwidth = 800 - margin.left - margin.right
        let svgheight = 800 - margin.top - margin.bottom

        // append the svg object to the div "stream" of the page
        var svg = d3.select("#box_plot")
            .append("svg")
            .attr("width", svgwidth + margin.left + margin.right)
            .attr("height", svgheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // scale
        var xScale = d3.scaleBand()
                    // .domain(['LPL', 'LCK', 'LCS', 'LEC', 'LMS'])
                    .domain(Object.keys(statsData))
                    .range([0, svgwidth])
                    .paddingInner(1)
                    .paddingOuter(.5)
                    

		
        var yScale = d3.scaleLinear()
                    .domain([d3.min(Object.values(statsData), function(d){return d.min - 40;}),
                        d3.max(Object.values(statsData), function(d){return d.max + 40;})
                        ])
                    .range([svgheight, 0]);

        var colors = ["#FF6D56", "#FFC756", "#9DF373", "#ED73F3", "#7F73F3"];
        var hue = d3.scaleOrdinal()
        .domain(['LPL', 'LCS', 'LEC', 'LMS', 'LCK'])
        .range(colors)
                  

        // axis                            
        svg.append("g")
        .attr('class', 'x-axis')
        .attr("transform", "translate(0," + svgheight + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("font-size", "10px");
    
        svg.append("g")
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", "12px");

        
        console.log(Object.entries(statsData))
        // Show the main vertical line
        svg.selectAll("vertLines")
        .data(Object.entries(statsData))
        .enter()
        .append("line")
        .attr("x1", function(d){ return xScale(d[0])})
        .attr("x2", function(d){return(xScale(d[0]))})
        .attr("y1", function(d){return(yScale(d[1].min))})
        .attr("y2", function(d){return(yScale(d[1].max))})
        .attr("stroke", "black")
        .style("width", 40)

        var tooltip = d3.select("#box_plot").append("div").style("opacity", 0).attr("class", "tooltip");

        // rectangle for the main box
        var boxWidth = 100
        svg.selectAll("boxes")
            .data(Object.entries(statsData))
            .enter()
            .append("rect")
            .attr("x", function(d){return(xScale(d[0])-boxWidth/2)})
            .attr("y", function(d){return(yScale(d[1].q3))})
            .attr("height", function(d){return(yScale(d[1].q1)-yScale(d[1].q3))})
            .attr("width", boxWidth )
            .attr("stroke", "black")
            .attr("fill", function(d) { 
                return hue(d[0]); })
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(400)
                    .style("opacity", 0.9);
    
                tooltip.html(d[0] + "<br>Max: " + d[1].max + "<br>q3: " + d[1].q3+ "<br>Median: " + d[1].median+ "<br>q1: " + d[1].q1 + "<br>Min: " + d[1].min)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // Show the median
        svg
        .selectAll("medianLines")
        .data(Object.entries(statsData))
        .enter()
        .append("line")
            .attr("x1", function(d){return(xScale(d[0])-boxWidth/2) })
            .attr("x2", function(d){return(xScale(d[0])+boxWidth/2) })
            .attr("y1", function(d){return(yScale(d[1].median))})
            .attr("y2", function(d){return(yScale(d[1].median))})
            .attr("stroke", "black")
            .style("width", 80)

        // show the min
        svg
        .selectAll("medianLines")
        .data(Object.entries(statsData))
        .enter()
        .append("line")
            .attr("x1", function(d){return(xScale(d[0])-boxWidth/2) })
            .attr("x2", function(d){return(xScale(d[0])+boxWidth/2) })
            .attr("y1", function(d){return(yScale(d[1].min))})
            .attr("y2", function(d){return(yScale(d[1].min))})
            .attr("stroke", "black")
            .style("width", 80)

        // show the max
        svg
        .selectAll("medianLines")
        .data(Object.entries(statsData))
        .enter()
        .append("line")
            .attr("x1", function(d){return(xScale(d[0])-boxWidth/2) })
            .attr("x2", function(d){return(xScale(d[0])+boxWidth/2) })
            .attr("y1", function(d){return(yScale(d[1].max))})
            .attr("y2", function(d){return(yScale(d[1].max))})
            .attr("stroke", "black")
            .style("width", 80)
        

        // Add plot title
        svg.append("text")
        .attr("class", "plottitle")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", margin.top - 100)
        .text("Box Plot Distribution of DPM for Each Region")
        .attr("fill", "black")
        .attr("font-size", "20px")

        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", svgwidth / 2)
        .attr("y", svgheight + margin.bottom - 30)
        .text("Region");

        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -svgheight / 2)
        .attr("y", -margin.left + margin.left / 2)
        .attr("transform", "rotate(-90)")
        .text("DPM");
    });
}
