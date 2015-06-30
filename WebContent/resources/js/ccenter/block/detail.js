define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var volume_id = hashArr[hashArr.length-1];
		var tmpDetailData = {
	            name : "Tiger Nixon",
	            id: "di91jd9d29f9f29",
	            size:"20GB",
	            status: "in-use",
	            vm_id: "private",
	            type: "ceth(分布式)",
	            vdc_id : "vdc1",
	            available_zone: "WDK1",
	            read_only:"1",
	            description:"可用磁盘数据",
	            mount_list: [{
	            	name:'nexus-server',
	            	id: 'nexus-server'
	            }],
	            mount_path: '/opt/vdc',
	            create_time: '2015-04-24 17:14:57'
    	};
    	Common.render(true,'tpls/ccenter/block/volume/detail.html',tmpDetailData,function(html){
    		bindEvent();
    	});
	};
	function bindEvent(){
		Common.$pageContent.removeClass("loading");
		$('.detail-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				$('.detail-info .nav li').removeClass('active');
				$this.addClass('active');
				var data = $this.attr('data-for');
				$('.tab-content').find('.tab-pane').removeClass('active');
				renderTab(data);
			}
		});
		//异步渲染tab标签内容
		function renderTab(data){
			var $tab = $('.tab-content').find('div.'+data);
			$tab.addClass('active');
			Common.showLocalLoading($tab);
			if('snapshot' == data){
				//获取磁盘快照列表
				Common.render(false,'tpls/ccenter/block/volume/list_snapshot.html','/resources/data/volume.txt',function(html){
					$tab.empty().append(html);
				});
			}else if('monitor' == data){
				require(['echarts','echarts/chart/line'],function (ec) {
						Common.hideLoclLoading($tab);
	                    //--- 折柱 ---
	                    var myChart = ec.init($tab.find('.monitor-request-read')[0]);
	                    var options = {
	                    	    title : {
	                    	        text: '读请求'
	                    	    },
	                    	    tooltip : {
	                    	        trigger: 'axis'
	                    	    },
	                    	    legend: {
	                    	        data:['最高请求','最低请求']
	                    	    },
	                    	    toolbox: {
	                    	        show : true,
	                    	        feature : {
	                    	            mark : {show: true},
	                    	            dataView : {show: true, readOnly: false},
	                    	            magicType : {show: true, type: ['line', 'bar']},
	                    	            restore : {show: true},
	                    	            saveAsImage : {show: true}
	                    	        }
	                    	    },
	                    	    calculable : true,
	                    	    xAxis : [
	                    	        {
	                    	            type : 'category',
	                    	            boundaryGap : false,
	                    	            data : ['周一','周二','周三','周四','周五','周六','周日']
	                    	        }
	                    	    ],
	                    	    yAxis : [
	                    	        {
	                    	            type : 'value',
	                    	            axisLabel : {
	                    	                formatter: '{value} 次'
	                    	            }
	                    	        }
	                    	    ],
	                    	    series : [
	                    	        {
	                    	            name:'最高',
	                    	            type:'line',
	                    	            data:[11, 11, 15, 13, 12, 13, 10],
	                    	            markPoint : {
	                    	                data : [
	                    	                    {type : 'max', name: '最大值'},
	                    	                    {type : 'min', name: '最小值'}
	                    	                ]
	                    	            },
	                    	            markLine : {
	                    	                data : [
	                    	                    {type : 'average', name: '平均值'}
	                    	                ]
	                    	            }
	                    	        },
	                    	        {
	                    	            name:'最低',
	                    	            type:'line',
	                    	            data:[1, -2, 2, 5, 3, 2, 0],
	                    	            markPoint : {
	                    	                data : [
	                    	                    {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
	                    	                ]
	                    	            },
	                    	            markLine : {
	                    	                data : [
	                    	                    {type : 'average', name : '平均值'}
	                    	                ]
	                    	            }
	                    	        }
	                    	    ]
	                    	};
	                    myChart.setOption(options);
	                }
		        );
			}
			Common.hideLoclLoading($tab);
		}
		
	}
	return {
		init: init
	}
})
