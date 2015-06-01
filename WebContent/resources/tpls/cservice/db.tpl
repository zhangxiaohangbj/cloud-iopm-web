<div class="page-header clearfix">
	<ol class="breadcrumb">
	  <li class="active">关系型数据库列表</li>
	</ol>
</div>
<div class="page-body">
	<div class="pane">
		<div class="pane-content">
			<table class="table table-primary table-striped" id="DbTable">
				<thead>
					<tr>
						<th class="c2">
							<label><input type="checkbox" class="selectAll"></label>
						</th>
						<th class="c3">名称</th>
						<th class="c5">描述</th>
						<th class="c2">激活状态</th>
						<th class="c3">创建时间</th>
						<th class="c5 sorting_disabled">操作</th>
					</tr>
				</thead>
				<tbody>
				{{each data as item i}}
					<tr>
						<td><label><input type="checkbox"></label></td>
						<td>{{item.name}}</td>
						<td>{{item.desc}}</td>
						<td>
			 			{{if item.check == 'approved'}}
			 				<span class="text-success">已通过</span></td>
			 				{{else}}
			 				<span class="text-danger">未通过</span></td>
			 			{{/if}}
						<td>{{item.time}}</td>
						<td>
						{{if item.status == 'running'}}
			 				<a class="btn-opt" data-toggle="tooltip" title="停止" data-act="stop"><i class="glyphicon glyphicon-off"></i></a>
			 				{{else if item.status == 'stopped'}}
			 				<a class="btn-opt" data-toggle="tooltip" title="启动" data-act="start"><i class="glyphicon glyphicon-play-circle"></i></a>
			 				{{else}}
			 				<a class="btn-opt" data-toggle="tooltip" title="重启" data-act="start"><i class="glyphicon glyphicon-play-circle"></i></a>
			 			{{/if}}
						<a class="btn-opt" data-toggle="tooltip" title="删除" data-act="delete"><i class="glyphicon glyphicon-trash"></i></a>	
						</td>
					</tr>
    			{{/each}}
				</tbody>
				<tfoot>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>
	</div>
</div>
