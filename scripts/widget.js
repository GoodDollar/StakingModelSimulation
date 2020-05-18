// widget.js constructs underlying JS logic to load UI, load data, and generate charts
// Block Science 2020

// assets
const helpButton = '<svg class="icon"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg>';

const tearDrop = '<svg width="45%" viewbox="0 0 30 42" transform="rotate(180)"> <path fill="#00AFFF" stroke="#00AFFF" stroke-width="1.5" d="M15 3 Q16.5 6.8 25 18 A12.8 12.8 0 1 1 5 18 Q13.5 6.8 15 3z" /> <text class="tearDrop" text-align="middle" startOffset="50%" font-size="7px" dy="-3.45em"  dx="-3.45em"transform="rotate(180)">text</text> </svg>'

function spelledOut(string){
	var newString = string.replace(/M/i, ' Million').replace(/G/i, ' Billion').replace(/T/i, ' Trillion').replace(/k/i, ' Thousand');
	return newString;
}
/* deprecated in third iteration
function showModal(modal){
	d3.select("#" + modal)
		.style('display', 'inline-block');
}

function removeModals(){
	d3.selectAll('.modal-box').style('display', 'none');
}
*/
// write layout
d3.select("#startHere")
	.append('div')
	.attr('class', 'logo-bar')
	.append('img')
	.attr('src', 'icons/logo.png')
	.attr('width', '100px')
	.style('margin-left', "10%")
	.style('margin-top', 'auto')
	.style('margin-bottom', 'auto');

const titleArea = d3.select("#startHere")
	.append('div')
	.attr('class','title-area');


const titleHeader = titleArea
	.append('div')
	.append('h1')
	.attr('class','title-header')
	.style('margin-left', '10%')
	.style('padding-top', '10px')
	.style('color', 'white')
	.html('GoodDollar | Economic Simulator');
	
const titleFooter = titleArea
	.append('div')
	.append('p')	
	.attr('class', 'title-footer')
	.style('margin-left', '10%')
	.html("Explore the impact the GoodDollar economic model can make");
	
const container = d3.select("#startHere")
	.append('div')
	.attr('class', 'container-xl')
	;


//////////////////////////////////////////////////
/* TOP LEVEL CONTAINER for UI and PREVIEW CHART */
//////////////////////////////////////////////////
const topDiv = container
	.append('div')
	.attr('class', 'container')
	.append('div')
	.attr('class', 'row')
	.style('margin-top', '10px');
	
const sliderDiv = topDiv
	.append('div')
	.attr('id', 'sliderDiv')
	.attr('class', 'col-sm-6')
	.style('height', '360px')
	.style('margin-top', '0px');
/*	
const sliderHeader = sliderDiv
	.append('div')
	
	//.attr('class', 'row')
	.style('min-height', '50px')
	.append('h5')
	.text("Assumptions");
*/
const sliderOpts = [
	{
		id:'balClmPt', 
		label: 'Value of UBI Claimed (USD)', 
		values: [0.1, 0.25, 0.5, 1, 1.5, 2, 2.5], 
		desc: 'The value of UBI claimed <strong>daily</strong> by each individual claimer in the economy.',
		format: '$.2f',
		selected: 2
	},
	{
		id:'initFund', 
		label: 'Total Capital Committed (USD)', 
		values: [1000000,5000000, 25000000,50000000,100000000, 1000000000], 
		desc: 'Total amount of funds committed to generate interest for GoodDollar, inclusive of all participating 3rd-party de-fi protocols.',
		format: '$.2s', 
		selected: 2
	}
];

const sliders = sliderDiv
	.selectAll(".row")
	.data(sliderOpts)
  .enter()
	.append('div')
	.attr('class', 'row')
	.attr('id', d => 'slider-input-' + d.id)
	.style('min-height', '49%')
	.style('margin-top', '0px')
	.style('margin-left', 'auto')
	.style('margin-right', 'auto')
	.style('margin-bottom', '5px');
	
const sliderBox = sliders
	.append('div')
	.attr('class', 'card-preview')
	.append('div')
	.attr('class', 'row')
	.style('padding', '5px');

const sliderTitle = sliderBox
	.append('div')
	.attr('class', 'col-5')
	.append('p')
	.style('font-size', '14px')
	.style('margin-left', '15px')
	.style('margin-top', 'auto')
	.style('margin-bottom', 'auto')
	.style('padding', '10px')
	.text( d => d.label )
	
