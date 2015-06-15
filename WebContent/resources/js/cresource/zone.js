define(['Common','bs/modal','bs/wizard','jq/form/validator','jq/form/validator/addons/bs3','bs/tooltip'],function(Common,Dialog) {
    Common.requestCSS('css/wizard.css');
    Common.requestCSS('css/dialog.css');

    var init = function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/tenant_id/os-availability-zone/detail',function(data){
            debugger;
            Common.render(true,'tpls/cresource/zone/index.html',data,function(){
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


        //初始化
        var wizard;
        var renderData = {};

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
            }
        };
        dataGetter.getVirtualEnv();
        dataGetter.getZone();

        //创建按钮
        $("#ZoneTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/cresource/zone/add.html',selectData,function(html){
                $('body').append(html);
                //
                //currentChosenEnv.type = $('select.select-env-type option:selected').val();
                //currentChosenEnv.regionId = $('select.select-region option:selected').val();
                //currentChosenConnector.protocol = $('select.select-protocol option:selected').val();
                //currentChosenEnv.refreshCycle = $('select.select-period option:selected').val();

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
                            //CheckHandler.nameCheck();
                            //CheckHandler.regionChange();
                            //CheckHandler.typeChange();
                            //CheckHandler.vendorCheck();
                            //CheckHandler.versionCheck();
                            break;
                        case 2:
                            //CheckHandler.ipCheck();
                            //CheckHandler.paswCheck();
                            //CheckHandler.periodChange();
                            //CheckHandler.portCheck();
                            //CheckHandler.protocolChange();
                            //CheckHandler.userCheck();
                            break;
                    }
                });
                //CheckHandler.formValidator();

                //提交按钮
                wizard.on("submit", function(wizard) {
                    //合并数据
                    //currentChosenEnv["connector"] = currentChosenConnector;
                    Common.xhr.postJSON('/v2/virtual-env',currentChosenEnv,function(data){
                        wizard._submitting = false;
                        wizard.updateProgressBar(100);
                        closeWizard();
                        Common.router.route();
                    });
                });
            });
        });

    }

    return {
        init : init
    };

});