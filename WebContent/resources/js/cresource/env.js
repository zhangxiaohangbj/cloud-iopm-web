define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal){
    Common.requestCSS('css/wizard.css');
    var init = function(){
        Common.$pageContent.addClass("loading");
        //Common.render(true, 'tpls/cresource/virtualEnv.html','/resources/data/env.txt', function() {
        //    bindEvent();
        //});

        //真实请求的数据
        Common.xhr.ajax('/v2/virtual-env',function(data){
            var serverData= {"data":data};
            Common.render(true,'tpls/cresource/env/index.html',serverData,function(){
                bindEvent();
            });
        });
    };
    var bindEvent = function(){
        //页面渲染完后进行各种事件的绑定
        //dataTables
        Common.initDataTable($('#VirtualEnvTable'),function($tar){
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });
        $("[data-toggle='tooltip']").tooltip();

        //ip校验
        $.validator.addMethod("ip", function(value, element) {
            return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
        }, "请填写正确的网关IP");

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

        //初始化
        var wizard;
        var renderData = {};
        var currentChosenEnv = {
            type: null,	//虚拟环境类型
            regionId: null, //地区
            refreshCycle:null,
            version:"1.0", //default
            vendor:"default"//default
        };
        var currentChosenConnector={
            version:'2.0',
            type:null,
            ip:null,
            port:null,
            username:null,
            password:null,
            protocol: null,	//协议
        }
        var dataGetter={
            //获取类型数据
            getType:function(){
                Common.xhr.ajax("/virtual-env/type",function(type){
                    var selectData = [];
                    for(var i=0;i<type.length;i++){
                        selectData[i] = {"name":type[i]};
                    }
                    renderData.virtualEnvType = selectData;
                });
            },
            //获取地区
            getZone:function(){
                //var vdcId = currentChosenObj.vdc.val() || $('select.select-vdc').children('option:selected').val();
                //if(vdcId) {
                //     Common.xhr.ajax("/v2/"+vdcId+"/os-availability-zone",function(zoneInfo){
                //         alert(zoneInfo);
                //     });
                //}
                Common.xhr.ajax("/resources/data/region.txt",function(region){
                    renderData.region = region;
                });
            },
            //获取协议
            getProtocol:function(){
                Common.xhr.ajax("/resources/data/protocol.txt",function(protocol){
                    renderData.protocol = protocol;
                });
            },
            //获取周期
            getPeriod:function(){
                Common.xhr.ajax("/resources/data/period.txt",function(period){
                    renderData.period = period;
                });
            }

        };
        dataGetter.getType();
        dataGetter.getZone();
        dataGetter.getProtocol();
        dataGetter.getPeriod();


        var dataSetHandler={
            nameSet:function(){
                currentChosenEnv.name = $("#env-name").val();
                 $("#env-name-confirm").val(currentChosenEnv.name);
            },
            typeSet:function(){
                var curEnv = $('select.select-env-type option:selected');
                currentChosenEnv.type =  curEnv.val();
                currentChosenConnector.type = curEnv.val();
                $("#env-type-confirm").val(curEnv.text());
            },
            vendorSet:function(){
                currentChosenEnv.vendor = $("#env-vendor").val();
                $("#env-vendor-confirm").val(currentChosenEnv.vendor);
            },
            versionSet:function(){
                currentChosenEnv.version = $("#env-version").val();
                currentChosenConnector.version = $("#env-version").val();
                $("#env-version-confirm").val(currentChosenEnv.version);
            },
            regionSet:function(){
                var curRegion = $('select.select-region option:selected');
                currentChosenEnv.regionId =  curRegion.val();
                $("#env-region-confirm").val(curRegion.text());
            },
            protocolSet:function(){
                var curPro =  $('select.select-protocol option:selected');
                currentChosenConnector.protocol =  curPro.val();
                $("#connector-protocol-confirm").val(curPro.text());
            },
            ipSet:function(){
                currentChosenConnector.ip = $("#connector-ip").val();
                $("#connector-ip-confirm").val(currentChosenConnector.ip);
            },
            portSet:function(){
                currentChosenConnector.port = $("#connector-port").val();
                $("#connector-port-confirm").val(currentChosenConnector.port);
            },
            userSet:function(){
                currentChosenConnector.username = $("#connector-username").val();
                $("#connector-username-confirm").val(currentChosenConnector.username);
            },
            paswSet:function(){
                currentChosenConnector.password = $("#connector-password").val();
                $("#connector-pasw-confirm").val(currentChosenConnector.password);
            },
            periodSet:function(){
                var curPeriod =   $('select.select-period option:selected');
                currentChosenEnv.refreshCycle =  curPeriod.val();
                $("#select-period-confirm").val(curPeriod.text());
            }
        };

        //重置CurrentChosenObj对象
        var resetCurrentChosenObj = function(){
            for(var key in currentChosenEnv){
                currentChosenEnv[key] = null;
            }
            currentChosenEnv.nums = 1;
            for(var key in currentChosenConnector){
                currentChosenConnector[key] = null;
            }
            currentChosenConnector.nums = 1;
        }

        //创建按钮
        $("#VirtualEnvTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/cresource/env/add.html',selectData,function(html){
                $('body').append(html);
                //
                //currentChosenEnv.type = $('select.select-env-type option:selected').val();
                //currentChosenEnv.regionId = $('select.select-region option:selected').val();
                //currentChosenConnector.type = $('select.select-env-type option:selected').val();
                //currentChosenConnector.protocol = $('select.select-protocol option:selected').val();
                //currentChosenEnv.refreshCycle = $('select.select-period option:selected').val();

                $.fn.wizard.logging = true;
                wizard = $('#create-virtualEnv-wizard').wizard({
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
                    	$(this).validate({
                            errorContainer: '_form',
                            rules: {
                                'env-name': {
                                    required: true,
                                    minlength: 4,
                                    maxlength:15
                                },
                                'env-version': {
                                    required: true
                                },
                                'env-vendor': {
                                    required: true,
                                    minlength: 4,
                                    maxlength:15
                                },
                                'connector-port':{
                                    required: true,
                                    number:true,
                                    range:[1025,65534]
                                },
                                'connector-username':{
                                    required:true,
                                    minlength:4,
                                    maxlength:15
                                },
                                'connector-password': {
                                    required: true,
                                    minlength: 6
                                },
                                'connector-password-confirm':{
                                    required:true,
                                    minlength:6,
                                    equalTo:"#connector-password"
                                },
                                'connector-ip':{
                                    required:true,
                                    ip:true
                                }
                            }
                        });
                    })
                });
                //确认信息卡片被选中的监听
                wizard.cards.confirm.on('selected',function(card){
                    //获取上几步中填写的值
                    //var serverData = wizard.serializeObject()
                    dataSetHandler.nameSet();
                    dataSetHandler.vendorSet();
                    dataSetHandler.versionSet();
                    dataSetHandler.ipSet();
                    dataSetHandler.paswSet();
                    dataSetHandler.portSet();
                    dataSetHandler.userSet();
                    dataSetHandler.typeSet();
                    dataSetHandler.regionSet();
                    dataSetHandler.periodSet();
                    dataSetHandler.protocolSet();
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


                //提交按钮
                wizard.on("submit", function(wizard) {
                    //合并数据
                    currentChosenEnv["connector"] = currentChosenConnector;
                    Common.xhr.postJSON('/v2/virtual-env',currentChosenEnv,function(data){
                        wizard._submitting = false;
                        wizard.updateProgressBar(100);
                        closeWizard();
                        Common.router.route();
                    });
                });
            });
        });

        //操作按钮
        //日志按钮
        $("a.log-info").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax("/v2/virtual-env/"+data,function(env){
                var selectData2= {"data":renderData,"virtualEnv":env};
                Common.render('tpls/cresource/env/loginfo.html',selectData2,function(html){
                    Modal.show({
                        title: '日志信息',
                        message: html,
                        nl2br: false,
                        onshown : ""
                    });

                });
            });
        });
        //编辑按钮

        $("a.edit").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax("/v2/virtual-env/"+data,function(env){
                var selectData2= {"data":renderData,"virtualEnv":env};
                Common.render('tpls/cresource/env/edit.html',selectData2,function(html){
                    Modal.show({
                        title: '编辑虚拟化环境',
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

                                var envData ={
                                    "id":env.id,
                                    "name": $("#edit-env-name").val(),
                                    "type": $('#edit-env-type option:selected').val(),
                                    "version":  $('#edit-env-version').val(),
                                    "regionId":  $('#edit-env-region option:selected').val(),
                                    "refreshCycle":  $('#edit-env-period option:selected').val(),
                                    "vendor": $("#edit-env-vendor").val()
                                }
                                debugger;
                                Common.xhr.putJSON('/v2/virtual-env',envData,function(data){
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
                        onshown : ""
                    });

                });
            });

        });
        //删除按钮

        $("a.delete").on("click",function(){
            var data = $(this).attr("data");
            Modal.confirm('确定要删除该虚拟环境吗?',function(result){
                if(result) {
                    Common.xhr.del("v2/virtual-env/"+data,
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