var sliderSelection = sliderBox
	.append('div')
	.attr('class', 'col-3')
	.append('p')
	.attr('class', 'selected-value')
	.style('font-size', '16px')
	.style('margin-top', 'auto')
	.style('margin-bottom', 'auto')
	.style('padding', '10px')
	.text( d => d3.format(d.format)( d.values[d.selected] ).replace(/G/,"B") )
	
const sliderInputs = sliderBox
	.append('div')
	.attr('class', 'col-4')
	.append('div')
	.attr('class', 'sliderContainer')
	.style('margin-top', 'auto')
	.style('margin-bottom', 'auto')
	.style('padding', '10px');

sliderInputs
	.append('div')
	.attr('class', 'range-value')
	.attr('id', d => d.id + '-hover');

sliderInputs
	.append('input')
	.attr('id', d => d.id)
	.attr('type', 'range')
	.attr('class', 'slider')
	.attr('min', 0)
	.attr('max', d => d.values.length - 1 )
	.attr('value', 2)
	.on('mousemove', function(d){
		d3.select('#' + d.id + '-hover').style('display', 'inline-block');
		
		const currentInput = d3.select(this.parentNode.parentNode.parentNode).selectAll('.selected-value').data();
		currentInput.forEach(function(d){
				d.current = +d3.select('#' + d.id).property('value');
			});
		
		const range = document.getElementById(d.id),
		rangeV = document.getElementById(d.id + '-hover'),
		newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
		newPosition = 10 - (newValue * 0.2);
		
		rangeV.innerHTML = '<span>'+ d3.format(currentInput[0].format)(currentInput[0].values[ currentInput[0].current ] ).replace(/G/,"B") + '</span>';
		rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
	})
	.on('mouseout', function(d){
		d3.select('#' + d.id + '-hover').style('display', 'none');
	})
	.on('input', function(d){
		const changedValue = this.value;
		
		//update selected value
		d3.select(this.parentNode.parentNode.parentNode).selectAll('.selected-value')
			.text( d => d3.format(d.format)( d.values[changedValue] ).replace(/G/,"B") );
		
		const currentInput = d3.select(this.parentNode.parentNode.parentNode).selectAll('.selected-value').data();
		currentInput.forEach(function(d){
				d.current = +d3.select('#' + d.id).property('value');
			});
		d3.select('#' + d.id + '-hover').style('display', 'inline-block');	
		
		const range = document.getElementById(d.id),
		rangeV = document.getElementById(d.id + '-hover'),
		newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
		newPosition = 10 - (newValue * 0.2);
		
		rangeV.innerHTML = '<span>'+ d3.format(currentInput[0].format)(currentInput[0].values[ currentInput[0].current ] ).replace(/G/,"B") + '</span>';
		rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
	

		const updatePreviewData = sim_data.filter(function(d){
			const params = d.params[0];
			const sliderData = d3.selectAll(".selected-value").data();
			
			sliderData.forEach(function(d){
				d.current = +d3.select('#' + d.id).property('value');
			})
			
			const current_selections = sliderData.map(d => d.values[d.current]);

			return params['Total Capital Committed'] == current_selections[1] && params['Value of UBI Claimed'] == current_selections[0]
		})[0];	
		
		//update preview chart	
		previewChart.update(updatePreviewData.data);
		var storySelection = storyLines.filter(d => d.value == updatePreviewData.params[0]['Value of UBI Claimed'])[0];
		
		//update story elements	
		d3.select('#story-content').html( storyLines.filter(d => d.value == updatePreviewData.params[0]['Value of UBI Claimed'])[0].desc );
		
		d3.select('#story-icon').attr( 'src', storyLines.filter(d => d.value == updatePreviewData.params[0]['Value of UBI Claimed'])[0].icon );
		
		//update value boxes
		const valueBoxDataUpdate = updatePreviewData['data'][10];
		
		const updateValueBoxData = [
			[{ title: 'CLAIMERS', 
			   data: valueBoxDataUpdate['Total Claimers'],
			   format: '.2s',
			   desc: 'The aggregated number of all Claimers participating in the GoodDollar economy',
			   color: '#9F6A9D'	   }],
			[{ title: 'G$ IN CIRCULATION', 
			   data: valueBoxDataUpdate['Circulation Value'],
			   format: '$.2s',
			   desc: 'Total value of all transactions in G$ in the GoodDollar economy',
			   color: '#00AFFF'}],
			[{ title: 'U.B.I.', 
			   data: valueBoxDataUpdate['UBI In G$'],
			   format: '$.2s',
			   desc: 'Refers to the total value of UBI distributed to Claimers',
			   color: '#F8AF40'}]
		];
		
		const valueBoxSelections = d3.selectAll('.value-box-data').data(updateValueBoxData).html( d => spelledOut( d3.format(d[0].format )( d[0].data ) ) );
		
		//clear out results area
		d3.select("#results-area").selectAll('div').remove();
	});
	
	sliderBox
		.append('div')
		.style('margin-left', '40px')
		.style('margin-right', '20px')
		.style('font-size', '14px')
		.html(d => '<p>' + d.desc + '</p>');
	
	const storyLines = [
		{
			value: 0.1,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim every day for a week, pay 70 cents for ½ a bag of rice in India </li></ul>',
			icon: 'icons/001-wheat.png'
		},
		{
			value: 0.25,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;">  Claim for 3 days, pay 25 cents for 1 litre of gas in Guatemala </li></ul>',
			icon: 'icons/003-gas-station.png'
		},
		{
			value: 0.5,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim for 1 day, pay 50 cents for 1 GB of cell data in Rwanda </li></ul>',
			icon: 'icons/004-phone.png'
		},
		{
			value: 1,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim for 1 day, pay $1 for clean bottled water in Kenya</li></ul>',
			icon: 'icons/002-tap.png'
		},
		{
			value: 1.5,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim for 2 months, pay $90 for the EdX HarvardX online class for Computer Science </li></ul>',
			icon: 'icons/006-graduation-hat.png'
		},
		{
			value: 2,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim every day for 4 months, pay $250 for a Dell Inspiron Laptop</li></ul>',
			icon: 'icons/007-conference.png'
		},
		{
			value: 2.5,
			format: '$.2f',
			desc: '<ul><li style="color: #006EA0;"> Claim for 2 months, cover $140 in annual primary school fees in Ghana</li></ul>',
			icon: 'icons/008-book.png'
		}
	];
	
	const initialStory = storyLines[2];
	
	/*
	const storyCard = sliderDiv
		.append('div')
		.attr('id', 'story-card')
		.attr('class', 'row')
		.style('height', '129px')
		.style('margin-left', 'auto')
		.style('margin-right', 'auto')
		.style('margin-bottom', '10px');
		
	const storyCardBox = storyCard
		.append('div')
		.attr('class', 'card-preview')
		.style('padding', '5px');
	
	
	
	const storyHeader = storyCardBox
		.append('div')
		.attr('class', 'row')
		.append('div')
		.attr('class', 'col-12')
		.append('p')
		.attr('id', 'story-header')
		.style('font-size', '14px')
		.style('font-family', "Roboto', sans-serif")
		.style('margin-left', '20px')
		.style('margin-top', '0px')
		.style('margin-bottom', '0px')
		.style('padding-left', '10px')
		.style('padding-right', '10px')
		.style('padding-top', '10px')
		.style('padding-bottom', '0px')
		.text('G$ in USD ' + d3.format(initialStory.format)(initialStory.value));
	*/
	
	const storyCardBox = d3.select('#slider-input-balClmPt').select('.card-preview');
	const storyDiv = storyCardBox
		.append('div')
		.attr('class', 'row');
	
	const storyText = storyDiv
		.append('div')
		.attr('class', 'col-8')
		.append('p')
		.attr('id', 'story-content')
		.style('margin-top', '0px')
		.style('margin-left', '5px')
		.style('margin-right', '0px')
		.style('font-family', "Roboto', sans-serif")
		.style('font-size', '14px')
		.html( initialStory.desc );
		
	const storyIcon = storyDiv
		.append('div')
		.attr('class','col-2')
		.append('img')
		.attr('class', 'icon-png')
		.attr('id', 'story-icon')
		.attr('src', initialStory.icon);
		
	
