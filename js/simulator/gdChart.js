// chart class for d3.js based line charts
// Block Science 2020

class gdChart {
	
	constructor(opts) {
		this.element = opts.element;
		this.height = opts.elementHeight;
		this.data = opts.data;
		this.mapping = opts.mapping;
		this.options = opts.options;
		this.margins = opts.margins;
		this.draw();
				
		/* Example opts object
			const previewDiv = document.getElementById('previewChart');
			const previewOpts = {
				element: previewDiv,
				data: [
						{x: 1, y:1, group: "one"},
						{x: 2, y:5, group: "one"},	
						{x: 3, y:3, group: "one"},
						{x: 4, y:10, group: "one"},
						{x: 5, y:5, group: "one"}				
						],
				mapping: {
					x_var: "x",
					y_var: "y",
					group: "group"
				},
				options:{
					transition:{
						speed: 1500
						},
					xAxisFormat: 's',
					yAxisFormat: 's',
					colorScheme:[
					['red'], ['one']
					]
				},
				margins:{
					top: 20,
					bottom:40,
					left:25,
					right:25
				}
			}
		
		*/
    }
	
	get opts(){
		return this.options;
	}
	
	set opts(x){
		this.options = x ;
	}
	
	draw (){
		//define dimensions
		this.width = this.element.offsetWidth;
		const m = this.margins;
		
		//set up parent element and SVG
		this.element.innerHTML = '';
		this.svg = d3.select(this.element).append('svg').attr('id', this.element.id)
			.attr('class', 'chart')
			.attr('width', this.width)
			.attr('height', this.height);
		
		this.plot = this.svg.append('g')
				.attr('transform','translate('+m.left+','+m.top+')')
				.attr('class', 'gdChart-offset');	
				
		this.chart = this.plot
			.append('g')
			.attr('class', 'gdChart-area');
		
		this.clipPath = this.chart.append('defs').append('svg:clipPath')
			.attr('id', this.element.id + 'clip')
		  .append('svg:rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.width - (m.left + m.right))
			.attr('height', this.height - (m.top + m.bottom));
		
		this.chart.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
	
		this.plot.append('g')
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (this.height-(m.top+m.bottom)) + ")");
				
		this.plot.append('g')
			.attr("class", "y axis");
			
		this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
		this.toolTipTitle = this.tooltip
			.append('div')
			.attr('class', 'toolTipTitle')
			.style('background-color', 'lightgray');
		this.toolTipBody = this.tooltip
			.append('div')
			.attr('class', 'toolTipBody');
		
		this.update(this.data);
	}
	
