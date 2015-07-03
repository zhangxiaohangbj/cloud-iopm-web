define(['Common','bs/modal','rq/text!tpls/fservice/block/volume/list-opts.html', 'jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal, optsTpl){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	
	var wizard;
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/aservice/container/bay/index.html',
			callback: bindEvent
		});
	};
	
	
	var bindEvent = function(){
		//dataTables
		
		var table = Common.initDataTable($('#bayTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":'resources/data/aservice/bay.txt?', //ajax源，后端提供的分页接口
		      /*fnServerData是与服务器端交换数据时被调用的函数
		       * sSource： 就是sAjaxSource中指定的地址，接收数据的url需要拼装成 v2.0/users/page/10/1 格式
		       *      aoData[4].value为每页显示条数，aoData[3].value/aoData[4].value+1为请求的页码数
		       * aoData：请求参数，其中包含search 输入框中的值
		       * */
		      "fnServerData": function( sSource, aoData, fnCallback ) {
		    	    $.ajax( {
		    	        "url": sSource, //+ (aoData[3].value/aoData[4].value+1) +"/"+aoData[4].value, 
		    	        "data":{},
		    	        "dataType": "json",   
		    	        "success": function(resp) {
		    	        	resp.data = resp.result;
		    	        	resp.recordsTotal = resp.totalCount;
		    	        	resp.recordsFiltered = resp.totalCount;
		    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
		    	        }   
		    	    });   
		      },
		      
//		      fields = {
//		    	        'id': fields.IntegerField(),
//		    	        'uuid': fields.UUIDField(nullable=True),
//		    	        'name': fields.StringField(nullable=True),
//		    	        'project_id': fields.StringField(nullable=True),
//		    	        'user_id': fields.StringField(nullable=True),
//		    	        'baymodel_id': fields.StringField(nullable=True),
//		    	        'stack_id': fields.StringField(nullable=True),
//		    	        # One of CREATE_IN_PROGRESS|CREATE_FAILED|CREATED
//		    	        #        UPDATE_IN_PROGRESS|UPDATE_FAILED|UPDATED
//		    	        #        DELETE_IN_PROGRESS|DELETE_FAILED|DELETED
//		    	        'status': fields.StringField(nullable=True),
//		    	        'status_reason': fields.StringField(nullable=True),
//		    	        'api_address': fields.StringField(nullable=True),
//		    	        'node_addresses': fields.ListOfStringsField(nullable=True),
//		    	        'node_count': fields.IntegerField(nullable=True),
//		    	        'discovery_url': fields.StringField(nullable=True),
//		    	    }
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {"data": ""},
			        {"data": "name"},
			        {"data": "vdcName"},
			        {"data": "baymodelName"},
			        {"data": "stackId"},
			        {"data": "status"}, 
			        {"data": "nodeCount"},
			        {"data": "description"},
			        {"data": {}}
			        
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
					}
//					,
//                   {
//                     "targets": [7],
//                     "data": "id",
//                     "render": function(data, type, full) {
//                    	 return Common.template(optsTpl, {
//  							opts:[
// 							      {title: "创建快照", clazz: "btn-opt"}
// 							],
// 							moreOpts:[
// 							    {title: "挂载到虚机", clazz: "edit_mount"},
// 							    {title: "从虚机卸载", clazz: "detach_mount"},
// 							    {title: "扩展容量", clazz: "extend_size"},
// 							    {title: "设置为只读", clazz: "make_rw"},
// 							    {title: "设置为读写", clazz: "make_r"},
// 							    {title: "备份", clazz: "backup"},
// 							    {title: "删除", clazz: "delete"}
// 							],
// 							data: data
// 							
// 						});
//                     }
//                   }
              ]
		    },
		    function($tar){
		    	
				Common.$pageContent.removeClass("loading");
		});
		
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global_filter').val()).draw();
		});
		
	};
	return {
		init : init
	}
})