///////////////////////////
/*  	Initial DATA	 */
///////////////////////////
const initData = sim_data.filter(function(d){
	const params = d.params[0];

	const sliders = d3.selectAll(".selected-value").data();
	const current_selections = sliders.map(d => d.values[d.selected]);

	return params['Total Capital Committed'] == current_selections[1] && params['Value of UBI Claimed'] == current_selections[0]
})[0].data;
	
const previewChartDiv = topDiv
	.append('div')
	.attr('class', 'col-sm-6')
	.style('height', '360px')
	.style('margin-top', '0px')
	.style('margin-left', 'auto')
	.style('margin-right', 'auto')
	.style('margin-bottom', '00px');

const previewChartHeader = previewChartDiv
	.append('div')
	.attr('class', 'container')
	.style('height', '360px')
	.append('div')
	.attr('class', 'row')
	.style('height', '358px')
	.append('div')
	.attr('class', 'chart-container');
	
const previewTitle = previewChartHeader
	.append('div')
	.attr('class', 'row');

previewTitle.append('div')
	.attr('class', 'col-12')
	.append('span')
	.style('margin-left', '15px')
	.html("Total Claimers per Year ");
	
	
const previewHelp = previewChartHeader
	.append('div')
	.attr('id', "totalClaimers");

previewHelp
	.append('div')
	.append('p')
	.style('margin-left', '15px')
	.style('padding-bottom', '0px')
	.style('font-size', '12px')
	//.style('font-style', 'italic')
	.html("The aggregated number of all Claimers participating in the GoodDollar economy");

