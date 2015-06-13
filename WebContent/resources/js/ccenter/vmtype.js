define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('/v2/123/flavors/detail', function(data){
            debugger;
            Common.render(true,'tpls/ccenter/vmtype/list.html',data,function(){
                bindEvent();

            });
        })

	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#vmtypeTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
				'<span class="btn btn-add">创建主机类型</span>'
				);
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-danger">删除主机类型</span>'
            );

			Common.$pageContent.removeClass("loading");
		});
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
	    var renderData = {};
        //初始化加载，不依赖其他模块
		var DataGetter = {
				//虚拟化环境 virtural environment
				getVe: function(){
					Common.xhr.ajax('/v2/virtual-env',function(veList){///v2/images
						renderData.veList = veList;
					});
				}

		}
		DataGetter.getVe();

	  //增加按钮
	    $("#vmtypeTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vmtype/add.html',renderData,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
    			//维护当前select的值
    			var currentChosenObj = {
    					ve: null,	//当前虚拟化环境
    					az: null,
    					netId: null
    			};
    			//载入默认的数据 inits,创建数据载入类
    			var DataIniter = {
    				//根据ve获取可用分区
    				initAz : function(){
    					var ve_id = currentChosenObj.ve.val() || $('select.select-ve').children('option:selected').val();
    					if(ve_id){
    						/*Common.xhr.ajax('/v2/'+vdc_id+'/os-availability-zone',function(data){
    							var selectData = [];
    							for(var i=0;i<data.length;i++){
    								selectData[i] = {"name":data[i]["zoneName"]};
    							}
    							var html = Common.uiSelect(selectData);
    					    	$('select.select-available-zone').html(html);
    					    	//同步currentChosenObj
    					    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
    						});*/
    						EventsHandler.azEvent();
    					}else{
    						Modal.danger('尚未选择所属虚拟化环境');
    					}
    				}
    			}
    			//载入后的事件
    			var EventsHandler = {
    					//虚拟化环境change事件
    					veChange: function(){
    						//同步
    						currentChosenObj.ve = $('select.select-ve').children('option:selected');
    						//重新载入可用分区数据
    						DataIniter.initAz();
    					},
    					//初始化可用分区所需的事件
    					azEvent: function(){
    						//滑过出现添加图标
    						$(document).off("mouseover mouseout",".chose-az a.list-group-item");
    						$(document).on("mouseover mouseout",".chose-az a.list-group-item",function(event){
    							if(event.type == "mouseover"){
    								$(this).find('.fa').show();
    							 }else if(event.type == "mouseout"){
    								 $(this).find('.fa').hide();
    							 }
    						});
    					}
    			}
				//同步currentChosenObj
		    	currentChosenObj.ve = $('select.select-ve').children('option:selected');
		    	currentChosenObj.netId = $('select.select-net').find('option:selected');
		    	//载入依赖数据
		    	DataIniter.initAz();
		    	//
    			wizard = $('#create-vdc-wizard').wizard({
    				keyboard : false,
    				contentHeight : 526,
    				contentWidth : 900,
    				showCancel: true,
    				backdrop: 'static',
    				buttons: {
    	                cancelText: "取消",
    	                nextText: "下一步",
    	                backText: "上一步",
    	                submitText: "提交",
    	                submittingText: "提交中..."
    	            }
    			});
    			wizard.show();
			});
	    });
	    
	    //更新配额
	    //$("ul.dropdown-menu a.updateFlavor").on("click",function(){
	    //	more.QuotaSets($(this).attr("data"));
	    //});
        $(".updateFlavor").on("click",function(){
            //alert($(this).attr("data")
	    	more.updateFlavor($(this).attr("data"));
	    });

        //更新配额
        $("ul.dropdown-menu a.removeFlavor").on("click",function(){
            more.deleteFlavor($(this).attr("data"));
        });
	    //更多
	    var more = {
		    	//配额管理
                updateFlavor : function(id){

		    		Common.xhr.ajax('/v2/123/flavors/'+id,function(data){
		    			Common.render('tpls/ccenter/vmtype/edit.html',data,function(html){
		    				Modal.show({
			    	            title: '编辑',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '保存',
			    	                action: function(dialog) {
			    	                	var flavorData = {
				    	            			"flavor":{
				    	        					"id": id,
				    	        					"name": $("#editFlavor [name='name']").val(),
				    	        					"vcpus": $("#editFlavor [name='vcpus']").val(),
				    	        					"ram": $("#editFlavor [name='ram']").val(),
				    	        					"disk": $("#editFlavor [name='disk']").val(),
				    	        					//"OS-FLV-EXT-DATA:ephemera": $("#editFlavor [name='ephemera']").val(),
				    	        					"swap": $("#editFlavor [name='swap']").val()
				    	            				}
			    	        				};
			    	                	Common.xhr.putJSON('/v2/123/flavors/',flavorData,function(data){
			    	                		if(data){
			    	                			alert("保存成功");
			    	                			
			    	                			dialog.close();
											}else{
												alert("保存失败");
											}
										})
			    	                }
			    	            }],
			    	            onshown : function(){}
			    	        });
			    		});
		    		})
		    		
		    	},

                deleteFlavor : function(id){
                    Modal.confirm('确定要删除该云主机类型吗?', function(result){
                        if(result) {
                            Common.xhr.del('/v2/123/flavors/'+id,
                                function(data){
                                    if(data){
                                        Modal.success('删除成功')
                                        setTimeout(function(){Dialog.closeAll()},2000);
                                        Common.router.route();//重新载入
                                    }else{
                                        Modal.warning ('删除失败')
                                    }
                                });
                        }else {
                            Modal.closeAll();
                        }
                    });

                }
	    }
	}	
	return {
		init : init
	}
})
