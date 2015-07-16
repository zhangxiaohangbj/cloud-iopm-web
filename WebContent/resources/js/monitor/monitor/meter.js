define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('monitor/v2/meters/list', function(data){
            var render_data = {}
            render_data['meters'] = data
           Common.render(true,'tpls/monitor/monitor/meter/meter.html',render_data,function(){
                bindEvent();
            });
        })

	};
    var renderData = {}
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#meterTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
				'<span class="btn btn-add">创建监控指标</span>'
				);
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-danger">删除监控指标</span>'
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

        //初始化加载，不依赖其他模块
        var wizard;

		var DataGetter = {
            getResourceType: function(){
                Common.xhr.ajax('/resources/data/resourceType.txt',function(typeList){///v2/images
                    renderData.resourceTypes = typeList;
                });
            },

            getMeterList: function(){
                Common.xhr.ajax('monitor/v2/meters/list', function(data){
                    renderData['meters'] = data;
                })

            }
		}

        DataGetter.getResourceType()
        DataGetter.getMeterList()





	  //增加按钮
        $("#meterTable_wrapper span.btn-add").on("click",function(){
            //需要修改为真实数据源
            Common.render('tpls/monitor/monitor/meter/addMeter.html',renderData,function(html){

                $('body').append(html);
                //wizard show
                $.fn.wizard.logging = true;
                wizard = $('#create-meter-wizard').wizard({
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

                //展现wizard，禁用下一步按钮
                wizard.show();
                //wizard.disableNextButton();


                EventsHandler.meterFormValidator();
                //关闭弹窗
                var closeWizard = function(){
                    $('div.wizard').remove();
                    $('div.modal-backdrop').remove();

                }

                //关闭后移出dom
                wizard.on('closed', function() {
                    closeWizard();
                });

                wizard.on("submit", function(wizard) {
                    var meterData = {
                            "name": $("#addMeter [name='name']").val(),
                            "type": $("#addMeter [name='type']").val(),
                            "unit": $("#addMeter [name='unit']").val(),
                            "resourceTypeId": $("#addMeter [name='resource_type']").val()
                    };

                    Common.xhr.postJSON('/monitor/v2/meters/',meterData,function(data){
                        if(data){
                            wizard.updateProgressBar(100);
                            closeWizard();
                            Common.router.route();
                        }
                        else{
                            alert("保存失败");
                            closeWizard();
                            Common.router.route();
                        }

                    })
                });
            })
        });


        var EventsHandler = {
            meterFormValidator: function(){
                return $(".form-horizontal").validate({
                    rules: {
                        'name': {
                            required: true,
                            minlength: 1,
                            maxlength: 15
                        },
                        'unit': {
                            required: true,
                            minlength: 2,
                            maxlength: 15
                        }

                    }
                });
            }
        }


        $(".updateMeter").on("click",function(){
            more.updateMeter($(this).attr("data"));
	    });


        $("ul.dropdown-menu a.removeMeter").on("click",function(){
            more.deleteMeter($(this).attr("data"));
        });

	    //更多
	    var more = {
		    	//更新flavor
                updateMeter : function(id){
                    var data = {}
                    var meters = renderData['meters']
                    for(var i=0; i<meters.length; i++){
                        if(meters[i]['id']==id)
                            data['meter'] = meters[i]
                    }
                    data['resourceTypes'] = renderData['resourceTypes']
		    		Common.render('tpls/monitor/monitor/meter/editMeter.html',data,function(html){
		    			Modal.show({
			    	            title: '编辑',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '保存',
			    	                action: function(dialog) {
			    	                	var meterData = {
                                            "id": id,
                                            "name": $("#editMeter [name='name']").val(),
                                            "type": $("#editMeter [name='type']").val(),
                                            "unit": $("#editMeter [name='unit']").val(),
                                            "resourceTypeId": $("#editMeter [name='resource_type']").val()
			    	        			};
                                        debugger
			    	                	Common.xhr.putJSON('/monitor/v2/meters/',meterData,function(data){
			    	                		if(data){
			    	                			alert("保存成功");
			    	                			dialog.close();
											}else{
												alert("保存失败");
											}
										})
			    	                }
			    	            }],
			    	            onshown : function(){

                                }
			    	    });
			    	});

		    		
		    	},

            deleteMeter : function(id){
                    Modal.confirm('确定要删除该云主机吗?', function(result){
                        if(result) {
                            Common.xhr.del('/monitor/v2/meters/'+id,
                                function(data){
                                    if(data){
                                        Modal.success('删除成功')
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
