define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    //初始化
    var wizard;
    var renderData = {};
    var currentResourceList={};
    var currentZone={
        name:null,
        virtualEnvId:null,
        regionId:null,
        description:null
    };


    var init = function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/tenant_id/os-availability-zone/detail',function(data){
            var indexData = {"zone":data,"data":renderData};
            Common.render(true,'tpls/cresource/zone/index.html',indexData,function(){
                bindEvent();
            });
        });
    };

    var bindEvent = function(){
        Common.initDataTable($('#ZoneTable'),function($tar){
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });
        $("[data-toggle='tooltip']").tooltip();



        var resetCurrentChosenObj = function(){
            for(var key in currentZone){
                currentZone[key] = null;
            }
            currentZone.nums = 1;
        }

        var dataGetter={
            //获取类型数据
            getVirtualEnv:function(){
                Common.xhr.ajax("/v2/virtual-env",function(env){
                    renderData.virtualEnv = env;
                });
            },
            //获取地区
            getZone:function(){
                Common.xhr.ajax("/resources/data/region.txt",function(region){
                    renderData.region = region;
                });
            },
            //获取资源类型
            getResourceType:function(){
                Common.xhr.ajax("/resources/data/resourceType.txt",function(type){
                    renderData.type = type;
                });
            }
        };
        dataGetter.getVirtualEnv();
        dataGetter.getZone();
        dataGetter.getResourceType();

        //初始化资源
        var initResource = function(resourceType,elem){
            var resourceTypeArray = renderData.type;
            var link ;
            resourceTypeArray.forEach(function(e){
                if(e.type == resourceType){
                    link = e.link;
                    return
                }
            })
            Common.xhr.ajax(link,function(data){
                var dataList = data.data;
                $.each(dataList,function(i,item){
                	item.icon_type = resourceType;
                })
                /*var resourceListElem = $("#choseResource").find(".list-group-all");
                var chosenList  = $("#resource-chosen");
                resourceListElem.empty();
                var listview=[];
                for(var i=0;i<dataList.length;i++){
                    if( chosenList.has("#"+dataList[i]["id"]).length==0){
                        listview.push('<a href="javascript:void(0);" class="list-group-item '+ resourceType+'">'+dataList[i]["name"]+' <i id = '+dataList[i]["id"]+' class="fa fa-plus-circle fa-fw" style="float: right;"></i></a>')
                    }
                }
                resourceListElem.html(listview.join(""));
                EventsHandler.resourceAddEvent(resourceType);*/
                require(['js/common/choose'],function(choose){
                    var options = {
                        selector: '#'+elem,
                        allData: dataList,
                        headAppend: {
                        	className: 'select',
                        	list: resourceTypeArray
                        }
                    };
                    choose.initChoose(options);
                })
            });
        }
        var dataSetHandler = {
            nameSet:function(){
                currentZone.name = $("#zone-name").val();
                $("#zone-name-confirm").val(currentZone.name);
            },
            envSet:function(){
                var curEnv = $('#select-env option:selected');
                currentZone.virtualEnvId =  curEnv.val();
                $("#select-env-confirm").val(curEnv.text());
            },
            resourceSet:function(elem){
                var resourceType = $("#select-resource-type").children('option:selected').val();
                initResource(resourceType,elem);
                $("#select-resource-type").change(function(){
                    var resourceType = $(this).children('option:selected').val();
                    initResource(resourceType,elem);
                });

            },
            regionSet:function(){
                var curRegion =   $('#select-region option:selected');
                currentZone.regionId =  curRegion.val();
                $("#select-region-confirm").val(curRegion.text());
            },
            descriptionSet:function(){
                currentZone.description = $("#zone-description").val();
                $("#zone-description-confirm").val(currentZone.description);
            }
        }

        var EventsHandler = {
            //点击加号，添加可用分区
            resourceAddEvent:function(type){
               /* require(['js/common/domchoose'],function(domchoose){
                    var leftOption = {
                            appendWrapper: '.resource-all',
                            clone: 'a.'+type
                        },
                        rightOption = {
                            appendWrapper: '.resource-chosen',
                            clone: 'a.'+type,//相对clickSelector获取元素
                            clickSelector: 'i.fa-minus-circle'
                        };
                    domchoose.initChoose(leftOption,rightOption);
                });*/

                //刷新状态
                var resourceListElem = $("#resource-chosen").find(".list-group-item");
                resourceListElem.each(function(){
                    var i = $(this).find("i");
                    if($(this).hasClass(type)){
                        i.hasClass("fa-minus-circle")?null:i.addClass("fa-minus-circle");
                    }else{
                        i.hasClass("fa-minus-circle")?i.removeClass("fa-minus-circle"):null;
                    }
                });

            }
        }
        //创建按钮
        $("#ZoneTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/cresource/zone/add.html',selectData,function(html){
                $('body').append(html);

                //
                //currentZone.virtualEnvId = $("#select-env option:selected").val();
                //currentZone.regionId = $("#select-region option:selected").val();
                $.fn.wizard.logging = true;
                wizard = $('#create-zone-wizard').wizard({
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
                    validate: {
                        0: function(){
                            return this.el.find('form').valid();
                        }
                    }
                });

                //加载时载入validate
                wizard.on('show',function(){
                    wizard.form.each(function(){
                        $(this).validate({
                            errorContainer: '_form',
                            rules: {
                                'zone-name': {
                                    required: true,
                                    minlength: 4,
                                    maxlength: 15
                                },
                                'zone-description':{
                                    required:false,
                                    maxlength:200
                                }
                            }
                        });
                    })
                });

                //确认信息卡片被选中的监听
                wizard.cards.confirm.on('selected',function(card){
                    //获取上几步中填写的值
                    dataSetHandler.nameSet();
                    dataSetHandler.descriptionSet();
                    dataSetHandler.envSet();
                    dataSetHandler.regionSet();
                });


                wizard.show();

                //关闭弹窗
                var closeWizard = function(){
                    $('div.wizard').remove();
                    $('div.modal-backdrop').remove();
                    resetCurrentChosenObj();
                }
                //关闭后移出dom
                wizard.on('closed', function() {
                    closeWizard();
                });

                dataSetHandler.resourceSet("choseResource");

                //提交按钮
                wizard.on("submit", function(wizard) {
                    //合并数据
                    renderData.type.forEach(function(e){
                        var curType = e.type;
                        var curDataList=[];
                        $("#resource-chosen").find("."+curType).each(function(){
                            var cur  = $(this).find("i");
                            curDataList.push({"id":cur.attr("id"),"name":$(this).text()});
                        });
                        if(curDataList.length>0){
                            //currentZone[curType] = curDataList;
                        }
                    });
                    Common.xhr.postJSON('/v2/tenant_id/os-availability-zone',currentZone,function(data){
                        wizard._submitting = false;
                        wizard.updateProgressBar(100);
                        closeWizard();
                        Common.router.route();
                    });
                });
            });
        });

        //编辑按钮
        $("a.edit").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax("/v2/os-availability-zone/"+data,function(zone){
                var selectData2= {"data":renderData,"availableZone":zone};
                Common.render('tpls/cresource/zone/edit.html',selectData2,function(html){
                    Modal.show({
                        title: '编辑可用区域',
                        message: html,
                        nl2br: false,
                        buttons: [{
                            label:'取消',
                            action:function(Modal){
                                Modal.close();
                            }
                        },
                            {
                                label: '保存',
                                action: function(dialog) {
                                    var azone ={
                                        "id":zone.id,
                                        "name": $("#edit-zone-name").val(),
                                        "virtualEnvId": $('#edit-env option:selected').val(),
                                        "regionId":  $('#edit-region option:selected').val(),
                                        "description": $("#edit-zone-description").val()
                                    }
                                    debugger;
                                    Common.xhr.putJSON('/v2/tenant_id/os-availability-zone',azone,function(data){
                                        if(data){
                                            Modal.success('保存成功');
                                            setTimeout(function(){Modal.closeAll()},2000);
                                            Common.router.route();
                                        }else{
                                            Modal.warning ('保存失败')
                                        }
                                    })
                                }
                            }],
                        onshown : function(){

                        }
                    });

                });
            });


        });
        //增加资源按钮
        $("a.add-resource").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax( "/v2/os-availability-zone/"+data,function(zoneInfo){
                Common.render('tpls/cresource/zone/addResource.html',renderData,function(html){


                    Modal.show({
                        title: '添加资源',
                        message: html,
                        nl2br: false,
                        buttons: [{
                            label:'取消',
                            action:function(dialog){
                                dialog.close();
                            }
                        },
                            {
                                label: '保存',
                                action: function(dialog) {
                                    Modal.success('保存成功');
                                    setTimeout(function(){Modal.closeAll()},2000);
                                    Common.router.route();
                                    //Common.xhr.putJSON('/v2/virtual-env',envData,function(data){
                                    //    if(data){
                                    //        Modal.success('保存成功');
                                    //        setTimeout(function(){Modal.closeAll()},2000);
                                    //        Common.router.route();
                                    //    }else{
                                    //        Modal.warning ('保存失败')
                                    //    }
                                    //})
                                }
                            }],
                        onshown : function(){
                            var rtype = renderData.type[0].type;
                            initResource(rtype,"addResource");
                        }
                    });

                });
            });



        });
        //删除按钮
        $("a.delete").on("click",function(){
            var data = $(this).attr("data");
            Modal.confirm('确定要删除该可用分区吗?',function(result){
                if(result) {
                    Common.xhr.del("/v2/tenant_id/os-availability-zone/"+data,
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
        });

    }

    return {
        init : init
    };

});