define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal){
    Common.requestCSS('css/wizard.css');

    var init = function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/monitor/v2/notification',function(data){
            var serverData= {"data":data};
            Common.xhr.ajax("/resources/data/notificationType.txt",function(type){
                serverData.type = type;
                Common.render(true,'tpls/monitor/monitor/notification/index.html',serverData,function(){
                    bindEvent();
                });
            });
        });
    };
    var bindEvent = function(){
        //页面渲染完后进行各种事件的绑定
        //dataTables
        Common.initDataTable($('#notificationTable'),function($tar){
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

        var dataGetter={
            //获取类型数据
            getNotificationType:function(){
                Common.xhr.ajax("/resources/data/notificationType.txt",function(type){
                    var typeArr = [];
                    for(var i in type){
                        var item = {
                            id:i,
                            name:type[i]
                        }
                        typeArr.push(item);
                    }
                    renderData.typeList = typeArr;
                });
            }
        };
        dataGetter.getNotificationType();


        //创建按钮
        $("#notificationTable_wrapper span.btn-add").on("click",function(){
            var selectData= {"data":renderData};
            Common.render('tpls/monitor/monitor/notification/add.html',selectData,function(html){
                $('body').append(html);

                $.fn.wizard.logging = true;
                wizard = $('#create-notification-wizard').wizard({
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
                                'name': {
                                    required: true,
                                    minlength: 1,
                                    maxlength:15,
                                    name_cn:true
                                },
                                'account-mail': {
                                    required: true,
                                    email:true
                                },
                                'account-sms': {
                                    required: true,
                                    mobile:true
                                },
                                'account-url':{
                                    required: true,
                                    url:true
                                },
                                'account-sign':{
                                    required: true,
                                    number:true,
                                    minlength:6,
                                    maxlength:6
                                },
                                'description':{
                                    required:false,
                                    minlength:1,
                                    maxlength:255
                                }
                            }
                        });
                    })
                });
                wizard.cards.account.on("selected",function(card){
                    var curType = $("#type option:selected").val();
                    var elem = curType.toLowerCase();
                    $("div.account").each(function(){
                        if($(this).attr("id")== elem){
                            $(this).val("");
                            $(this).removeClass("hidden");
                        }else{
                            $(this).addClass("hidden");
                        }
                    })
                    $("#account-sign").val('');
                })
                //确认信息卡片被选中的监听
                wizard.cards.confirm.on('selected',function(card){
                    //获取上几步中填写的值
                    $("#name-confirm").val($("#name").val());
                    $("#type-confirm").val($("#type option:selected").text());
                    $("#description-confirm").val($("#description").val());
                    var curType = $("#type option:selected").val().toLowerCase();
                    $("#account-confirm").val($("#account-"+curType).val());
                });
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
                    var curType = $("#type option:selected").val();
                    var notification = {
                        name:$("#name").val(),
                        type:curType,
                        account:$("#account-"+curType.toLowerCase()).val(),
                        description:$("#description").val(),
                        ownerId:Common.cookies.getVdcId()
                    }
                    Common.xhr.postJSON('/monitor/v2/notification',notification,function(data){
                        debugger
                        if(data && data.error!=true){
                            wizard._submitting = false;
                            wizard.updateProgressBar(100);
                            closeWizard();
                            Modal.success('保存成功');

                            setTimeout(function(){
                                Modal.closeAll();
                                Common.router.route();
                            },1000);
                        }else{
                            //Modal.warning ('保存失败')
                        }
                    });
                });
            });
        });
        //操作按钮
        //删除
        $("a.delete").on("click",function(){
            var id = $(this).attr("data");
            Modal.confirm('确定要删除通知方案吗?',function(result){
                if(result) {
                    Common.xhr.del("/monitor/v2/notification/"+id,
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

        });
    }
    return {
        init : init
    };
});