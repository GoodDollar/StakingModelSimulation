class dualChart{
	constructor(opts) {
		this.element = opts.element;
		this.height = opts.elementHeight;
		this.data = opts.data;
		this.mapping = opts.mapping;
		this.options = opts.options;
		this.margins = opts.margins;
		this.draw();
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
			.attr("class", "y-line axis");
		
		this.plot.append('g')
			.attr("class", "y-bar axis");
			
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
		const yExtents_line = [];
		const yExtents_bar = [];
		
		this.mapping.y_var_line.forEach(function(ly){
			const extent = d3.extent( data, d => +d[ly] );
			yExtents_line.push(extent);
		});
		
		this.mapping.y_var_bar.forEach(function(ly){
			const extent = d3.extent( data, d => +d[ly] );
			yExtents_bar.push(extent);
		});
		
		const y_line = [ 0, yExtents_line[0][1] ];
		const y_bar = [ 0, yExtents_bar[0][1] * 1.201 ];
		
		console.log(y_line);
		console.log(y_bar);

		const xFormat = d3.format(this.options.xAxisFormat);
		const yLineFormat = d3.format(this.options.yLineAxisFormat);
		const yBarFormat = d3.format(this.options.yBarAxisFormat);
		
		this.xScale = d3.scaleLinear()
					.range([0, this.width - (m.right + m.left)])
					.domain([0, 10.5]);
					
		this.yLineScale = d3.scaleLinear()
					.range([this.height - (m.top + m.bottom), 0])
					.domain(y_line);
					
		this.yBarScale = d3.scaleLinear()
					.range([this.height - (m.top + m.bottom), 0])
					.domain(y_bar);
					
		this.colorDiscrete = d3.scaleOrdinal()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
					
		this.svg.selectAll('.x.axis')
					.transition().ease(d3.easeQuad)
					.duration(transitionSpeed)
					.attr("transform", "translate(0," + (this.height-(m.top+m.bottom)) + ")")
						.call(d3.axisBottom(this.xScale)
								.ticks(5, xFormat)
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
								   (this.height - (m.top + 25) ) + ")")
				.style("text-anchor", "middle")
				.text(this.options.xAxisLabel)
		
		this.svg.selectAll('.y-line.axis')
			.transition().ease(d3.easeQuad)
			.duration(transitionSpeed)
			.call(d3.axisLeft(this.yLineScale)
				.ticks(5)
				.tickFormat( (d,i) => correctFormat( yLineFormat(d) ) )
				.tickSize( -(this.width-(m.right+m.left)) )
				)				
			.selectAll("text")
				.attr("dx", "-.25em");
				
		this.svg.selectAll('.y-bar.axis')
			.transition().ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr("transform", "translate( " + (this.width-(m.right+m.left)) + ", 0 )")
			.call(d3.axisRight(this.yBarScale)
				.ticks(5)
				.tickFormat( (d,i) => correctFormat( yBarFormat(d) ) )
				)				
			.selectAll("text")
				.attr("dx", "-.25em");
				
		this.addBar(data, this.mapping.y_var_bar);
		this.addLine(data, this.mapping.y_var_line);
		
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
		var horizontalBreakPoint = this.width* .70;

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
			
			var xPos =  that.xScale.invert(mouse[0]);
				
			var bisect = d3.bisector(d => +d[that.mapping.x_var]).left;
			
			//line tool tip text
							
			var values = data;
			var x_var = that.mapping.x_var;
			var y_var_line = that.mapping.y_var_line;
			var y_var_bar = that.mapping.y_var_bar;
			
			var idx = bisect(values, xPos);
			
			var d0 = values[idx - 1];
			var d1 = values[idx];
			
			if(d0 == undefined | d1 == undefined){ return; }
			var v = xPos - d0[x_var] > d1[x_var] - xPos ? d1 : d0;
								
			var finalObject = {
				x_var: x_var,
				y_var_line: y_var_line,
				y_var_bar: y_var_bar,
				values: v
			}
	
			tipText.push(finalObject);
		
			if(tipText[0] != undefined){
				toolLine
				.style('stroke', 'black')
				.style('stroke-dasharray', '1,1')
				.attr('x1', that.xScale(tipText[0].values[tipText[0].x_var]))
				.attr('x2', that.xScale(tipText[0].values[tipText[0].x_var]))
				.attr('y1',0)
				.attr('y2', that.height - (m.top +m.bottom));
				
			that.tooltip
				.style('display', 'inline-block')
				.style('opacity', 1)
				.style("left", (d3.mouse(this)[0] > horizontalBreakPoint ? horizontalBreakPoint : (that.xScale(tipText[0].values[tipText[0].x_var])) )+ 'px')
				.style("top", Math.max(d3.mouse(this)[1] - 70, 0) + 'px');
				
			that.toolTipTitle
				.html('<span>' + tipText[0].x_var + ': ' + xFormat(tipText[0].values[tipText[0].x_var]) + '</span>'); 
			
			that.toolTipBody
				.html(function() {
					var y_text = []
					tipText.forEach(function(d){
						console.log(d);
						d.y_var_line.forEach(function(e){
							y_text.push('<strong>' + e + '</strong>: ' + correctFormat( yLineFormat(d.values[e]) ) + '</span><br>' );
						});
						
						d.y_var_bar.forEach(function(e){
							y_text.push('<strong>' + e + '</strong>: ' + correctFormat( yBarFormat(d.values[e]) ) + '</span><br>' );
						});
						
						});
					return y_text.join(' ')
				});
			}
		}
	}
	
	addLine(data, y_var){
		var that = this;
		const transitionSpeed = this.options.transition.speed;
		
		const valueLine = d3.line()
				.curve(d3.curveMonotoneX)
				.x(d => this.xScale( d[ that.mapping.x_var ] ) )
				.y(d => this.yLineScale( d[ y_var[0] ] ) );
				
		const linePath = that.chart
			.selectAll( '.line-path' + y_var[0].replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
			.data([data]);
		
		//EXIT old elements not present in new data
		linePath.exit()
		  .transition().duration(transitionSpeed).style('opacity', 0)
			.remove();
		
		//ENTER new elements present in new data
		const newLinePath = linePath.enter().append("path")
			.attr("class", "line-path" + y_var[0].replace(/\s+/g, '-').replace(/\$/g, '').toLowerCase() ) 
			.attr("fill", "none")
			.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
			.style('stroke', d => this.colorDiscrete( y_var ) )
			.style("stroke-width", 3)
			.style('opacity', 0)
			.raise();
			
		//UPDATE old elements present in new data
		linePath.merge(newLinePath)	
		  .transition()
		  .ease(d3.easeQuad)
		  .duration(transitionSpeed)
			.style('opacity', 1)
			.style('stroke',d => this.colorDiscrete( y_var ) )
			.attr("d", valueLine);
		
	}
	
	addBar(data, y_var){
		var m = this.margins;
		var that = this;
		const transitionSpeed = this.options.transition.speed;
		
		var x_scale = this.xScale;
		var y_scale = this.yBarScale;
		var bandwidth = Math.min(100, (this.width - (m.right + m.left)) / data.length);
		console.log(data.slice(1,11));
		var bars = this.chart
			.selectAll('.tag-bar-' + this.element.id + '-'  + y_var[0].replace(/\s+/g, ''))
			//.selectAll('rect')
			.data(data.slice(1,11));
		
		bars.exit()
			.transition().duration(500).attr('y', y_scale(0))
			.remove();
		
		var newBars = bars.enter()
			.append('rect')
			.attr('class', 'tag-bar-' + this.element.id + '-'  + y_var[0].replace(/\s+/g, ''))
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('fill', this.colorDiscrete( y_var ) )
			.attr('x', d => x_scale(d[this.mapping.x_var]) - (bandwidth/2) )
			.attr('y', y_scale(0))
			.attr('width', (1 * bandwidth)-2)
			.attr('height', this.height -( m.top + m.bottom ));
			
		bars.merge(newBars)
			.transition()
			.ease(d3.easeQuad)
			.duration(1000)
			.attr('x', d => x_scale(d[this.mapping.x_var]) - (bandwidth/2) )
			.attr('y', function(d) { return that.yBarScale(d[y_var[0]]); })
			.attr('width', (1 * bandwidth)-2)
			.attr('height', function(d) { return (that.height -( m.top + m.bottom )) - that.yBarScale(d[ y_var[0] ]); });
	}
}