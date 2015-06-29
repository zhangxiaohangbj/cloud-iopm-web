define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    //初始化
    var wizard;
    var renderData = {};
    var currentResourceList={};
    var chosenList=[];
    var currentZone={
        name:null,
        virtualEnvId:null,
        regionId:null,
        description:null
    };


    var init = function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/tenant_id/os-availability-zone/list',function(data){
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
                Common.xhr.ajax("/v2/tenant_id/region",function(region){
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
        var resourceHandler ={
            init:function(resourceName,elem){
                var resourceTypeArray ;
                resourceTypeArray= renderData.type.slice(0);
                debugger
                var link ;
                var rtype;
                var choseObj;
                resourceTypeArray.forEach(function(e){
                    if(e.name == resourceName){
                        link = e.link;
                        rtype= e.type;
                        //e.selected = true;
                        choseObj = e;
                        choseObj
                        return
                    }
                })
                Common.xhr.ajax(link,function(data){
                    var dataList = data;
                    //遍历对象，生成两个list ， unchosen/chosen
                    var unChosenList=[];
                    $.each(dataList,function(i,item){
                        item.icon_type = rtype;
                        var flag = true;
                        $.each(chosenList,function(i,item0){
                            if(item0.id == item.id){
                                flag = false;
                            }
                        })
                        if(flag){
                            unChosenList.push(item);
                        }
                    })
                    require(['js/common/choose'],function(choose){
                        var options = {
                            selector: '#'+elem,
                            allData: unChosenList,
                            selectData:chosenList,
                            doneCall: resourceHandler.changeHandler,
                            headAppend: {
                                className: 'select-resource-type',
                                list: resourceTypeArray
                            }
                        };
                        choose.initChoose(options);
                    });
                    resourceHandler.changeHandler();
                });
            },
            saveChosen:function(){

            },
            refreshChosen:function(){

            },
            listChosen:function(){

            },
            changeHandler:function(){
                $("#choseResource").find("select.select-resource-type").change(function(){
                    chosenList =[];  //reInit
                    var resourceName = $(this).children('option:selected').val();
                    debugger
                    $("#choseResource .show-selected").find("ul.list-group-item").each(function(){
                        var curLi = $(this).find("li.member");
                        var curClass= $(this).find("i.type_icons").attr("class");
                        var curR = {
                            id:curLi.attr("data-id"),
                            name:curLi.attr("data-name"),
                            type: curClass.split(" ")[1]
                        };
                        chosenList.push(curR)
                    });
                    resourceHandler.init(resourceName,"choseResource");
                });
            }
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
                //修改资源添加
                var rName = renderData.type[0].name;
                resourceHandler.init(rName,elem);
                //resourceHandler.changeHandler();
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

        //创建按钮
        $("#ZoneTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/cresource/zone/add.html',selectData,function(html){
                $('body').append(html);
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
                        submitText: "提  交",
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
                //资源选择页面的监听事件
                wizard.cards.resource.on("selected",function(){
                    resourceHandler.changeHandler();
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
                        if(data && data.error !=true){
                            wizard._submitting = false;
                            wizard.updateProgressBar(100);
                            closeWizard();
                            Common.router.route();
                        } else{
                            Modal.warning ('保存失败')
                        }
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
                                        if(data &&data.error!=true){
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
                            //initResource(rtype,"addResource");
                        }
                    });

                });
            });



        });
        //删除按钮
        $("a.delete").on("click",function(){
            var id = $(this).attr("data");
            Modal.confirm('确定要删除该可用分区吗?',function(result){
                if(result) {
                    Common.xhr.del("/v2/tenant_id/os-availability-zone/"+id,
                        function(data){
                            if(data && data.error!=true){
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