const previewChartContainer = previewChartHeader	
	.append('div')
	.attr('class', 'container')
	.append('div')
	.attr('width', "100%")
	.attr('id', 'previewChart');

const previewDiv = document.getElementById('previewChart');

const previewOpts = {
		element: previewDiv,
		elementHeight: 285,
		data: initData,
		mapping: {
			x_var: "Year",
			y_var: ["Total Claimers"],
			group: "group"
		},
		options:{
			transition:{
				speed: 500
				},
			initDraw:"none",
			legend: "none",
			xAxisFormat: '.0f',
			yAxisFormat: '.2s',
			xAxisLabel: "YEAR",
			colorScheme:[
			['#00C3AE'], ['Total Claimers']
			]
		},
		margins:{
			top: 20,
			bottom:60,
			left:45,
			right:45
		}
		
	}	

const previewChart = new gdChart(previewOpts);
window.addEventListener('resize',() => previewChart.draw() );

//// value boxes ////

const valueBoxDiv = container
	.append('div')
	.attr('class', 'container')
	.attr('id', 'value-box-div')
	.style('margin-top', '15px')
	.style('min-height', "50px")
	.append('div')
	.attr('class', 'container');
//TODO: add color for header and number formats for body	
const initValueBoxData = [
	[{ title: 'CLAIMERS', 
	   data: initData[10]['Total Claimers'],
	   format: '.0s',
	   desc: 'The aggregated number of all Claimers participating in the GoodDollar economy',
	   color: '#9F6A9D'	   }],
	[{ title: 'G$ IN CIRCULATION', 
	   data: initData[10]['Circulation Value'],
	   format: '$.0s',
	   desc: 'Total value of all transactions in G$ in the GoodDollar economy',
	   color: '#00AFFF'}],
	[{ title: 'U.B.I.', 
	   data: initData[10]['UBI In G$'],
	   format: '$.0s',
	   desc: 'Refers to the total value of UBI distributed to Claimers',
	   color: '#F8AF40'}]
];

const valueBoxes = valueBoxDiv
	.append('div')
	.attr('class', 'row')
	.selectAll('div')
	.data(initValueBoxData)
	.enter()
	.append('div')
	.attr('class', 'col-sm-3 value-box')
	.style('margin-bottom', '5px');
	
const valueBoxHeader =  valueBoxes
	.append('div')
	.attr('class', 'row')
	.style('background-color', d => d[0].color )
	.append('p')
	.style('color', 'white')
	.style('font-size', '18px')
	.style('margin-left', '5%')
	.style('margin-right', '5%')
	.style('margin-top', 'auto')
	.style('margin-bottom', 'auto')
	.html(d => d[0].title);
	
