define(['Common','PubView','echarts', 'echarts/chart/pie', 'echarts/chart/funnel', 'echarts/chart/gauge', 'bs/tab'],function(Common,PubView, echarts){
	var init = function(){
		Common.$pageContent.removeClass('loading');
		Common.render(true, {
			tpl: 'tpls/index.html',
			data: {
				PubView: PubView
			},
			beforeRender: function(data) {
				return data;
			},
			callback: doRender
		});
	};
	var doRender = function(tplText, data) {
		var resetColWidth = function() {
			var $col1 = Common.$pageContent.find('.col-1:first'),
				$col2 = Common.$pageContent.find('.col-2:first'),
				$col3 = Common.$pageContent.find('.col-3:first'),
				$col23 = Common.$pageContent.find('.col-2-3:first');
			var col1W = $col1.outerWidth(), colWpx = col1W + 'px';
			$col1.css('width', colWpx);
			$col3.css('width', colWpx);
			$col2.css('margin-right', colWpx);
			$col23.css('margin-left', colWpx);
		};
		var chartResourcesOption = {
			title : {
				show: false,
				x:'center'
			},
			tooltip : {
				trigger: 'item',
				formatter: function() {
					var args = arguments[0];
					return args[0] + " <br/>" + args[1] + " : " + args[2] + " (" + parseFloat(args[3]).toFixed(0) + "%)";
				}
			},
			legend: {
				x : '15%',
				y : 'bottom',
				orient: 'vertical',
				data:['虚拟机','磁盘','网络','路由器','物理主机']
			},
			toolbox: {
				show : false
			},
			color: ['#1790cf', '#1bb2d8', '#99d2dd', '#88b0bb', '#1c7099'],
			calculable : true,
			series : [
				{
					name:'资源占用率',
					type:'pie',
					radius : [20, '62%'],
					center: ['50%', '38%'],
					roseType : 'radius',
					x: '50%',               // for funnel
					max: 40,                // for funnel
					sort : 'ascending',     // for funnel
					itemStyle : {
						normal : {
							label : {
								show : false
							},
							labelLine : {
								show : false
							}
						},
						emphasis : {
							label : {
								show : false
							},
							labelLine : {
								show : false
							}
						}
					},
					data:[
						{value:25, name:'虚拟机'},
						{value:20, name:'磁盘'},
						{value:35, name:'网络'},
						{value:30, name:'路由器'},
						{value:40, name:'物理主机'}
					]
				}
			]
		};
		var chartMonitorOption = {
			tooltip : {
				formatter: "{a} <br/>{b} : {c}%"
			},
			toolbox: {
				show : false
			},
			series : [
				{
					name:'告警与监控',
					type:'gauge',
					center : ['50%', '50%'],    // 默认全局居中
					radius : [0, '85%'],
					startAngle: 140,
					endAngle : -140,
					min: 0,                     // 最小值
					max: 100,                   // 最大值
					precision: 0,               // 小数精度，默认为0，无小数点
					splitNumber: 10,             // 分割段数，默认为5
					axisLine: {            // 坐标轴线
						show: true,        // 默认显示，属性show控制显示与否
						lineStyle: {       // 属性lineStyle控制线条样式
							color: [[0.2, '#faab02'],[0.4, '#6a5cac'],[0.8, '#2dc0e8'],[1, '#f51f03']],
							width: 20
						}
					},
					axisTick: {            // 坐标轴小标记
						show: true,        // 属性show控制显示与否，默认不显示
						splitNumber: 5,    // 每份split细分多少段
						length :6,         // 属性length控制线长
						lineStyle: {       // 属性lineStyle控制线条样式
							color: '#fff',
							width: 1,
							type: 'solid'
						}
					},
					axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
						show: true,
						formatter: function(v){
							switch (v+''){
								case '10': return '一般';
								case '30': return '次要';
								case '60': return '重要';
								case '90': return '紧急';
								default: return '';
							}
						},
						textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
							color: '#333'
						}
					},
					splitLine: {           // 分隔线
						show: true,        // 默认显示，属性show控制显示与否
						length :20,         // 属性length控制线长
						lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
							color: '#fff',
							width: 2,
							type: 'solid'
						}
					},
					pointer : {
						length : '80%',
						width : 8,
						color : 'auto'
					},
					title : {
						show : true,
						offsetCenter: ['-75%', -15],       // x, y，单位px
						textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
							color: '#333',
							fontSize : 15
						}
					},
					detail : {
						show : true,
						backgroundColor: 'rgba(0,0,0,0)',
						borderWidth: 0,
						borderColor: '#ccc',
						width: 100,
						height: 40,
						offsetCenter: ['-70%', 0],       // x, y，单位px
						formatter:'{value}%',
						textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
							color: 'auto',
							fontSize : 30
						}
					},
					data:[{value: 50, name: '告警与监控'}]
				}
			]
		};
		var chartResources, chartMonitor;
		setTimeout(function() {
			resetColWidth();

			chartResources = echarts.init($('#chart-resources')[0]);
			chartResources.setOption(chartResourcesOption);

			chartMonitor = echarts.init($('#chart-monitor')[0]);
			chartMonitor.setOption(chartMonitorOption);

			var timeTicket;
			clearInterval(timeTicket);
			timeTicket = setInterval(function (){
				chartMonitorOption.series[0].data[0].value = (Math.random()*100).toFixed(0) - 0;
				chartMonitor.setOption(chartMonitorOption, true);
			},2000)

			$(window).on('resize', function() {
				chartResources.resize();
				chartMonitor.resize();
			});
		}, 200);

		$('#services-tab').tab();
	};
	return {
		init : init
	};
});
