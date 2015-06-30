define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	var wizard;
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/snapshot/list_vm.html',
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#SnapShotVmTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":'v2/' + current_vdc_id + '/volumes/', //ajax源，后端提供的分页接口
		      /*fnServerData是与服务器端交换数据时被调用的函数
		       * sSource： 就是sAjaxSource中指定的地址，接收数据的url需要拼装成 v2.0/users/page/10/1 格式
		       *      aoData[4].value为每页显示条数，aoData[3].value/aoData[4].value+1为请求的页码数
		       * aoData：请求参数，其中包含search 输入框中的值
		       * */
		      "fnServerData": function( sSource, aoData, fnCallback ) {
		    	    $.ajax( {   
		    	        "url": sSource + (aoData[3].value/aoData[4].value+1) +"/"+aoData[4].value, 
		    	        "data":aoData,
		    	        "dataType": "json",   
		    	        "success": function(resp) {
		    	        	/*渲染前预处理后端返回的数据为DataTables期望的格式,
		    	        	 * 后端返回数据格式 {"pageNo":1,"pageSize":5,"orderBy":null,"order":null,"autoCount":true,"result":[{"id":"07da487da17b4354a4b5d8e2b2e41485","name":"wzz"}],
		    	        	 * "totalCount":31,"first":1,"orderBySetted":false,"totalPages":7,"hasNext":true,"nextPage":2,"hasPre":false,"prePage":1}
		    	        	 * DataTables期望的格式 {"draw": 2,"recordsTotal": 11,"recordsFiltered": 11,"data": [{"id": 1,"firstName": "Troy"}]}
							*/
		    	        	resp.data = resp.result;
		    	        	resp.recordsTotal = resp.totalCount;
		    	        	resp.recordsFiltered = resp.totalCount;
		    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
		    	        }   
		    	    });   
		      },
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {	"data": "",
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": {}},
			        {"data": "size"},
			        {"data": "status"},
			        {"data": "volume_type"},
			        {"data": {}},
			        {"data": {}},
			        {"data": {}},
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
					},
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					      return '<a class="volume_name" href="#ccenter/snapshot/detail/vm/'+data.id+'">'+data.name+"</a>";
					    }
					},
					{
					    "targets": [2],
					    "data": "size",
					    "render": function(data, type, full) {
					      return data+"GB";
					    }
					},
					{
					    "targets": [3],
					    "data": "status",
					    "render": function(data, type, full) {
					    	if(data == "in-use"){
					    		return '<span class="text-success">使用中</span>';
					    	}else if(data == "available"){
					    		return '<span class="text-info">可用</span>';
					    	}else{
					    		return '<span class="text-danger">已删除</span>';
					    	}
					    }
					},
                     {
                       "targets": [5],
                       "render": function(data, type, full) {
                    	   if(data == "1"){
					    		return '<span class="text-success">是</span>';
					    	}else{
					    		return '<span class="text-danger">否</span>';
					    	}
                       }
                     },
                     {
                         "targets": [6],
                         "render": function(data, type, full) {
                      	   if(data == "1"){
  					    		return '<span class="text-success">是</span>';
  					    	}else{
  					    		return '<span class="text-danger">否</span>';
  					    	}
                         }
                       },
                       {
                           "targets": [7],
                           "render": function(data, type, full) {
                        	   if(data == "1"){
    					    		return '<span class="text-success">是</span>';
    					    	}else{
    					    		return '<span class="text-danger">否</span>';
    					    	}
                           }
                         },
                         {
                             "targets": [8],
                             "render": function(data, type, full) {
                          	   if(data == "1"){
      					    		return '<span class="text-success">是</span>';
      					    	}else{
      					    		return '<span class="text-danger">否</span>';
      					    	}
                             }
                           }
                ]
		    },
		    function($tar){
			//icheck
		    $('input[type="checkbox"]').iCheck({
		    	checkboxClass: "icheckbox-info",
		        radioClass: "iradio-info"
		    }).on('ifChecked',function(e){
		    	if(e.target.className == 'selectAll'){
		    		$('.table-primary').find('input[type=checkbox]').iCheck('check');
		    	}
		    }).on('ifUnchecked',function(e){
		    	if(e.target.className == 'selectAll'){
		    		$('.table-primary').find('input[type=checkbox]').iCheck('uncheck');
		    	}
		    });
		    Common.$pageContent.removeClass("loading");
		});
		
	    var moreAction = {
    		//删除
    		deleteVolume: function(){
    			Common.on('click','.dropdown-menu a.delete',function(){
    				var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id;
	       	    	 Modal.confirm('确定要删除该磁盘吗?', function(result){
	       	             if(result) {
	       	            	 Common.xhr.del("/v2/" + current_vdc_id + "/volumes/" + id, "",
	       	                     function(data){
	       	                    	 if(data){
	        	                			Modal.success('删除成功')
	        	                			setTimeout(function(){Modal.closeAll()},3000);
	       	                    		Common.router.route();
	       	                    	 }else{
	       	                    		Modal.success('删除失败')
	       	 	                		setTimeout(function(){Modal.closeAll()},3000);
	       	                    	 }
	       	                     });
	       	             }else {
	       	            	 //Modal.close();
	       	             }
	       	         });
	       		})
    		},
	    };
	    for(var key in moreAction){
	    	if(typeof moreAction[key] === 'function'){
	    		moreAction[key]();
	    	}
	    }
	};
	return {
		init : init
	}
})
