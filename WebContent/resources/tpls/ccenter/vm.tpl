<div class="page-header clearfix">
	<ol class="breadcrumb">
	  <li class="active">云主机列表</li>
	</ol>
</div>
<div class="page-body">
	<div class="pane">
		<div class="pane-content">
			<table class="table table-primary table-striped" id="VmTable">
				<thead>
					<tr>
						<th class="c1">
							<label><input type="checkbox" class="selectAll"></label>
						</th>
						<th class="c2">名称</th>
						<th class="c2">内部IP</th>
						<th class="c2">浮动IP</th>
						<th class="c3">配置</th>
						<th class="c1">激活</th>
						<th class="c2">可用域</th>
						<th class="c2">虚拟数据中心</th>
						<th class="c1">电源状态</th>
						<th class="c2">运行时间</th>
						<th class="c2 sorting_disabled">操作</th>
					</tr>
				</thead>
				<tbody>
				{{each data as item i}}
					<tr>
						<td><label><input type="checkbox"></label></td>
						<td>{{item.name}}</td>
						<td>{{item.inner_ip}}</td>
						<td>{{item.float_ip}}</td>
						<td>{{item.os_conf}}</td>
						<td>
			 			{{if item.active_status == 'actived'}}
			 				<span class="text-success">已激活</span>
			 				{{else}}
			 				<span class="text-danger">待激活</span>
			 			{{/if}}
			 			</td>
						<td>{{item.available_zone}}</td>
						<td>{{item.vdc}}</td>
						<td>
			 			{{if item.power_status == 'on'}}
			 				<span class="text-success">运行中</span>
			 				{{else}}
			 				<span class="text-danger">未启动</span>
			 			{{/if}}
			 			</td>
			 			<td>{{item.run_time}}</td>
						<td>
						<a class="btn-opt" data-toggle="tooltip" title="创建快照" data-act="stop"><i class="glyphicon glyphicon-off"></i></a>
						<a class="btn-opt" data-toggle="tooltip" title="控制台" data-act="delete"><i class="glyphicon glyphicon-trash"></i></a>	
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