const valueBoxData =  valueBoxes
	.append('div')
	.attr('class', 'row')
	.append('p')
	.attr('class', 'value-box-data')
	.style('margin-left', '5%')
	.style('margin-right', '5%')
	.style('font-size', '24px') 
	.html(d => spelledOut( d3.format(d[0].format)(d[0].data) ) );
	
const valueBoxDesc =  valueBoxes
	.append('div')
	.attr('class', 'row')
	.append('p')
	.style('margin-left', '5%')
	.style('margin-right', '5%')
	.html(d => d[0].desc);

//////////////////////////////////////////////////
/* Mid LEVEL CONTAINER for BUTTON */
//////////////////////////////////////////////////

const midDiv = container
	.append('div')
	.attr('class', 'container')
	.style('margin-top', "15px")
	.append('div')
	.attr('class', 'row');
	
const runSim = midDiv
	.append('input')
	.attr('type', 'button')
	.attr('class', 'button')
	.attr('id', 'submit')
	.attr('value', 'See full results')
	.style('margin-left', 'auto')
	.style('margin-right', 'auto')
	.style('position', 'relative')
	.style('width', '200px');
	
	
d3.select('#submit')
		.on('click', buildResults);

///////////////////////////////////////
/* Bottom LEVEL CONTAINER for BUTTON */
///////////////////////////////////////
container.append('br').attr('class', 'wtf');
const bottomDiv = container
	.append('div')
	.attr('class', 'container')
	.style('margin-top', '10px')
	.append('div')
	.attr('class', 'col-xl-12')
	.append('div')
	.attr('class', 'row');

const resultsBackground = bottomDiv
	.append('div')
	.attr('id', 'results-area')
	.style('width', '100%');
	

