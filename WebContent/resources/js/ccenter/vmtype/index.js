define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('compute/v2/'+current_vdc_id+'/flavors/detail', function(data){

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
				Common.xhr.ajax('identity/v2.0/tenants',function(vdcList){///v2/images
                    renderData.vdcList = vdcList['tenants'];
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

	  //增加按钮
        $("#vmtypeTable_wrapper span.btn-add").on("click",function(){
            //需要修改为真实数据源
            Common.render('tpls/ccenter/vmtype/add.html',renderData,function(html){

                $('body').append(html);


                DataGetter.getVdc();
                //同步currentChosenObj

                require(['js/common/choose'],function(choose){
                    var options = {
                        selector: '#flavorVdcAccess',
                        allData:renderData.vdcList
                    };
                    choose.initChoose(options);
                });

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
                    },
                    submitEnabled: [0,1],
	                validate: {
	            		0: function(){
	            			return this.el.find('form').valid();
	            		}
		            }
                
                });

              //加载时载入validate
    			wizard.on('show',function(){
    				$('input[id="name"]').focus();
    				wizard.form.each(function(){
    					$(this).validate({
    						ignore: "",
                            errorContainer: '_form',
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
                                    required: true,
                                    digits:true
                                },
                                'swap': {
                                    required: true,
                                    digits:true
                                },
                                'rxtx_factor': {
                                    number:true,
                                    max:1.0,
                                    min:0.0
                                }
    			            }
    					});
    				})
    			});
                
                //展现wizard，禁用下一步按钮
                wizard.show();
                //wizard.disableNextButton();

//                EventsHandler.flavorFormValidator();
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

                    var flavor_id = ''
                    Common.xhr.postJSON('compute/v2/'+current_vdc_id+'/flavors/',flavorData,function(data){
                        flavor_id = data['flavor']['id']
                        var chooseList = DataGetter.getChoose('#flavorVdcAccess .list-group-select');
                        if(chooseList.length !=0 ){
                            Common.xhr.putJSON('compute/v2/'+current_vdc_id+'/flavors/'+flavor_id+'/os-flavor-access',chooseList,function(data){
                                wizard.updateProgressBar(100);
                                closeWizard();
                                Common.router.route();
                            },function(data){
                            	Common.xhr.del('compute/v2/'+current_vdc_id+'/flavors/'+flavor_id);
                            	wizard.submitError();
            					wizard.reset();
                            })
                        }
                        else{
                            wizard.updateProgressBar(100);
                            closeWizard();
                            Common.router.route();
                        }

                    },function(data){
                    	wizard.submitError();
    					wizard.reset();
                    })



                });

            })
        });


        var EventsHandler = {
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
		    		Common.xhr.ajax('compute/v2/'+current_vdc_id+'/flavors/'+id,function(data){
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
                                                "name": $("#editFlavor [name='name']").val(),
                                                "vcpus": $("#editFlavor [name='vcpus']").val(),
                                                "ram": $("#editFlavor [name='ram']").val(),
                                                "disk": $("#editFlavor [name='disk']").val(),
                                                //"OS-FLV-EXT-DATA:ephemera": $("#addFlavor [name='ephemera']").val(),
                                                "swap": $("#editFlavor [name='swap']").val()
                                            }
			    	        			};
			    	                	Common.xhr.putJSON('compute/v2/'+current_vdc_id+'/flavors/',flavorData,function(data){
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
		    		})
		    		
		    	},

            deleteFlavor : function(id){
                    Modal.confirm('确定要删除该云主机类型吗?', function(result){
                        if(result) {
                            Common.xhr.del('compute/v2/'+current_vdc_id+'/flavors/'+id,
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

                },

            accessFlavor : function(id){
                Common.xhr.ajax('compute/v2/'+current_vdc_id+'/flavors/'+id+"/os-flavor-access",function(data){
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
                                    Common.xhr.putJSON('compute/v2/'+current_vdc_id+'/flavors/'+id+'/os-flavor-access',chooseList,function(data){
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
