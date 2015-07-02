define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    var hash = Common.hash;

    var varlist = hash.split('/');
    var id = varlist[varlist.length-1]
    Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('compute/v2/123/flavors/'+id+'/metadata', function(data){

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

        var renderData = {};
        renderData['tags']=''
        renderData['flavor_namespaces']=''
        renderData['properties'] = []
        var DataGetter = {
            getNameSpace: function(){
                Common.xhr.ajax('resources/data/namespaces.txt', function(data){
                    var namespaces = data['namespaces']
                    var flavor_namespaces = []
                    for(var i=0; i<namespaces.length; i++){
                        var namespace = namespaces[i]
                        if(!namespace['resource_type_associations'])
                            continue
                        var resource_type_associations = namespace['resource_type_associations']
                        for(var j=0; j<resource_type_associations.length; j++){
                            var resource_type_association = resource_type_associations[j]
                            if(resource_type_association['name'] == 'OS::Nova::Flavor'){
                                namespace['name'] = namespace['display_name']
                                namespace['id'] = namespace['namespace']
                                flavor_namespaces.push(namespace)
                            }
                        }
                    }
                    renderData['flavor_namespaces'] = flavor_namespaces
                })
            },
            getNamespaceProperties: function(namespace){
                //Common.xhr.ajax('resources/data/'+namespace+'/tags.txt', function(data)
                Common.xhr.ajax('resources/data/hostMetadata.txt', function(data){
                    var objects = data['objects']
                    var properties = data['properties']
                    var tags = data['tags']
                    if(properties)
                        renderData['properties'] = properties;
                    if(objects){
                        for(var i=0; i<objects.length; i++){
                            var objects_por = objects[i]['properties']
                            for(var key in objects_por){
                                renderData['properties'][key] = objects_por[key]
                            }
                        }
                    }
                    if(tags){
                        for(var i=0; i<tags.length; i++){
                            var tag ={'type':'tag'}
                            renderData['properties'][tags[i]['name']] = tag
                        }
                    }
                    EventsHandler.setProperties();

                });
            }


        }
        DataGetter.getNameSpace()
        var EventsHandler = {
            //虚拟化环境change事件
            namespacesChange: function () {
                $('select.select-namespace').change(function(){
                    var namespace = $('select.select-namespace').children('option:selected').val();

                    DataGetter.getNamespaceProperties(namespace);

                });

            },

            propertiesChange: function() {
                $('select.select-key').change(function(){
                    EventsHandler.setPropertiesInput()
                });

            },

            setProperties: function(){
                 if(renderData['properties']){
                      var properties = renderData['properties']
                      var option =[]
                      for(var tag in properties){
                          var str = '<option  id='+tag+' value=' +tag+'>'+tag+'</option>'
                          option.push(str)
                      }
                      $('#select-key').html(option.join(''))
                      $('#value_div').html('')
                      $('#operation_group').html('')

                      EventsHandler.setPropertiesInput()
                 }
            },

            setPropertiesInput:function(){
                $('#value_div').html('')
                $('#operation_group').html('')
                var property_key = $('select.select-key').children('option:selected').val();
                var property = renderData['properties'][property_key]
                if(property['type'] == 'string'){
                    //insert operation
                    var operation_lab_str = '<label for="operator" class="control-label col-sm-2"><span>* </span>操作：</label>'
                   // $('#operation_group').html(operation_lab_str)
                    var operation_str = '<div class="col-sm-9 col-sm"><select name="operator" id="operator" class="form-control select operator"></select></div>'
                    $('#operation_group').html(operation_lab_str+operation_str)
                    var opt_items = property['operators']
                    var option = []
                    var items = property['enum']

                    //only has or operation
                    //more than one operation, add operation input
                    for(var i=0; i<opt_items.length; i++) {
                        var item = opt_items[i].substring(1,opt_items[i].length-1)
                        var str = '<option  id='+item+' value=' +item+'>'+item+'</option>'
                        option.push(str)
                    }
                    $('#operator').html(option)
                    //
                    if(opt_items.length == 1){
                        var values =[]
                        var str = ' <select name="value" id="value" class="form-control select value"></select>'
                        $('#value_div').html(str)
                        for(var i=0; i<items.length; i++) {
                            var str = '<option  id='+items[i]+' value=' +items[i]+'>'+items[i]+'</option>'
                            values.push(str)
                        }
                        $('#value').html(values.join(''))
                        return
                    }

                    //insert select item
                    var str = $('<div class="choose-value choose-style  clearfix"  id="value"></div>');
                    $('#value_div').append(str);

                    var option = []
                    var items = property['enum']
                    require(['js/common/choose'],function(choose){
                        var options = {
                            selector: '#value',
                            allData:items
                        };
                        choose.initChoose(options);
                    });

                }

                if(property['type'] == 'array' ){

                }
                if(property['type'] == 'integer' ){
                    var str = '<input type="text" class="form-control" id="value" name="value" >'
                    $('#value_div').html(str)
                }

                if(property['type'] == 'tag'){
                    var str = '<input type="text" class="form-control" id="value" name="value" >'
                    $('#value_div').html(str)
                }
            }

        }

        $("#metadataTable_wrapper span.btn-add").on("click",function(){
            DataGetter.getNameSpace()
            //需要修改为真实数据源
            Common.render('tpls/ccenter/vmtype/addMetadata.html',renderData,function(html){
                Modal.show({
                    title: '创建元数据',
                    message: html,
                    nl2br: false,
                    buttons: [{
                        label: '保存',
                        action: function(dialog) {
                            var namespace = $("#add_metadata [name='select-namespace']").val()
                            var key = $("#add_metadata [name='select-key']").val()
                            var value = $("#add_metadata [name='value']").val()
                            var metadata = {
                                "extra_specs":{
                                }
                            };
                            metadata['extra_specs'][key] = value
                            Common.xhr.postJSON('compute/v2/123/flavors/'+id+'/metadata',metadata,function(data){
                                if(data){
                                    alert("保存成功");

                                    dialog.close();
                                }else{
                                    alert("保存失败");
                                }
                            })
                        }
                    }],
                    onshown : function(){
                        DataGetter.getNameSpace()
                        DataGetter.getNamespaceProperties(renderData['flavor_namespaces'][0])
                        //DataGetter.setProperties();
                        EventsHandler.namespacesChange()
                        EventsHandler.propertiesChange()
                    }
                });
            })
        });

        $(".updateMetadata").on("click",function(){
            var str = $(this).attr("data")
            var key = str.split(',')[0]
            var value = str.split(',')[1]
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
                                    var key = $("#editMetadata [name='key']").val()
                                    var value = $("#editMetadata [name='value']").val()
                                    var metaData = {
                                        extra_specs : {

                                        }
                                    };
                                    metaData['extra_specs'][key] = value

                                    Common.xhr.postJSON('compute/v2/123/flavors/'+id+'/metadata', metaData, function (data) {
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
                        Common.xhr.del('compute/v2/123/flavors/'+id+'/metadata/'+key,
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
