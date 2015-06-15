define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Dialog){
    Common.requestCSS('css/wizard.css');
    Common.requestCSS('css/dialog.css');
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


        var CheckHandler={
            nameCheck:function(){
                currentChosenEnv.name = $("#env-name").val();
                 $("#env-name-confirm").val(currentChosenEnv.name);
            },
            typeChange:function(){
                $('select.select-env-type').change(function(){
                    var curEnv = $(this).children('option:selected');
                    currentChosenEnv.type =  curEnv.val();
                    currentChosenConnector.type = curEnv.val();
                    $("#env-type-confirm").val(curEnv.text());
                });
                $("#env-type-confirm").val($('select.select-env-type option:selected').text());
            },
            vendorCheck:function(){
                currentChosenEnv.vendor = $("#env-vendor").val();
                $("#env-vendor-confirm").val(currentChosenEnv.vendor);
            },
            versionCheck:function(){
                currentChosenEnv.version = $("#env-version").val();
                currentChosenConnector.version = $("#env-version").val();
                $("#env-version-confirm").val(currentChosenEnv.version);
            },
            regionChange:function(){
                $('select.select-region').change(function(){
                    var curRegion = $(this).children('option:selected');
                    currentChosenEnv.regionId =  curRegion.val();
                    $("#env-region-confirm").val(curRegion.text());
                });
                $("#env-region-confirm").val($('select.select-region option:selected').text());

            },
            protocolChange:function(){
                $('select.select-protocol').change(function(){
                    var curPro = $(this).children('option:selected');
                    currentChosenConnector.protocol =  curPro.val();
                    $("#connector-protocol-confirm").val(curPro.text());
                });
                $("#connector-protocol-confirm").val($('select.select-protocol option:selected').text());

            },
            ipCheck:function(){
                currentChosenConnector.ip = $("#connector-ip").val();
                $("#connector-ip-confirm").val(currentChosenConnector.ip);
            },
            portCheck:function(){
                currentChosenConnector.port = $("#connector-port").val();
                $("#connector-port-confirm").val(currentChosenConnector.port);
            },
            userCheck:function(){
                currentChosenConnector.username = $("#connector-username").val();
                $("#connector-username-confirm").val(currentChosenConnector.username);
            },
            paswCheck:function(){
                currentChosenConnector.password = $("#connector-password").val();
                $("#connector-pasw-confirm").val(currentChosenConnector.password);
            },
            periodChange:function(){
                $('select.select-period').change(function(){
                    var curPeriod = $(this).children('option:selected');
                    currentChosenEnv.refreshCycle =  curPeriod.val();
                    $("#select-period-confirm").val(curPeriod.text());
                });
                $("#select-period-confirm").val($('select.select-period option:selected').text());

            },
            //表单校验
            formValidator: function(){
                $(".form-horizontal").validate({
                    rules: {
                        'env-name': {
                            required: true,
                            minlength: 4,
                            maxlength:15
                        },
                        'connector-ip':{
                            required: true,

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
                        'connector-password':{
                            required:true,
                            minlength:6

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
            },
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
                currentChosenEnv.type = $('select.select-env-type option:selected').val();
                currentChosenEnv.regionId = $('select.select-region option:selected').val();
                currentChosenConnector.type = $('select.select-env-type option:selected').val();
                currentChosenConnector.protocol = $('select.select-protocol option:selected').val();
                currentChosenEnv.refreshCycle = $('select.select-period option:selected').val();

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
                    }
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

                //下一步中进行数据的初始化
                wizard.on("nextclick", function(wizard) {
                    wizard.getActiveCard().enable()
                    var index = wizard.getActiveCard().index;
                    switch (index){
                        case 1:
                            CheckHandler.nameCheck();
                            CheckHandler.vendorCheck();
                            CheckHandler.versionCheck();
                            break;
                        case 2:
                            CheckHandler.ipCheck();
                            CheckHandler.paswCheck();
                            CheckHandler.portCheck();
                            CheckHandler.userCheck();
                            break;
                    }
                });
                CheckHandler.typeChange();
                CheckHandler.regionChange();
                CheckHandler.periodChange();
                CheckHandler.protocolChange();
                CheckHandler.formValidator();

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
                    Dialog.show({
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
                    Dialog.show({
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
                                        Dialog.success('保存成功');
                                        setTimeout(function(){Dialog.closeAll()},2000);
                                        Common.router.route();
                                    }else{
                                        Dialog.warning ('保存失败')
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

            Common.render('tpls/cresource/env/delete.html',"",function(html){
                Dialog.show({
                    title: '删除',
                    message: html,
                    nl2br: false,
                    buttons: [{
                        label: '取消',
                        action: function (dialog) {
                            dialog.close();
                        }
                    },{
                        label:'确定',
                        action:function(dialog){
                            var valid = $(".form-horizontal").valid();
                            if(!valid) return false;

                            var del={
                                url:"v2/virtual-env/"+data,
                                type:"delete"
                            }
                            Common.xhr.ajax(del,function(data){
                                if(data){
                                    Dialog.success('保存成功') ;

                                    setTimeout(function(){Dialog.closeAll()},2000);
                                    Common.router.reload();
                                }else{
                                    alert("failed");
                                }
                            });
                        }
                    }],
                    onshown : ""
                });

            });


        });
    }
    return {
        init : init
    };
});