define(['Common','bs/wizard','bs/tooltip'],function(Common){
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
     //   $("[data-toggle='tooltip']").tooltip();

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
            //获取数据
        };
        var currentChosenObj = {
            type: null,	//虚拟环境类型
            version: null,
            vendor: null,	//提供者
            region: null,//地区
        };

        //重置CurrentChosenObj对象
        var resetCurrentChosenObj = function(){
            for(var key in currentChosenObj){
                currentChosenObj[key] = null;
            }
            currentChosenObj.nums = 1;
        }

        //创建按钮
        $("#VirtualEnvTable_wrapper span.btn-add").on("click",function(){
            Common.render('tpls/cresource/env/add.html',renderData,function(html){

                $('body').append(html);
                //同步currentChosenObj
                currentChosenObj.type = $('select.select-env-type').children('option:selected');
                //wizard show
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
                debugger;
                wizard.show();
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