function buildResults(){
	d3.select('#results-area').selectAll('div').remove();
	
	const resultsData = sim_data.filter(function(d){
			const params = d.params[0];
			
			const sliderData = d3.selectAll(".selected-value").data();
			
			sliderData.forEach(function(d){
				d.current = +d3.select('#' + d.id).property('value');
			})
			
			const current_selections = sliderData.map(d => d.values[d.current]);
			
			return params['Total Capital Committed'] == current_selections[1] && params['Value of UBI Claimed'] == current_selections[0]
		})[0].data;	
	
	const resultsArea = d3.select("#results-area");
	
	/////// Chart Area ///////
	const resultsChartArea = resultsArea;
	
	const resultsDiv = resultsArea
		.append('div')
		.attr('class', 'col-sm-12');
		
	const chartRowOne = resultsChartArea
		.append('div')
		.attr('id', 'chartRowOne')
		.attr('class', 'row');
	
	///////////////////////////////////////////
	/* 			Price Chart 				 */
	///////////////////////////////////////////
	const volumeDiv = chartRowOne
		.append('div')
		.attr('class', 'col-sm-6');
		
	const valueCard = volumeDiv
		.append('div')
		.attr('class', 'chart-container')
		.style('margin-top', '5px');
		
	const volumeTitle = valueCard	
		.append('div')
		.attr('id', 'volume-title')
		.attr('class', 'row');

	volumeTitle
		.append('div')
		.attr('class', 'col-12')
		.append('span')
		.html("Total Circulation of G$ Coins")
		.style('margin-left', '15px');
	
	valueCard
		.append('div')
		.append('p')
		.style('margin-left', '15px')
		.style('padding-bottom', '0px')
		.style('font-size', '12px')
		.html("Total value in USD of all daily transactions in G$ in the GoodDollar economy");
	
	const volumeChartContainer = valueCard
		.append('div')
		.attr('class', 'container')
		.append('div')
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('id', 'volumeChart')
		;
	
	const volumeChartDiv = document.getElementById('volumeChart');
	
	const volumeOpts = {
		element: volumeChartDiv,
		elementHeight: 315,
		data: resultsData,
		mapping: {
			x_var: "Year",
			y_var: ["Circulation Value"],
			group: "group"
		},
		options:{
			transition:{
				speed: 0
				},
			initDraw:"l2r",
			legend: "none",
			xAxisFormat: '.0f',
			yAxisFormat: '$.2s',
			xAxisLabel: "Year",
			colorScheme:[
			['#006EA0'], ['Circulation Value']
			]
		},
		margins:{
			top: 20,
			bottom:100,
			left:65,
			right:60
		}
	}
	
	const volumneChart = new gdChart(volumeOpts);
	window.addEventListener('resize',() => volumneChart.draw() );
	
	
	///////////////////////////////////////////
	/* 			Price Chart 				 */
	///////////////////////////////////////////
	const priceDiv = chartRowOne
		.append('div')
		.attr('class', 'col-sm-6');
		
	const priceCard = priceDiv
		.append('div')
		.attr('class', 'chart-container')
		.style('margin-top', '5px');
		
	const priceTitle = priceCard	
		.append('div')
		.attr('id', 'volume-title')
		.attr('class', 'row');

	priceTitle
		.append('div')
		.attr('class', 'col-12')
		.append('span')
		.html("UBI Accumulated in G$ & G$ Redeemed")
		.style('margin-left', '15px');
	
	priceCard
		.append('div')
		.append('p')
		.style('margin-left', '15px')
		.style('padding-bottom', '0px')
		.style('font-size', '12px')
		.html("<strong>UBI in G$</strong> refers to the total value of UBI distributed to Claimers.<br> <strong>G$ Redeemed</strong> refers to the total value of UBI distributed that was then converted from G$ into a foreign currency. ");
		
	const priceChartContainer = priceCard
		.append('div')
		.attr('class', 'container')
		.append('div')
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('id', 'priceChart');
	
	const priceChartDiv = document.getElementById('priceChart');
	
	const priceOpts = {
		element: priceChartDiv,
		elementHeight: Math.min(280, priceChartDiv.offsetWidth),
		data: resultsData,
		mapping: {
			x_var: "Year",
			y_var: ["UBI In G$", 'G$ Redeemed'],
			group: "group"
		},
		options:{
			transition:{
				speed: 0
				},
			initDraw:"l2r",
			legend: "bottom",
			xAxisFormat: '.0f',
			yAxisFormat: '$.2s',
			xAxisLabel: "Year",
			colorScheme:[
			[ "#F8AF40",'#9F6A9D'],
			["UBI in G$",'G$ Redeemed']
			]
		},
		margins:{
			top: 20,
			bottom:100,
			left:65,
			right:60
		}
	}
	
	const priceChart = new gdChart(priceOpts);
	window.addEventListener('resize',() => priceChart.draw() );

	///////////////////////////////////////////
	/* 			Redeemed Chart 				 */
	///////////////////////////////////////////
	const redeemDiv = chartRowOne
		.append('div')
		.attr('class', 'col-sm-6');
		
	const redeemCard = redeemDiv
		.append('div')
		.attr('id', 'redeemChartDiv')
		.attr('class', 'chart-container')
		.style('margin-top', '5px');
		
	const redeemTitle = redeemCard	
		.append('div')
		.attr('id', 'volume-title')
		.attr('class', 'row');

	redeemTitle
		.append('div')
		.attr('class', 'col-12')
		.append('span')
		.html("Daily Interest Created & Reserve Ratio")
		.style('margin-left', '15px');
	
	redeemCard
		.append('div')
		.append('p')
		.style('margin-left', '15px')
		.style('margin-right', '15px')
		.style('padding', '0px')
		.style('font-size', '12px')
		.html("<strong>Daily interest</strong> refers to the daily amount of interest generated across all 3rd party de-fi protocols that is deposited in the GoodReserve.<br><strong>Reserve ratio</strong> refers to the ratio between the value of assets in the GoodReserve and the value of G$ market capitalization.");
		
	const redeemChartContainer = redeemCard
		.append('div')
		.attr('class', 'container')
		.append('div')
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('id', 'redeemChart');
	
	const redeemChartDiv = document.getElementById('redeemChart');
	
	const redeemOpts = {
		element: redeemChartDiv,
		elementHeight: Math.min(280, redeemChartDiv.offsetWidth),
		data: resultsData,
		mapping: {
			x_var: "Year",
			y_var_line: ["Reserve Ratio"],
			y_var_bar: ["Daily Interest"],
			group: "group"
		},
		options:{
			transition:{
				speed: 0
				},
			initDraw:"l2r",
			xAxisFormat: '.0f',
			yLineAxisFormat: '.1%',
			yBarAxisFormat: '$.2s',
			xAxisLabel: "Year",
			colorScheme:[
			[ "#FA6C77", "#006EA0"],
			["Reserve Ratio", "Daily Interest"]
			]
		},
		margins:{
			top: 20,
			bottom:60,
			left:60,
			right:60
		}
	}
	
	const redeemChart = new dualChart(redeemOpts);
	window.addEventListener('resize',() => redeemChart.draw() );
	
	///////////////////////////////////////////
	/* 			Results Table 				 */
	///////////////////////////////////////////	
	const resultsCard = resultsDiv
		.append('div')
		;
		
	const tableData = resultsData.filter( (d,i) => [1,2,3,5,10].indexOf(i) > -1);
	
	makeTable(tableData);
	
	function makeTable(data){
		
		const rowNames = ['Result'].concat(data.map( d => 'Year ' + d.Year ));

		const columnInfo = [
			{header: 'Circulation Value',
			 color: '#9F6A9D0D',
			 data: data.map( d => d3.format('$.2s')(d['Circulation Value']).replace('G', 'B') ),
			 format: '.2s'
			 },
			{header: 'G$ Redeemed',
			 color: '#00AFFF0D',
			 data: data.map( d => d3.format('$.2s')(d['G$ Redeemed']).replace('G', 'B') ),
			 format: '$.2s'
			},
			{header: 'UBI In G$',
			 color: '#FA6C770D',
			 data: data.map( d => d3.format('$.2s')(d['UBI In G$']).replace('G', 'B') ),
			 format: '$.2s'
			}, 
			{header: 'Reserve Ratio',
			 color: '#00C3AE0D',
			 data: data.map( d => d3.format('.1%')(d['Reserve Ratio']) ),
			 format: '.1%'
			}, 
			{header: 'Daily Interest',
			 color: '#F8AF400D',
			 data: data.map( d => d3.format('$.2s')(d['Daily Interest']).replace('G', 'B') ),
			 format: '$.2s'
			}   
			];
		const table = resultsCard
			.append('div')
			.attr('class', 'row')
			.append('div')
			.attr('class', 'table-div');
		
		const rowBackground = table
			.selectAll('.table-rows')
			.data(rowNames)
			.enter()
			.append('div')
			.attr('class', 'table-rows')
			.append('p')
			.attr('class', 'table-rows-text')
			.text(d => d);
			
		const columnCards = table
			.selectAll('.col-sm-2')
			.data(columnInfo)
			.enter()
			.append('div')
			.attr('class', 'col-sm-2')
			.attr('id', d => d.color)
			.style('position', (d,i) => d3.select("body").node().getBoundingClientRect().width > 700 || i ==0 ? 'absolute': 'relative' )
			.style('top', 0)
			.style('left', (d,i) =>  d3.select("body").node().getBoundingClientRect().width > 700 ? 6 + (i * 19) + '%' : '0%' )
			.style('padding', '0px')
			.append('div')
			.attr('class', 'column-cards');
			
		const columnHeaders = columnCards
			.append('div')
			.attr('class', 'row column-header')
			.style('margin-right', '0px')
			.style('margin-left', '0px')
			.style( 'background-color', d => d.color )
			.append('p')
			.style('padding', '0px')
			.style('margin-top', '10px')
			.style('margin-bottom', '10px')
			.style('margin-left', 'auto')
			.style('margin-right', 'auto')
			.style('font-weight', '900')
			.text(d => d.header);
			
		const columnData =  columnCards
			.selectAll('.column-data')
			.data( d => d.data )
			.enter()
			.append('div')
			.attr('class', 'row column-data')
			.style('height', '41px')
			.style('margin-right', '0px')
			.style('margin-left', '0px')
			.append('p')
			.style('padding', '0px')
			.style('margin-top', 'auto')
			.style('margin-bottom', 'auto')
			.style('margin-left', 'auto')
			.style('margin-right', 'auto')
			.style('color', (d,i) => i < 4 ? 'lightgray' : 'black' )
			.text(d => d );
			
		columnCards.each(function(){		
			var cardDiv = d3.select(this);
			
			console.log(cardDiv.selectAll('.column-header').style('background-color'));
			
			cardDiv
				.selectAll('.column-data')
				.style('background-color', (d,i) => i < 4 ? "white" : cardDiv.select('.column-header').style('background-color') )
		});
		
		/*( d => d3.select(this).selectAll('.column-data').attr('background-color', (d,i) => i < 4 ? "white" : d3.select(this).select('.column-header').attr('background-color') ) );*/
	
	/*
	const table = resultsCard
		.append('table'),
		thead = table.append('thead'),
		tbody = table.append('tbody');
		
		
	thead
		.selectAll('.column-names')
		.data(columnNames)
		.enter()
		.append('th')
		.html(d => d);
		
	const rows = tbody.selectAll('.row-values')
		.data(rowNames)
		.enter()
		.append('tr');
		
	const cells = rows.selectAll('td')
		.data( function(d){
			var data = tableData.map(function(e){
				return d3.format('$,.2s')(e[d]).replace('G', 'B'); 
			});		
			return [d + helpButton].concat(data);
		})
		.enter()
		.append('td')
		.html( d => d );
		
	cells.selectAll('.icon')
		.on('click', showTableModal);
		
	const tableHelp = resultsCard
		.append('div')
		.attr('class', 'modal-box')
		.style('left', '20px')
		.style('top', '0px')
		.attr('id', "tableModal");

		
	function showTableModal(){
		const tableHelp = d3.select("#tableModal")
			.style('display', 'inline-block');
			
		tableHelp.selectAll('div').remove();
		
		const titleText = d3.select(this).node().parentNode.firstChild.nodeValue;
		
		const descText = [
			{
				title: 'Daily Interest',
				desc: 'Daily amount of interest generated across all 3rd party de-fi protocols that is deposited in the GoodReserve.',
				topPosition: -60
			},
			{
				title: 'G$ Redeemed',
				desc: 'Total value of UBI distributed that was then converted from G$ into a foreign currency.',
				topPosition: 10
			},
			{
				title: 'Circulation Value',
				desc: 'Total value of all transactions in G$ in the GoodDollar economy. ',
				topPosition: 80
			},
			{
				title: 'UBI In G$',
				desc: 'Total value of UBI distributed to Claimers.'
				,
				topPosition: 150
			}
		];
		
		const finalDescText = descText.filter( function(d){
			return d.title == titleText;
			
		} );
		
		tableHelp
			.style('top', finalDescText[0].topPosition + 'px' );
			
		tableHelp
			.append('div')
			.append('span')
			.attr('class', 'close-button topright')
			.html('&times;')
			.on('click', removeModals);
			
		tableHelp
			.append('div')
			.append('hz')
			.style('margin-left', '15px')
			.style('margin-top', '10px')
			.style('padding', '3px')
			.html("<strong>"+ finalDescText[0].title + "</strong>");
		tableHelp
			.append('div')
			.append('p')
			.style('margin-left', '15px')
			.style('padding', '3px')
			.style('font-style', 'italic')
			.html( finalDescText[0].desc );
		}
		*/
	}
	
	
	
}
const assumptionItems = [
	{
		desc:'Interest Rate = 5%',
		nested: '<ul><li>The interest generation on the Total Capital Committed is 5% annually </li></ul>'
	},
	{
		desc:'External Demand = 500%',
		nested: '<ul><li>500% of the value in the GoodReserve comes from direct purchasing of G$ coins </li></ul>'
	},
	{
		desc:'Redeem Ratio = 30%',
		nested: '<ul><li>30% of the G$ minted from the GoodReserve are converted into another currency </li></ul>'
	},
	{
		desc:'Circulation Rate = 0.5%',
		nested: '<ul><li>0.5% of total G$ coin market capitalization is circulating daily </li></ul>'
	}
]

const assumptions = d3.select("#startHere")
	.append('div')
	.attr('class', 'container')
	.attr('id', 'assumptions')
	.append('div')
	.attr('class', 'container')
	.style('width', '60%')
	.style('margin-left', 'auto')
	.style('margin-right', 'auto')
	.style('margin-top', '10px');

assumptions
	.append('p')
	.style('font-style', 'italic')
	.html('<strong>This simulation runs with the following assumptions:</strong>')

assumptions
	.append('ul')
	.style('font-style', 'italic');
	
assumptions.selectAll('ls')
	.data(assumptionItems)
	.enter()
	.append('li')
	.style('font-style', 'italic')
	.html(d => d.desc + d.nested);

d3.select("#startHere").append('div').attr('id', 'footer').style('margin-top', '10px');
