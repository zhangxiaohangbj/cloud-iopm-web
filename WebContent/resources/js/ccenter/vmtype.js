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

            getChoose: function(obj){
                var chooseList = [];
                $(obj).find("li.member").each(function(i,element){
                    var id = $(element).attr("data-id");
                    chooseList.push(id);
                });
                return chooseList;
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
            flavorAccessEvent:function(){
                require(['js/common/domchoose'],function(domchoose){
                    var leftOption = {
                            appendWrapper: '.vdc-all',
                            clone: 'a.list-group-item'
                        },
                        rightOption = {
                            appendWrapper: '.vdc-chosen',
                            clone: 'a.list-group-item',//相对clickSelector获取元素
                            clickSelector: 'i.fa-minus-circle'
                        };
                    domchoose.initChoose(leftOption,rightOption);
                });
            },
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
                    var unselectedList = [];
                    var selectedList = [];
                    Common.render('tpls/ccenter/vmtype/flavorAccess.html',data,function(html){
                        Modal.show({
                            title: '访问授权',
                            message: html,
                            nl2br: false,
                            buttons: [{
                                label: '保存',
                                action: function(dialog) {
                                    var chooseList = DataGetter.getChoose('#flavorVdcAccess .list-group-select');
                                    debugger
                                    Common.xhr.putJSON('/v2/123/flavors/'+id+'/os-flavor-access',chooseList,function(data){
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
                                    var flavorVdcList = data['flavor_access'];
                                    debugger
                                    a: for(var i=0; i<renderData.vdcList.length; i++){
                                         for(var j=0; j<flavorVdcList.length; j++){
                                            if(renderData.vdcList[i]['id'] == flavorVdcList[j]['tenant_id']){

                                                selectedList.push(renderData.vdcList[i])
                                                continue a;
                                            }
                                        }
                                        unselectedList.push(renderData.vdcList[i])
                                    }
                                    var options = {
                                        selector: '#flavorVdcAccess',
                                        allData: unselectedList,
                                        selectData: selectedList
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