	update(data) {
		const that = this;
		this.data = data;
		const m = this.margins;
		const transitionSpeed = this.options.transition.speed;
		
		const x = d3.extent( data, d => +d[this.mapping.x_var] );
		//const y = d3.extent( data, d => +d[this.mapping.y_var] );
		const yExtents = [];
		this.mapping.y_var.forEach(function(ly){
			const extent = d3.extent( data, d => +d[ly] );
			yExtents.push(extent);
		});
		
		var y_min = d3.min(yExtents, function(d,i) {return d[0]; });
		var y_max = d3.max(yExtents, function(d,i) {return d[1]; });
		const y = [0, ( y_max + (y_max *.17) ) ];

		const xFormat = d3.format(this.options.xAxisFormat);
		const yFormat = d3.format(this.options.yAxisFormat);
		
		const xScale = d3.scaleLinear()
					.range([0, this.width - (m.right + m.left)])
					.domain(x);
					
		const yScale = d3.scaleLinear()
					.range([this.height - (m.top + m.bottom), 0])
					.domain(y);
					
		const colorDiscrete = d3.scaleOrdinal()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
					
		this.svg.selectAll('.x.axis')
					.transition().ease(d3.easeQuad)
					.duration(transitionSpeed)
					.attr("transform", "translate(0," + (this.height-(m.top+m.bottom)) + ")")
						.call(d3.axisBottom(xScale)
								.ticks(this.width < 550 ? 5 : 10, xFormat)
								//.tickSize( -(this.height-(m.top+m.bottom)) )
								//.tickFormat(function(e){ if(Math.floor(+e) != +e){return;} return +e;})
									)
							.selectAll("text")
								.attr('dy', '1.25em' )
								.attr('text-anchor', this.width < 550 ? 'end' : 'center')
								//.attr("transform", this.width < 550 ? "rotate(-65)" : "rotate(-0)")
								;
		this.plot.append("text")
				.attr('class', 'x label')
				.attr("transform",
					"translate(" + ( (this.width-(m.right+m.left)) / 2) + " ," + 
								   (this.height - (m.top + m.bottom/2) ) + ")")
				.style("text-anchor", "middle")
				.text(this.options.xAxisLabel)
		
		this.svg.selectAll('.y.axis')
			.transition().ease(d3.easeQuad)
			.duration(transitionSpeed)
			.call(d3.axisLeft(yScale)
				.ticks( this.height < 450 ? 5 : 10 )
				.tickFormat( (d,i) => correctFormat( yFormat(d) ) )
				.tickSize( -(this.width-(m.right+m.left)) )
				)				
			.selectAll("text")
				.attr("dx", "-.25em");
				//.text( d => correctFormat( yFormat(d) ) );
		
		this.mapping.y_var.forEach(function(ly){
			const valueLine = d3.line()
				.curve(d3.curveMonotoneX)
				.x(d => xScale( d[ that.mapping.x_var ] ) )
				.y(d => yScale( d[ ly ] ) );
				
			const areaLine = d3.area()
				.curve(d3.curveMonotoneX)
				.x(d => xScale( d[ that.mapping.x_var ] ) )
				.y0(d => yScale( 0 ) )
				.y1(d => yScale( d[ ly ] ) );

			const linePath = that.chart
				.selectAll( '.line-path' + ly.replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
				.data([data]);
			
			//EXIT old elements not present in new data
			linePath.exit()
			  .transition().duration(transitionSpeed).style('opacity', 0)
				.remove();
			
			//ENTER new elements present in new data
			const newLinePath = linePath.enter().append("path")
				.attr("class", "line-path" + ly.replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
				.attr("fill", "none")
				.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
				.style('stroke', d => colorDiscrete( ly ) )
				.style("stroke-width", 3)
				.style('opacity', 0)
				.raise();
				
			//UPDATE old elements present in new data
			linePath.merge(newLinePath)	
			  .transition()
			  .ease(d3.easeQuad)
			  .duration(transitionSpeed)
				.style('opacity', 1)
				.style('stroke',d => colorDiscrete( ly ) )
				.attr("d", valueLine);
				
			const areaPath = that.chart
						.selectAll( '.area-path' + ly.replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
						.data([data]);
			
			//EXIT old elements not present in new data
			areaPath.exit()
			  .transition().duration(transitionSpeed).style('opacity', 0)
				.remove();
			
			//ENTER new elements present in new data
			const newAreaPath = areaPath.enter().append("path")
				.attr("class", "area-path"+ ly.replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
				.style('fill',d => colorDiscrete( ly ) )
				.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
				.style('stroke', 'none' )
				.style('opacity', 0);
				
			//UPDATE old elements present in new data
			areaPath.merge(newAreaPath)	
			  .transition()
			  .ease(d3.easeQuad)
			  .duration(transitionSpeed)
				.style('opacity', 0.2)
				.style('fill',d => colorDiscrete( ly ) )
				.style('stroke', 'none' )
				.attr("d", areaLine);
		});
		
		if(this.options.legend == "bottom"){
			var legendSpace = (this.width - (m.left + m.right) ) / this.mapping.y_var.length;
			
			this.mapping.y_var.forEach(function(d,i){
				that.svg.append("text")
				.attr("x", (legendSpace/2)+i*legendSpace) // spacing
				.attr("y", that.height - (m.top + (m.bottom/4)) + 25 )
				.attr("class", "legend")    // style the legend
				.style("fill", function() { // dynamic colours
					return colorDiscrete( d ) })
				.text(d);
			});
			

		}
		
		if(this.options.initDraw == "l2r"){
			var curtain = this.chart.append('svg:rect')
						.attr('x', 0 )
						.attr('y', 0 )
						.attr('width', this.width - (m.left + m.right) )
						.attr('height', this.height - (m.top + m.bottom) )
						.attr('class', 'curtain')
						//.attr('transform', 'rotate(180)')
						.style('fill', '#ffffff');
						
		var t = this.chart.transition()
			.delay(250)
			.duration(2500)
			.ease(d3.easeLinear);
		
		t.select('rect.curtain')
			.attr('x', this.width - (m.left + m.right))
			.remove();	
		}
		
		/* rollover box */	
		d3.select(this.element).select('.toolTipBox').remove();
		d3.select(this.element).select('.toolLine').remove();
		var horizontalBreakPoint = this.width * .70;

		var toolLine =  this.chart.append('line').attr('class', 'toolLine');
		
		var toolTipBox = this.svg.append("rect")
			.attr('class', 'toolTipBox')
			.attr("opacity", 0)
			.attr("width", this.width - (m.left + m.right))
			.attr("height", this.height - ( m.top + m.bottom))
			.attr("transform", "translate(" + m.left + "," + m.top + ")")
			.on("mouseover", function() { 
				that.tooltip.style("display", null); 
				toolLine.style("stroke", null); 
				})
			.on("mouseout", function() { 
				that.tooltip.style("display", "none"); 
				toolLine.style("stroke", "none"); 
				})
			.on("mousemove", scalePointPosition);
		function correctFormat(string){
			var newString = string.replace(/M/i, ' M').replace(/G/i, ' B').replace(/T/i, ' T');
			return newString;
		}
		
		function scalePointPosition() {
			
			var tipText = [];
			var mouse = d3.mouse(this);
			
			var indexExtent = d3.max(data.map(d => d.length));
			
			var xPos =  xScale.invert(mouse[0]);
				
			var bisect = d3.bisector(d => +d[that.mapping.x_var]).left;
			
			//line tool tip text
							
			var values = data;
			var x_var = that.mapping.x_var;
			var y_var = that.mapping.y_var;
			
			var idx = bisect(values, xPos);
			
			var d0 = values[idx - 1];
			var d1 = values[idx];
			
			if(d0 == undefined | d1 == undefined){ return; }
			var v = xPos - d0[x_var] > d1[x_var] - xPos ? d1 : d0;
								
			var finalObject = {
				x_var: x_var,
				y_var: y_var,
				values: v
			}
			tipText.push(finalObject);
		
		if(tipText[0] != undefined){
			toolLine
			.style('stroke', 'black')
			.style('stroke-dasharray', '1,1')
			.attr('x1', xScale(tipText[0].values[tipText[0].x_var]))
			.attr('x2', xScale(tipText[0].values[tipText[0].x_var]))
			.attr('y1',0)
			.attr('y2', that.height - (m.top +m.bottom));
			
		that.tooltip
			.style('display', 'inline-block')
			.style('opacity', 1)
			.style("left", (d3.mouse(this)[0] > horizontalBreakPoint ? horizontalBreakPoint : (xScale(tipText[0].values[tipText[0].x_var])) )+ 'px')
			.style("top", Math.max(d3.mouse(this)[1] - 70, 0) + 'px');
			
		that.toolTipTitle
			.html('<span>' + tipText[0].x_var + ': ' + xFormat(tipText[0].values[tipText[0].x_var]) + '</span>'); 
		
		that.toolTipBody
			.html(function() {
				var y_text = []
				tipText.forEach(function(d){
					d.y_var.forEach(function(e){
						y_text.push('<strong>' + e + '</strong>: ' + correctFormat( yFormat(d.values[e]) ) + '</span><br>' );
					});
					
					});
				return y_text.join(' ')
			});
		}
		
		}
				
		
			
	}
	
	
}