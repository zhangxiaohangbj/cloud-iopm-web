define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    Common.requestCSS('css/wizard.css');
    var init = function(){
        Common.$pageContent.addClass("loading");
        //先获取数据，进行加工后再去render
        debugger
        Common.xhr.ajax('monitor/v2/alarmDefines',function(data){
            debugger
            Common.render('tpls/monitor/monitor/agent/agent.html',data,function(){
                bindEvent();
            });
        })

    };

    var bindEvent = function() {
        //页面渲染完后进行各种事件的绑定
        //dataTables
        Common.initDataTable($('#VirtualEnvTable'),function($tar){
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
        var DataIniter = {};
        //载入后的事件


        $("#alarmTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/ccenter/env/add.html',selectData,function(html){
                $('body').append(html);

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
                        var temp = $(this).validate({
                            errorContainer: '_form',
                            rules: {
                                'env-name': {
                                    required: true,
                                    minlength: 1,
                                    maxlength:15,
                                    name_en:true
                                },
                                'env-version': {
                                    required: true
                                },
                                'env-vendor': {
                                    required: true,
                                    minlength: 1,
                                    maxlength:15
                                },
                                'connector-port':{
                                    required: true,
                                    number:true,
                                    range:[1025,65534]
                                },
                                'connector-username':{
                                    required:true,
                                    minlength:1,
                                    maxlength:15
                                },
                                'connector-password': {
                                    required: true,
                                    minlength: 6,
                                    maxlength:15
                                },
                                'connector-password-confirm':{
                                    required:true,
                                    minlength:6,
                                    maxlength:15,
                                    equalTo:"#connector-password"
                                },
                                'connector-ip':{
                                    required:true,
                                    IP:true
                                },
                                'test-connection':{
                                    required:true,
                                    connection:true
                                }
                            }
                        });
                        validators.push(temp);
                    })
                });
                wizard.cards.detail.on("selected",function(card){
                    $("#test-connection-btn").off("click").on("click", function(){
                        debugger;
                        var cur = {
                            type: $('select.select-env-type option:selected').val(),
                            version: $("#env-version").val(),
                            ip: $("#connector-ip").val(),
                            port:$("#connector-port").val(),
                            protocol:$('select.select-protocol option:selected').val(),
                            username:$("#connector-username").val(),
                            password:$("#connector-password-confirm").val(),
                            tenantName:Common.cookies.getVdcId()
                        }
                        validators[1].hideErrors();
                        Modal.loading('测试连接中');
                        Common.xhr.putJSON("/cloud/v2.0/connector/test",cur,function(data){
                            Modal.loading('remove');
                            if(data){
                                Modal.success("该连接信息可用");
                                $("#test-connection").val("true");
                            }else{
                                debugger
                                Modal.warning("连接信息不可用");
                            }
                        })
                    })
                })
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
                    currentChosenConnector.version="v2.0";
                    currentChosenConnector.tenantName=Common.cookies.getVdcName();
                    currentChosenEnv["connector"] = currentChosenConnector;
                    Common.xhr.postJSON('/v2/virtual-env',currentChosenEnv,function(data){
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

    }

    return {
        init : init
    }
})
