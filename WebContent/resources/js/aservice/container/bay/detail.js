define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var volume_id = hashArr[hashArr.length-1];
		var tmpDetailData = {"id":"1", "name":"k8s", "vdcId": "iop", "vdcName":"iop", "userId": "user1", 
		    	"baymodelId":"123123", "baymodelName":"k8s", "stackId":"heat-k8s1", 
		    	"nodeCount":10, "nodeAddresses": "10.68.25.25,10.68.25.26,10.68.25.27,10.68.25.28,10.68.25.29,10.68.25.30...",
		    	apiAddress: "https://10.68.25.24:5334",
		    	"status":"正常", "statusReason": "", "description":""};
    	Common.render(true,'tpls/aservice/container/bay/detail.html',tmpDetailData,function(html){
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
				Common.render(false,'tpls/aservice/container/bay/list_server.html','resources/data/aservice/container/servers.txt',function(html){
					$tab.empty().append(html);
				});
			}else if('monitor' == data){
				require(['echarts','echarts/chart/line'],function (ec) {
						Common.hideLocalLoading($tab);
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
			Common.hideLocalLoading($tab);
		}
		
	}
	return {
		init: init
	}
})
