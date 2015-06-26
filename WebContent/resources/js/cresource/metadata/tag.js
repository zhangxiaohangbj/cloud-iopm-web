define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    var renderData ={}


    var dataGetter = {
        getNamespace:function(){
            Common.xhr.ajax("/v2/metadefs/namespaces",function(data){
                renderData.namespace = data;
            });
        }
    }

    dataGetter.getNamespace();
    var init= function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax("/resource-manager/v2/tag",function(data){
            var indexData = {"tag":data};
            Common.render(true,'tpls/cresource/metadata/tag/index.html',indexData,function(){
                bindEvent();
            });
        });
    }

    var formValidator = function($form){
        if(!$form)return null;
        return $form.validate({
            errorContainer: "_form",
            rules: {
                'name': {
                    required: true,
                    maxlength:15,
                    minlength:1
                },
                'tag-value': {
                    required: true,
                    maxlength:2048,
                    minlength:1
                }
            }
        });
    }


    var bindEvent = function() {
        Common.initDataTable($('#tagTable'), function ($tar) {
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });
        $("[data-toggle='tooltip']").tooltip();


        //创建按钮
        $("#tagTable_wrapper span.btn-add").on("click",function(){
            var selectData = {"data":renderData};
            Common.render('tpls/cresource/metadata/tag/add.html',selectData,function(html) {

                Modal.show({
                    title: '创建资源标签',
                    message: html,
                    nl2br: false,
                    buttons: [{
                        label: '取消',
                        action: function (dialog) {
                            dialog.close();
                        }
                    },
                        {
                            label: '确定',
                            action: function (dialog) {
                                if (!$(".form-horizontal").valid()) {
                                    //校验不通过，什么都不做
                                    return;
                                }
                                var tag = {
                                    "namespace":$("#namespace option:selected").val(),
                                    "name":$("#name").val(),
                                    "value":$("#tag-value").val()
                                }
                                Common.xhr.postJSON("/resource-manager/v2/tag", tag, function (data) {
                                    debugger
                                    if (data && data.error !=false) {
                                        Modal.success('保存成功');
                                        setTimeout(function () {
                                            Modal.closeAll()
                                        }, 2000);
                                        Common.router.route();
                                    } else {
                                        Modal.warning('保存失败')
                                    }
                                })
                            }
                        }],
                    onshown: function (dialog) {
                        formValidator($("#addTag"));
                    }
                });
            });
        });


        //编辑按钮
        $("a.edit").on("click",function(){
            var data = $(this).attr("data");
            Common.xhr.ajax("/resource-manager/v2/tag/"+data,function(tag){
                Common.render('tpls/cresource/metadata/tag/edit.html',tag,function(html){
                    Modal.show({
                        title: '修改标签',
                        message: html,
                        nl2br: false,
                        buttons: [{
                            label:'取消',
                            action:function(dialog){
                                dialog.close();
                            }
                        },
                            {
                                label: '确定',
                                action: function(dialog) {
                                    if(!$(".form-horizontal").valid()){
                                        //校验不通过，什么都不做
                                        return;
                                    }

                                    var tag = {
                                        "id":data,
                                        "name":$("#edit-name").val(),
                                        "value":$("#edit-tag-value").val()
                                    }
                                    Common.xhr.putJSON('/resource-manager/v2/tag',tag,function(data){
                                        if(data && data.error !="true"){
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
                            formValidator($("#editTag"));
                        }
                    });

                });
            });


        });


        //删除按钮
        $("a.delete").on("click",function(){
            var data = $(this).attr("data");
            Modal.confirm('确定要删除该可用分区吗?',function(result){
                if(result) {
                    Common.xhr.del("/resource-manager/v2/tag/"+data,
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
        init:init
    }
});