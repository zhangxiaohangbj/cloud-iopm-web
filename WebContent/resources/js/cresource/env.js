define(['Common','bs/wizard','jq/form/validator','jq/form/validator/addons/bs3','bs/tooltip'],function(Common){
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
            region: null, //地区
        };
        var currentChosenConnector={
            protocol: null,	//协议
            period: null,//周期
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
                    //currentChosenObj.type = $('select.select-env-type').children('option:selected');
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
                    //同步currentChosenObj
                    //currentChosenObj.protocol = $('select.select-protocol').children('option:selected');
                });
            },
            //获取周期
            getPeriod:function(){
                Common.xhr.ajax("/resources/data/period.txt",function(period){
                    renderData.period = period;
                    //同步currentChosenObj
                    //currentChosenObj.period = $('select.select-period').children('option:selected');
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
                    currentChosenEnv.type =  $(this).children('option:selected').val();
                });
                $("#env-type-confirm").val(currentChosenEnv.type);
            },
            vendorCheck:function(){
                currentChosenEnv.vendor = $("#env-name").val();
                $("#env-vendor-confirm").val(currentChosenEnv.vendor);
            },
            versionCheck:function(){
                currentChosenEnv.versoin = $("#env-name").val();
                $("#env-version-confirm").val(currentChosenEnv.version);
            },
            regionChange:function(){
                $('select.select-region').change(function(){
                    currentChosenEnv.region =  $(this).children('option:selected').val();
                });
                $("#env-region-confirm").val(currentChosenEnv.region);
            },
            protocolChange:function(){
                $('select.select-protocol').change(function(){
                    currentChosenConnector.protocol =  $(this).children('option:selected').val();
                });
                $("#connector-protocol-confirm").val(currentChosenConnector.protocol);
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
                $("#connector-password-confirm").val(currentChosenConnector.password);
            },
            paswConfirmCheck:function(){
                //currentChosenConnector. = $("#env-name").val();
            },
            periodChange:function(){
                $('select.select-period').change(function(){
                    currentChosenConnector.period =  $(this).children('option:selected').val();
                });
                $("#connector-period-confirm").val(currentChosenConnector.period);
            },
            //表单校验
            formValidator: function(){
                $(".form-horizontal").validate({
                    rules: {
                        'env-name': {
                            required: true,
                            minlength: 4,
                            maxlength:15
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
                currentChosenEnv.region = $('select.select-region option:selected').val();
                currentChosenConnector.protocol = $('select.select-protocol option:selected').val();
                currentChosenConnector.period = $('select.select-period option:selected').val();
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

                debugger;
                wizard.on("next",function(){
                    alert(1);
                });
                CheckHandler.formValidator();


                //提交按钮
                wizard.on("submit", function(wizard) {
                    //var postDate={};
                    //postDate.put(currentChosenEnv);


                    CheckHandler.nameCheck();
                    CheckHandler.ipCheck();
                    CheckHandler.paswCheck();
                    CheckHandler.paswConfirmCheck();
                    CheckHandler.periodChange();
                    CheckHandler.portCheck();
                    CheckHandler.protocolChange();
                    CheckHandler.regionChange();
                    CheckHandler.typeChange();
                    CheckHandler.userCheck();
                    CheckHandler.vendorCheck();
                    CheckHandler.versionCheck();
                    debugger;
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
            alert($(this).attr("data"));
        });
        //编辑按钮
        $("a.log-info").on("click",function(){
            alert($(this).attr("data"));
        });
        //删除按钮

        $("a.delete").on("click",function(){
            var data = $(this).attr("data");
            var del={
                url:"v2/virtual-env/"+data,
                type:"delete"
            }
            Common.xhr.ajax(del,function(data){
                if(data){
                    debugger;
                    Common.router.reload();
                }else{
                    alert("failed");
                }
            });
        });
    }



    return {
        init : init
    };
});