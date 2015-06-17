define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('/v2/123/flavors/detail', function(data){
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
        var wizard;

		var DataGetter = {
				//虚拟化环境 virtural environment
			getVdc: function(){
				Common.xhr.ajax('/v2.0/tenants/page/10/1',function(pageVdcList){///v2/images
                    var vdcList = pageVdcList.result;
                    renderData.vdcList = vdcList;
                    require(['js/common/choose'],function(choose){
                        var options = {
                            selector: '#flavorVdcAccess',
                            list: vdcList
                        };
                        choose.initChoose(options);
                    })

				});
			},

            getFlavorAccess: function(id){
                Common.xhr.ajax('/v2/123/flavors/'+id+"/os-flavor-access",function(pageVdcList){///v2/images
                    var vdcList = pageVdcList.result;
                    renderData.vdcList = vdcList;
                    debugger
                    $("#flavorVdcAccess").find(".list-group-all").empty();
                    var listView=[];
                    for(var i=0;i<vdcList.length;i++){
                        listView.push('<a href="javascript:void(0);" class="list-group-item">'+vdcList[i]["name"]+' <i data-id = '+vdcList[i]["id"]+' class="fa fa-plus-circle fa-fw" style="float: right;"></i></a>')
                    }
                    $("#flavorVdcAccess").find(".list-group-all").html(listView.join(""));
                    EventsHandler.flavorAddEvent();
                });
            }

		}
        DataGetter.getVdc();

        var currentChosenObj = {


        };

        var DataRender = {
            renderCreateFlavor : function() {


            }
        };

	  //增加按钮
        $("#vmtypeTable_wrapper span.btn-add").on("click",function(){
            //需要修改为真实数据源
            Common.render('tpls/ccenter/vmtype/add.html',renderData,function(html){

                $('body').append(html);


                DataGetter.getVdc();
                //同步currentChosenObj

                //wizard show
                $.fn.wizard.logging = true;
                wizard = $('#create-flavor-wizard').wizard({
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

                EventsHandler.flavorFormValidator();
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
                    var flavorData = {
                        "flavor":{
                            "name": $("#addFlavor [name='name']").val(),
                            "vcpus": $("#addFlavor [name='vcpus']").val(),
                            "ram": $("#addFlavor [name='ram']").val(),
                            "disk": $("#addFlavor [name='disk']").val(),
                            //"OS-FLV-EXT-DATA:ephemera": $("#addFlavor [name='ephemera']").val(),
                            "swap": $("#addFlavor [name='swap']").val()
                        }
                    };

                    Common.xhr.postJSON('/v2/123/flavors/',flavorData,function(data){
                        wizard._submitting = false;
                        wizard.updateProgressBar(100);
                        closeWizard();
                        Common.router.route();
                    })
                });

            })
        });


        var EventsHandler = {

            //表单校验
            flavorFormValidator: function(){
                return $(".form-horizontal").validate({
                    rules: {
                        'name': {
                            required: true,
                            minlength: 4,
                            maxlength:15
                        },
                        'vcpus': {
                            required: true,
                            digits:true
                        },
                        'ram': {
                            required: true,
                            digits:true
                        },
                        'disk': {
                            required: true,
                            digits:true
                        },
                        'ephemera': {
                            digits:true
                        },
                        'swap': {
                            digits:true
                        },
                        'rxtx_factor': {
                            number:true,
                            max:1.0,
                            min:0.0
                        }
                    }
                });
            }
        }


        $(".updateFlavor").on("click",function(){
            more.updateFlavor($(this).attr("data"));
	    });

        //更新配额
        $("ul.dropdown-menu a.removeFlavor").on("click",function(){
            more.deleteFlavor($(this).attr("data"));
        });

        $("ul.dropdown-menu a.updateAccessVdc").on("click",function(){
            more.accessFlavor($(this).attr("data"));
        });
	    //更多
	    var more = {
		    	//更新flavor
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
			    	            onshown : function(){
                                    EventsHandler.flavorAccessEvent();
                                }
			    	        });
			    		});
		    		})
		    		
		    	},

            deleteFlavor : function(id){
                    Modal.confirm('确定要删除该云主机类型吗?', function(result){
                        debugger
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

                },

            accessFlavor : function(id){
                Common.xhr.ajax('/v2/123/flavors/'+id+"/os-flavor-access",function(data){
                    Common.render('tpls/ccenter/vmtype/flavorAccess.html',data,function(html){
                        Modal.show({
                            title: '访问授权',
                            message: html,
                            nl2br: false,
                            buttons: [{
                                label: '保存',
                                action: function(dialog) {
                                    Common.xhr.putJSON('/v2/123/flavors/','',function(data){
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
                                require(['js/common/choose'],function(choose){
                                    alert(data)
                                    debugger
                                    var options = {
                                        selector: '#flavorVdcAccess',
                                        list: renderData.vdcList
                                    };
                                    choose.initChoose(options);
                                });

                            }
                        });

                    });
                })

            }
	    }
	}	
	return {
		init : init
	}
})
