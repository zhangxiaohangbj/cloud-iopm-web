define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    //初始化
    var wizard;
    var renderData = {};
    var currentResourceList={}; //
    var chosenList=[];         //用于记录选择资源框中的已选的记录
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
            var indexData = {"zone":data};
            Common.xhr.ajax("/resources/data/defaultZone.txt",function(az){
                indexData.defaultAz = az;
                Common.render(true,'tpls/ccenter/zone/index.html',indexData,function(){
                    bindEvent();
                });
            })
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


        var resetCurrentChosenObj = function(){
            for(var key in currentZone){
                currentZone[key] = null;
            }
            chosenList = [];
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
                var link ;
                var rtype;
                //复制一个array,用来初始化choose的headAppend
                var tempArray=[];
                renderData.type.forEach(function(e){
                    var temType = {
                        name:e.name,
                        type:e.name,
                    }
                    if(e.name == resourceName){
                       temType.selected = true;
                        rtype = e.name;
                        link = e.link;
                    }
                    tempArray.push(temType);
                })
                Common.xhr.ajax(link,function(data){
                    //遍历对象，过滤unchosenList
                    var unChosenList=resourceHandler.refreshUnChosenList(data,rtype);
                    //复制chosen，符合当前资源类型的可编辑
                    var tmpChosenList = resourceHandler.refreshChosen(rtype);
                    require(['js/common/choose'],function(choose){
                        var options = {
                            selector: '#'+elem,
                            allData: unChosenList,
                            selectData:tmpChosenList,
                            doneCall: function(){
                                resourceHandler.changeHandler(elem);
                            },
                            headAppend: {
                                className: 'select-resource-type',
                                list: tempArray
                            }
                        };
                        choose.initChoose(options);
                    });
                });
            },
            //刷新已选择列表，与当前选中的资源类型对应
            refreshChosen:function(resourceType){
                var tmpChosen = [];
                $.each(chosenList,function(i,item){
                    var tempObj = {
                        id:item.id,
                        name:item.name,
                        icon_type:item.icon_type
                    };
                    if(item.icon_type != resourceType){
                        tempObj.minus_class="hide";
                    }
                    tmpChosen.push(tempObj);
                });
                return tmpChosen;
            },
            //刷新未选择资源的列表，只显示当前资源类型下，还未被选择的资源
            refreshUnChosenList:function(dataList,resourceType){
                var unChosenList=[];
                $.each(dataList,function(i,item){
                    item.icon_type = resourceType;
                    var flag = true;
                    //根据id判断是否已经出现在chosen中
                    $.each(chosenList,function(i,item0){
                        if(item0.id == item.id){
                            flag = false;
                        }
                    })
                    if(flag){
                        unChosenList.push(item);
                    }
                });
                return unChosenList;
            },
            changeHandler:function(elem){
                var curDiv = $("#"+elem);
                curDiv.find("select.select-resource-type").change(function(){
                    chosenList =[];  //reInit
                    var resourceName = $(this).children('option:selected').val();
                    curDiv.find(".show-selected").find("ul.list-group-item").each(function(){
                        var curLi = $(this).find("li.member");
                        var curClass= $(this).find("i.type_icons").attr("class");
                        var curR = {
                            id:curLi.attr("data-id"),
                            name:curLi.attr("data-name"),
                            icon_type: curClass.split(" ")[1]
                        };
                        chosenList.push(curR)
                    });
                    resourceHandler.init(resourceName,elem);
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
            Common.render('tpls/ccenter/zone/add.html',selectData,function(html){
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
                                    maxlength: 15,
                                    name_en:true
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
                    resourceHandler.changeHandler("choseResource");
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
                            debugger
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
                Common.render('tpls/ccenter/zone/edit.html',selectData2,function(html){
                    Modal.show({
                        title: '编辑可用分区',
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
                                        "description": $("#edit-zone-description").val()
                                    }
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
                /////////////////////////////////////////////////////////////
                var resourceName = renderData.type[0].name;;
                var elem= "choseResource";
                var link ;
                var rtype;
                //复制一个array,用来初始化choose的headAppend
                var tempArray=[];
                renderData.type.forEach(function(e){
                    var temType = {
                        name:e.name,
                        type:e.name,
                    }
                    if(e.name == resourceName){
                        temType.selected = true;
                        rtype = e.name;
                        link = e.link;
                    }
                    tempArray.push(temType);
                })
                Common.xhr.ajax(link,function(data){
                    //遍历对象，过滤unchosenList
                    var unChosenList=resourceHandler.refreshUnChosenList(data,rtype);
                    //复制chosen，符合当前资源类型的可编辑
                    var tmpChosenList = resourceHandler.refreshChosen(rtype);
                    var options = {
                        selector: '#choseResource',
                        allData: unChosenList,
                        selectData: tmpChosenList,
                        headAppend: {
                            className: 'select-resource-type',
                            list: tempArray
                        }
                    }
                    require(['js/common/choose'],function(choose){
                       //先加载choose，在render
                        Common.render('tpls/ccenter/zone/addResource.html',renderData,function(html){
                            options.doneCall = function(html,chooseWrapper) {
                                chooseWrapper.append(html);
                                $(options.selector).empty().append(chooseWrapper.find('div:first'));
                               // alert(chooseWrapper.html());
                                Modal.show({
                                    title: '添加资源',
                                    message: chooseWrapper.html(),
                                    nl2br: false,
                                    buttons: [{
                                        label: '取消',
                                        action: function (dialog) {
                                            dialog.close();
                                        }
                                    },
                                        {
                                            label: '保存',
                                            action: function (dialog) {
                                                Modal.success('保存成功');
                                                setTimeout(function () {
                                                    Modal.closeAll()
                                                }, 2000);
                                                Common.router.route();
                                            }
                                        }],
                                    onshown: function () {
                                        chooseWrapper.remove();
                                        resourceHandler.changeHandler(elem);
                                    }
                                });
                            }
                            options.doneData = html;
                            choose.initChoose(options);

                        });
                    });
                });
            });
                ////////////////////////////////////////////////////////////////
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