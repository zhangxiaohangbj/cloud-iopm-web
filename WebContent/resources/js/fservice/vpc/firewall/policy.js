define('js/fservice/vpc/firewall/policy', ['Common','bs/modal','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog){
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#PolicyTable'),{
			"processing": true,  //加载效果，默认false
			"serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
			"ordering": false,   //禁用所有排序
			"sAjaxSource":"networking/v2.0/fw/firewall_policies/page/", //ajax源，后端提供的分页接口
			/*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
			"columns": [
				        {"orderable": false,"defaultContent":"<label><input type='checkbox'></label>"},
				        {"data": "name"},
				        {"data": "firewall_rules"},
				        {"data": "audited"},
				        {"data":""}
				        ],
			  /*
			   * columnDefs 属性操作自定义列
			   * targets ： 表示具体需要操作的目标列，下标从 0 开始
			   * data: 表示我们需要的某一列数据对应的属性名
			   * render: 返回需要显示的内容。在此我们可以修改列中样式，增加具体内容
			   *  属性列表： data，之前属性定义中对应的属性值； type，未知；full,全部数据值可以通过属性列名获取 
			   * */
			"columnDefs": [
                 {
                	 "targets": [0],
                	 "orderable": false,
                	 "render": function() {
                		 return "<label><input type='checkbox'></label>";
                	 }
                 },
                 {
                	 "targets":[1],
                	 "render":function(data, type, full){
                		 return "<a href='javascript:void(0);' class='policy-name'>"+data+"</a>";
                	 }
                 },
                 {
                	 "targets":[2],
                	 "render":function(data, type, full){
                		 var dataStr = "";
                		 for(var i = 0; i < data.length-1; i++){
                			 dataStr = dataStr + data[i] + ","
                		 }
                		 if(data.length > 0){
                			 dataStr = dataStr + data[data.length-1];
                		 }
                		 return dataStr;
                	 }
                 },
                 {
                	 "targets":[3],
                	 "render":function(data, type, full){
                		 if(data == true){
                			 return "已审核";
                		 }else {
                			 return "未审核";
                		 }
                	 }
                 },
                 {
                	 "targets": [4],
                	 "data" :"id",
                	 "render": function(data, type, full) {
                		 var html = '<a class="editPolicy" data-toggle="tooltip" title="编辑策略" href="javascript:void(0)">编辑策略</a>';
                		 html += '<div class="dropdown">'
                			 +'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多" aria-expanded="false"><li class="fa fa-angle-double-right"></li></a>'
                			 +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
                			 +'<li><a href="javascript:void(0)" class="addRule" data="{{item.id}}"><i class="fa fa-pencil fa-fw"></i>插入规则</a></li>'
                			 +'<li><a href="javascript:void(0)" class="deleteRule" data="{{item.id}}"><i class="fa fa-pencil fa-fw"></i>移除规则</a></li>'
                			 +'<li><a href="javascript:void(0)" class="deletePolicy" data="{{item.id}}"><i class="fa fa-trash-o fa-fw"></i>删除策略</a></li>'
                			 +'</ul></div>';
                		 return html;
                	 }
                 }
                 ]
			},
			function($tar){
				$tar.prev().find('.left-col:first').append('<span class="btn btn-add">创建策略</span>');
				var $tab = $('.tab-content').find('div.policy');
				Common.hideLocalLoading($tab);
			}
		);
		
		
	}
	return{
		bindEvent: bindEvent
	}
})