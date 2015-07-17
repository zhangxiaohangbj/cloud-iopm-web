define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    Common.requestCSS('css/wizard.css');
    var init = function(){
        Common.$pageContent.addClass("loading");
        //先获取数据，进行加工后再去render
        Common.xhr.ajax('/monitor/v2/alarmDefines',function(alarmDefines){
            var data = {"data":alarmDefines}
            Common.xhr.ajax("/resources/data/severity.txt",function(severity){
                data.severity = severity;
                Common.render(true,'tpls/monitor/monitor/alarm/index.html',data,function(){
                    bindEvent();
                });
            });
        })

    };

    var validatorOptions = {
        errorContainer: '_form',
        rules: {
            'name': {
                required: true,
                minlength: 1,
                maxlength:15,
                name_cn:true
            },
            'thresholds': {
                required: true,
                number:true,
                range:[0,100]
            },
            'period-count': {
                required: true,
                number:true,
                range:[1,5]
            }
        }
    }

    var bindEvent = function() {
        //页面渲染完后进行各种事件的绑定
        //dataTables
        Common.initDataTable($('#alarmDefineTable'),function($tar){
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
        }).on('ifChecked', function (e) {
            if (e.target.className == 'selectAll') {
                $('.table-primary').find('input[type=checkbox]').iCheck('check');
            }
        }).on('ifUnchecked', function (e) {
            if (e.target.className == 'selectAll') {
                $('.table-primary').find('input[type=checkbox]').iCheck('uncheck');
            }
        })

        var renderData = {};
        //初始化加载，不依赖其他模块
        var wizard;
        //载入默认的数据 inits,创建数据载入类
        var DataIniter = {
            getMeter:function(type){
                Common.xhr.ajax('/monitor/v2/meters/resource/'+type,function(data){
                        var tmp = [];
                        for(var i in data){
                            var item = data[i];
                            var opt = "<option value='"+item.id+"'>"+item.name+"</option>";
                            tmp.push(opt);
                        }
                        $("#meter").html(tmp.join(''))
                })
            },
            getResourceType:function(){
                Common.xhr.ajax('/resources/data/resourceType.txt',function(data){
                    renderData.resourceType = data;
                })
            },
            getSeverity:function(){
                Common.xhr.ajax("/resources/data/severity.txt",function(data){
                    var severity = [];
                    for(var item in data){
                        var tmp = {
                            id:item,
                            name:data[item]
                        }
                        severity.push(tmp)
                    }
                    renderData.severity =severity;
                })
            },
            getPeriod:function(){
                Common.xhr.ajax("/resources/data/period.txt",function(data){
                    renderData.period = data;
                })
            },
            getCompareStrategy:function(){
                Common.xhr.ajax("/resources/data/strategy.txt",function(data){
                    var strategy = [];
                    for(var item in data){
                        var tmp = {
                            id:item,
                            name:data[item]
                        }
                        strategy.push(tmp)
                    }
                    renderData.compareStrategy = strategy;
                })
            }
        };
        //初始化部分数据
        DataIniter.getResourceType();
        DataIniter.getPeriod();
        DataIniter.getSeverity();
        DataIniter.getCompareStrategy();

        //载入后的事件
        $("#alarmDefineTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/monitor/monitor/alarm/add.html',selectData,function(html){
                $('body').append(html);

                $.fn.wizard.logging = true;
                wizard = $('#create-defines-wizard').wizard({
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
                        },
                        1: function(){
                            return this.el.find('form').valid();
                        }
                    }
                });
                //加载时载入validate
                wizard.on('show',function(){
                    wizard.form.each(function(){
                        $(this).validate(validatorOptions);
                    })
                });
                wizard.cards.strategy.on("selected",function(card){
                    var resourceType = $("#resource-type option:selected").val();
                    DataIniter.getMeter(resourceType)
                })

                wizard.show();

                //关闭弹窗
                var closeWizard = function(){
                    $('div.wizard').remove();
                    $('div.modal-backdrop').remove();
                }
                //关闭后移出dom
                wizard.on('closed', function() {
                    closeWizard();
                });
                //提交按钮
                wizard.on("submit", function(wizard) {

                    //合并数据
                    var condition= $("#meter option:selected").val()+":"+
                        $("#comparison-operators option:selected").val()+":"+
                        $("#thresholds").val()+":"+
                        $("#comparison-strategy option:selected").val();
                    var description = $("#meter option:selected").text()+" "+
                        $("#comparison-operators option:selected").text()+" "+
                        $("#thresholds").val()+" ("+
                        $("#comparison-strategy option:selected").text()+")";
                    var curAlarm = {
                        alarmType:"sys",
                        name:$("#name").val(),
                        severity:$("#severity").val(),
                        resourceId:$("#resource-type").val(),
                        periodTime:$("#period option:selected").val(),
                        periodCount:$("#period-count").val(),
                        isRepeated:$("#repeated option:selected").val(),
                        meterId:$("#meter option:selected").val(),
                        alarmCondition:condition,
                        alarmDescription:description,
                        isEnable:$("#isEnable option:selected").val(),
                        isShield:$("#shield option:selected").val(),
                        isAutoClear:false
                    }
                    Common.xhr.postJSON('/monitor/v2/alarmDefines',curAlarm,function(data){
                        if(data && data.error!=true){
                            wizard._submitting = false;
                            wizard.updateProgressBar(100);
                            closeWizard();
                            Modal.success('保存成功');
                            Common.router.route();
                        }else{
                            //Modal.warning ('保存失败')
                        }
                    });
                });
            });
        });

        //编辑
        //删除
        $("a.delete").on("click",function(){
            var id = $(this).attr("data");
            Modal.confirm('确定要删除该告警方案吗?',function(result){
                if(result) {
                    Common.xhr.del('monitor/v2/alarmDefines/'+id,
                        function(data){
                            if(data && data.error!=true){
                                Modal.success('删除成功')
                                setTimeout(function(){
                                    Modal.closeAll();
                                    Common.router.route();//重新载入
                                },1000);

                            }else{
                            }
                        });
                }else {
                    Modal.closeAll();
                }
            });

        })

        //更多编辑
        //编辑基本信息
        $("ul.dropdown-menu a.edit-basic").on("click",function(){
            var id = $(this).attr("data");
            Common.xhr.ajax('monitor/v2/alarmDefines/'+id,function(alarm){
                var severityList = [];
                for(var i in renderData.severity){
                    if(alarm.severity == renderData.severity[i].id){
                        renderData.severity[i].selected = "selected";
                    }
                }
               alarm.severityList =renderData.severity;
                Common.render('tpls/monitor/monitor/alarm/editBasic.html',alarm,function(html){
                    Modal.show({
                        title: '编辑基本信息',
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

                                    var alarm={
                                        severity:$("#severity option:selected").val(),
                                        isRepeated:$("#isRepeated option:selected").val(),
                                        isEnable:$("#isEnable option:selected").val(),
                                        isShield:$("#isShield option:selected").val()
                                    }
                                    if($("#name").val()!=""){
                                        alarm.name =$("#name").val();
                                    }
                                    Common.xhr.putJSON('/monitor/v2/alarmDefines/'+id,alarm,function(data){
                                        if(data && data.error !=true){
                                            Modal.success('保存成功');
                                            setTimeout(function(){Modal.closeAll();
                                            Common.router.route();
                                            },2000);

                                        }else{
                                            Modal.warning ('保存失败')
                                        }
                                    })
                                }
                            }],
                        onshown : function(){}
                    });
                });
            })
        });
        //编辑周期
        $("ul.dropdown-menu a.edit-period").on("click",function(){
            var id= $(this).attr("data");
            Common.xhr.ajax('monitor/v2/alarmDefines/'+id,function(alarm){
                alarm.period = renderData.period;
                Common.render('tpls/monitor/monitor/alarm/editPeriod.html',alarm,function(html){
                    Modal.show({
                        title: '编辑告警周期',
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
                                    var valid = $(".form-horizontal").valid();
                                    if(!valid) return false;
                                    var alarm={
                                        periodTime:$("#periodTime option:selected").val(),
                                        periodCount:$("#period-count").val()
                                    }
                                    Common.xhr.putJSON('/monitor/v2/alarmDefines/'+id,alarm,function(data){
                                        if(data && data.error !=true){
                                            Modal.success('保存成功');
                                            setTimeout(function(){Modal.closeAll();
                                                Common.router.route();
                                            },2000);
                                        }else{
                                            Modal.warning ('保存失败')
                                        }
                                    })
                                }
                            }],
                        onshown : function(){}
                    });
                })
            })
        })
        //编辑告警策略
        $("ul.dropdown-menu a.edit-strategy").on("click",function(){
           var id = $(this).attr("data");
            Common.xhr.ajax('monitor/v2/alarmDefines/'+id,function(alarm){
                var conArr = alarm.alarmCondition.split(":");;
                var descArr = alarm.alarmDescription.split(/[><]/);
                //获取条件
                var curStrategy = {
                    meterId:conArr[0],
                    meterName:descArr[0],
                    operator:conArr[1],
                    threshold:conArr[2],
                    strategy:conArr[3]
                }
                var strategyList = [];
                for(var i in renderData.compareStrategy){
                    var tmp = {
                        id:renderData.compareStrategy[i].id,
                        name:renderData.compareStrategy[i].name
                    }
                    if(conArr[3] == renderData.compareStrategy[i].id){
                        tmp.selected = "selected";
                    }
                    strategyList.push(tmp)
                }
                curStrategy.strategyList = strategyList;
                Common.render('tpls/monitor/monitor/alarm/editStrategy.html',curStrategy,function(html){
                    Modal.show({
                        title: '编辑告警策略',
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
                                    var alarm={
                                        alarmCondition:curStrategy.meterId+":"+
                                            $("#compareOperator option:selected").val()+":"+
                                            $("#threshold").val()+":"+
                                            $("#strategy option:selected").val(),
                                        alarmDescription:curStrategy.meterName+" "+
                                            $("#compareOperator option:selected").text()+" "+
                                            $("#threshold").val()+" ("+
                                            $("#strategy option:selected").text()+")"
                                    }
                                    Common.xhr.putJSON('/monitor/v2/alarmDefines/'+id,alarm,function(data){
                                        if(data && data.error !=true){
                                            Modal.success('保存成功');
                                            setTimeout(function(){Modal.closeAll();
                                                Common.router.route();
                                            },2000);

                                        }else{
                                            Modal.warning ('保存失败')
                                        }
                                    })
                                }
                            }],
                        onshown : function(){}
                    });
                });

            })
        });

    }

    return {
        init : init
    }
})
