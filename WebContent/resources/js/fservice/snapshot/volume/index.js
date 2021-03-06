define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/fservice/snapshot/list_volume.html',
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		var table = Common.initDataTable($('#SnapShotVolumeTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":'block-storage/v2/' + current_vdc_id + '/snapshots/', //ajax源，后端提供的分页接口
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {	"data": "",
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": {}},
			        {"data": "size"},
			        {"data": "status"},
			        {"data": "volumeTypeId"},
			        {"data": "volumeName"},
			        {"data": "virtualEnvId"},
			        {"data": "created_at"},
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
					},
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					      return '<a class="volume_name" href="#fservice/snapshot/volume/detail/'+data.id+'">'+data.name+"</a>";
					    }
					},
					{
					    "targets": [2],
					    "data": "size",
					    "render": function(data, type, full) {
					      return data ? (data+"GB") : '';
					    }
					},
					{
					    "targets": [3],
					    "data": "status",
					    "render": function(data, type, full) {
					    	if(data == "in-use"){
					    		return '<span class="text-success">使用中</span>';
					    	}else if(data == "available"){
					    		return '<span class="text-success">可用</span>';
					    	}else if(data == "creating"){
					    		return '<span class="text-info">正在创建</span>';
					    	}else if(data == "deleting"){
					    		return '<span class="text-danger">正在删除</span>';
					    	}else if(data == "error"){
					    		return '<span class="text-danger">错误</span>';
					    	}else if(data == "error_deleting"){
					    		return '<span class="text-info">删除错误</span>';
					    	}else if(data == "deleted"){
					    		return '<span class="text-danger">已删除</span>';
					    	}else{
					    		return '<span class="text-danger">未知</span>';
					    	}
					    }
					},
                     {
                         "targets": [9],
                         "render": function(data, type, full) {
                        	 var html = '<a href="javascript:void(0)" class="btn-opt createVolume"'+
                        		 'data-toggle="tooltip" title="创建磁盘"  data="'+data.id+'"><i class="fa fa-tasks"></i></a>'+
                        		 '<a href="javascript:void(0)" class="btn-opt delete"'+
                            		 'data-toggle="tooltip" title="删除快照"  data="'+data.id+'"><i class="fa fa-trash"></i></a>';
                        	 return html;
                         }
                       }
                ]
		    },
		    function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
		    	Common.$pageContent.removeClass("loading");
		});
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		
	    var moreAction = {
    		//删除
    		deleteVolume: function(){
    			Common.on('click','a.delete',function(){
    				var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id;
	       	    	 Modal.confirm('确定要删除该快照吗?', function(result){
	       	             if(result) {
	       	            	 Common.xhr.del("/block-storage/v2/" + current_vdc_id + "/snapshots/" + id, "",
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
    		}
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
