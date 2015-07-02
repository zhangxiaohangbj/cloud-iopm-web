define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    var renderData ={}

    var init= function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/metadefs/namespaces',function(data){
            var indexData = {"namespace":data};
            Common.render(true,'tpls/ccenter/metadata/namespace/index.html',indexData,function(){
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
                'display-name': {
                    required: true,
                    maxlength:2048,
                    minlength:1
                }
            }
        });
    }

    var bindEvent = function() {
        Common.initDataTable($('#namespaceTable'), function ($tar) {
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });

        var wizard;
        var renderData={
            type:null,
            relatedType:null
        };
        var chosenList=[];
        //获取资源类型
        var dataGetter = {
            //获取资源类型
            getResourceType:function(){
                Common.xhr.ajax("/resources/data/resourceType.txt",function(type){
                    renderData.type = type;
                });
            }
        }
        dataGetter.getResourceType();
        //初始化资源
        var resourceTypeHandler ={
            init:function(chosenData,elem){
                require(['js/common/choose'],function(choose){
                    var options = resourceTypeHandler.getOptionData(chosenData);
                    options.selector = '#'+elem;
                    choose.initChoose(options);
                });
            },
            //刷新未选择资源的列表，只显示当前资源类型下，还未被选择的资源
            getOptionData:function(chosenList){
                var unChosenList=[];
                var retChosenList=[];
                $.each(renderData.type,function(i,item){
                    var flag = true;
                    //根据id判断是否已经出现在chosen中
                    $.each(chosenList,function(i,item0){
                        if(item0.resourceType == item.id){
                            flag = false;
                        }
                    })
                    if(flag){
                        unChosenList.push(item);
                    }else{
                        retChosenList.push(item);
                    }
                });
                var options={};
                if(unChosenList.length>0){
                    options.allData =  unChosenList;
                }
                if(retChosenList.length>0){
                    options.selectData =  retChosenList;
                }
                return options;
            }
        }


        $("[data-toggle='tooltip']").tooltip();
        //创建按钮
        $("#namespaceTable_wrapper span.btn-add").on("click",function(){
            var selectData = {"data":renderData};
           Common.render('tpls/ccenter/metadata/namespace/add.html',selectData,function(html) {
               $('body').append(html);
               $.fn.wizard.logging = true;
               wizard = $('#create-namespace-wizard').wizard({
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
                   submitEnabled: [0],
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
                               'name': {
                                   required: true,
                                   minlength: 4,
                                   maxlength:15
                               },
                               'display-name': {
                                   required: true,
                                   minlength: 4,
                                   maxlength:15
                               },
                               'description': {
                                   required: false,
                                   maxlength:254
                               }
                           }
                       });
                   })
               });
               resourceTypeHandler.init(null,"bindResourceType");

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
                   var namespace = {
                       "namespace":$("#name").val(),
                       "display_name":$("#display-name").val(),
                       "description":$("#description").val(),
                       "visibility":$("#visibility option:selected").val(),
                       "protected":$("#is-protected option:selected").val(),
                       "owner":"admin"
                   }
                   //为namespace添加类型
                   var selectedList = [];
                   $("#bindResourceType .show-selected").find("ul.list-group-item").each(function(){
                       var curLi = $(this).find("li.member");
                       var tempRT = {
                           resourceType:curLi.attr("data-id"),
                       }
                       selectedList.push(tempRT);
                   })

                   if(selectedList.length >0){
                     namespace.resource_type_associations=selectedList;
                   }
                   Common.xhr.postJSON("/v2/metadefs/namespaces", namespace, function (data) {
                       wizard._submitting = false;
                       wizard.updateProgressBar(100);
                       closeWizard();
                       Common.router.reload();
                   })
               });
            });

        });

        //绑定资源类型
        $("a.bind").on("click",function(){
            var namespace = $(this).attr("data");
            Common.xhr.ajax("/v2/metadefs/namespaces/"+namespace+"/resource_types",function(relatedType){
                var resourceTypeAssociations = relatedType.resource_type_associations;
                Common.render('tpls/ccenter/metadata/namespace/editBind.html',resourceTypeAssociations,function(html){
                    Modal.show({
                        title: '编辑资源绑定',
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

                                    Common.xhr.putJSON('/v2/metadefs/namespaces/'+name,namespaceMeta,function(data){
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
                            resourceTypeHandler.init(resourceTypeAssociations,"bindType")
                        }
                    });

                });
            })
        })

        //编辑按钮
        $("a.edit").on("click",function(){
            var name = $(this).attr("data");
            Common.xhr.ajax("/v2/metadefs/namespaces/"+name,function(namespace){
                Common.render('tpls/ccenter/metadata/namespace/edit.html',namespace,function(html){
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

                                    var namespaceMeta = {
                                        "name":$("#edit-name").val(),
                                        "value":$("#edit-tag-value").val()
                                    }
                                    Common.xhr.putJSON('/v2/metadefs/namespaces/'+name,namespaceMeta,function(data){
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
                    Common.xhr.del("/v2/metadefs/namespaces/"+data,
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