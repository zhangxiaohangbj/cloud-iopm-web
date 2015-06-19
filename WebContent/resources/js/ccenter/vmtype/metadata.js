define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    var hash = Common.hash;

    var varlist = hash.split('/');
    var id = varlist[varlist.length-1]
    Common.requestCSS('css/wizard.css');
	var init = function(){


		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('/v2/123/flavors/'+id+'/metadata', function(data){

            var metadata = data['extra_specs']
           Common.render(true,'tpls/ccenter/vmtype/metadata.html',data,function(){
                bindEvent();
            });
        })

	};
	
	var bindEvent = function(){
        Common.initDataTable($('#metadataTable'),function($tar){
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创建元数据</span>'
            );
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-danger">删除元数据</span>'
            );

            Common.$pageContent.removeClass("loading");
        });
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

        $(".updateMetadata").on("click",function(){
            var str = $(this).attr("data")
            var key = str.split(',')[0]
            var value = str.split(',')[1]
            debugger
            var data = {}
            data['key'] = key
            data['value'] = value
            more.updateMetadata(data);
        });

        $("ul.dropdown-menu a.removeMetadata").on("click",function(){
            more.deleteMetadata($(this).attr("data"));
        });

        var more = {
            //更新元数据
            updateMetadata: function (data) {
                    Common.render('tpls/ccenter/vmtype/editMetadata.html', data, function (html) {
                        Modal.show({
                            title: '编辑',
                            message: html,
                            nl2br: false,
                            buttons: [{
                                label: '保存',
                                action: function (dialog) {
                                    debugger
                                    var key = $("#editMetadata [name='key']").val()
                                    var value = $("#editMetadata [name='value']").val()
                                    var metaData = {
                                        "extra_specs":{
                                            "key1" : "value1",
                                            "key2" : "value2"
                                        }

                                    };

                                    Common.xhr.postJSON('/v2/123/flavors/'+id+'/metadata', metaData, function (data) {
                                        if (data) {
                                            alert("保存成功");

                                            dialog.close();
                                        } else {
                                            alert("保存失败");
                                        }
                                    })
                                }
                            }],
                            onshown: function () {

                            }
                        });
                    });

            },

            deleteMetadata : function(key){
                Modal.confirm('确定要删除该云主机类型元数据吗?', function(result){
                    if(result) {
                        alert(id)
                        debugger
                        Common.xhr.del('/v2/123/flavors/'+id+'/metadata/'+key,
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

            }


        }

	};

	return {
		init : init
	}
});
