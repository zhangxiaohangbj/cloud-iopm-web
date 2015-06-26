define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    //变量初始化
    var wizard;
    var renderData = {};

    //获取版本
    var dataGetter = {
        versionGetter:function(){
           renderData.version = [{"id":1,"value":"v2.0"}];
        }

    }
    dataGetter.versionGetter();

    //ip校验
    $.validator.addMethod("ip", function(value, element) {
        return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
    }, "请填写正确的网关IP");

    var formValidator = function($form){
        if(!$form)return null;
        return $form.validate({
            errorContainer: "_form",
            rules: {
                'region-name': {
                    required: true,
                    maxlength:15,
                    minlength:1
                },
                'service-name': {
                    required: true,
                    maxlength:15,
                    minlength:4
                },
                'ip':{
                    required: true,
                    ip: true
                },
                'port':{
                    required:true,
                    number:true,
                    range:[1025,65534]
                },
                'username':{
                    required:true,
                    minlength:4,
                    maxlength:15
                },
                'version':{
                    required:true,
                    minlength:1,
                    maxlength:15
                },
                'password':{
                    required:true,
                    minlength:6,
                    maxlength:15
                },
                'password-confirm':{
                    required:true,
                    minlength:4,
                    maxlength:15,
                    equalTo:"#password"
                },
                'description':{
                    required:true,
                    maxlength:254
                }
            }
        });
    }


    //组件初始化函数
    var init=  function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/tenant_id/region',function(data){
            var indexData = {"cloudService":data};
            Common.render(true,'tpls/cresource/region/index.html',indexData,function(){
                bindEvent();
            });
        });
    }
    var bindEvent =function(){
        Common.initDataTable($('#regionTable'),function($tar){
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });
        $("[data-toggle='tooltip']").tooltip();




        //创建按钮
        $("#regionTable_wrapper span.btn-add").on("click",function(){
            var selectData = {"data":renderData};
            Common.render('tpls/cresource/region/add.html',selectData,function(html){

                Modal.show({
                    title: '新增资源区域',
                    message: html,
                    nl2br: false,
                    buttons: [{
                        label:'测试链接',
                        action:function(Modal){
                            if(!$(".form-horizontal").valid()){
                                //校验不通过，什么都不做
                                alert(1)
                            }else{
                                //校验通过，提示可行
                                var connector = {
                                    "name": $("#service-name").val(),
                                    "type":"CLOUDSERVICE",
                                    "ip":$("#ip").val(),
                                    "port":$("#port").val(),
                                    "username":$("#username").val(),
                                    "password":$("#password").val(),
                                    "version":"v2.0",
                                }
                                Common.xhr.putJSON("/cloud/connector/test",connector,function(data){
                                    alert(data)
                                });
                                //Modal.success('连接成功');
                            }
                        }
                    },
                        {
                            label: '完成',
                            action: function(dialog) {
                               if(!$(".form-horizontal").valid()){
                                   //校验不通过，什么都不做
                                   return;
                               }
                                var cloudService={
                                    "name":$("#service-name").val(),
                                    "region":{
                                        name:$("#region-name").val()
                                    }
                                }
                                var connector = {
                                    "name": $("#service-name").val(),
                                    "type":"CLOUDSERVICE",
                                    "ip":$("#ip").val(),
                                    "port":$("#port").val(),
                                    "username":$("#username").val(),
                                    "password":$("#password").val(),
                                    "version":$("#version").val(),
                                }
                                var description = $("#description").val();
                                if(description && description != ""){
                                    connector.description = description;
                                }
                                cloudService.connector = connector;

                                Common.xhr.postJSON('/resource-manager/v2/region',cloudService,function(data){
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
                    onshown : function(dialog){
                        formValidator($("#addRegion"));
                    }
                });

            });
        });

        //编辑按钮
        $("a.edit").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax("/v2/region/"+data,function(cloudService){
                Common.render('tpls/cresource/region/edit.html',cloudService,function(html){
                    Modal.show({
                        title: '修改资源区域',
                        message: html,
                        nl2br: false,
                        buttons: [{
                            label:'测试连接',
                            action:function(Modal){
                                if(!$(".form-horizontal").valid()){
                                    //校验不通过，什么都不做
                                    alert(1)
                                }else{
                                    //校验通过，提示可行
                                    var connector = {
                                        "name": $("#service-name").val(),
                                        "type":"CLOUDSERVICE",
                                        "ip":$("#ip").val(),
                                        "port":$("#port").val(),
                                        "username":$("#username").val(),
                                        "password":$("#password").val(),
                                        "version":"v2.0",
                                    }
                                    Common.xhr.putJSON("/cloud/connector/test",connector,function(data){
                                        alert(data)
                                    });
                                    //Modal.success('连接成功');
                                }
                            }
                        },
                            {
                                label: '完成',
                                action: function(dialog) {
                                    if(!$(".form-horizontal").valid()){
                                        //校验不通过，什么都不做
                                        return;
                                    }
                                    var cloudService={
                                        "name":$("#service-name").val(),
                                        "region":{
                                            name:$("#region-name").val()
                                        }
                                    }
                                    var connector = {
                                        "name": $("#service-name").val(),
                                        "type":"CLOUDSERVICE",
                                        "ip":$("#ip").val(),
                                        "port":$("#port").val(),
                                        "username":$("#username").val(),
                                        "password":$("#password").val(),
                                        "version":$("#version").val(),
                                    }
                                    var description = $("#description").val();
                                    if(description && description != ""){
                                        connector.description = description;
                                    }
                                    cloudService.connector = connector;

                                    Common.xhr.putJSON('/resource-manager/v2/region',cloudService,function(data){
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
                            formValidator($("#editRegion"));
                        }
                    });

                });
            });


        });
        //停止/启用
        $("a.stop-service").on("click",function(){
            var data = $(this).attr("data");
            var status = $(this).attr("data-act");
            Modal.confirm('确定要执行停止操作吗?',function(result){
                if(result) {
                    Common.xhr.putJSON("/resource-manager/v2/region/status/"+data+"/"+status,
                        function(data){
                            if(data){
                                Modal.success('执行成功')
                                Common.router.route();//重新载入
                            }else{
                                Modal.warning ('执行失败')
                            }
                        });
                }else {
                    Modal.closeAll();
                }
            });
        });
        //删除按钮
        $("a.delete").on("click",function(){
            var data = $(this).attr("data");
            Modal.confirm('确定要删除该可用分区吗?',function(result){
                if(result) {
                    Common.xhr.del("/resource-manager/v2/region/"+data,
                        function(data){
                            if(data){
                                Modal.success('删除成功')
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