<div class="wizard" id="create-server-wizard" data-title="创建服务器">
			<!-- 基本信息 -->
			<div class="wizard-card" data-cardname="basci">
				<h3>基本信息</h3>
				<div class="wizard-card-content col-sm-8">
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-2"><span>* </span>名称：</label>
							<div class="col-sm-7 col-sm">
								<input type="text" class="wizard-form-control" id="server-name" name="server-name" placeholder="服务器名称">
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-desc" class="control-label col-sm-2"><span>* </span>镜像：</label>
							<div class="col-sm-9 col-sm">
								<ul class="nav nav-pills image-source">
								  <li class="active"><a href="javascript:void(0)"  data-image="image">镜像</a></li>
								  <li><a href="javascript:void(0)"  data-image="snapshot">快照</a></li>
								  <li><a  href="javascript:void(0)" data-image="disk">云硬盘</a></li>
								  <li><a  href="javascript:void(0)" data-image="disksnap">云硬盘快照</a></li>
								</ul>
								<div class="image-list">
									
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="wizard-card-desc col-sm-4">
					<p>镜像：选择创建你的云主机所用的镜像。其中，从镜像创建是指从不同类型操作系统的镜像文件创建，另外可选择是否创建一个新磁盘；
						从快照创建是指从云主机的快照创建；
						从云硬盘创建是指从一个通过云主机创建的云硬盘来创建云主机，云硬盘会被挂载到云主机上；</p>
				</div>
			
			</div>
			
			<!--详细信息 -->
			<div class="wizard-card" data-cardname="detail">
				<h3>详细配置</h3>
				<div class="wizard-card-content col-sm-8">
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-3"><span>* </span>虚拟数据中心：</label>
							<div class="col-sm-7 col-sm">
								<select  class="wizard-form-control select select-vdc">
								</select>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-3"><span>* </span>可用域：</label>
							<div class="col-sm-7 col-sm">
								<select class="wizard-form-control select select-available-zone">
								  <option>input-section1</option>
								  <option>input-section2</option>
								  <option>input-section3</option>
								  <option>input-section4</option>
								  <option>input-section5</option>
								</select>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-3"><span>* </span>云主机规格：</label>
							<div class="col-sm-7 col-sm">
				                    <select  class="wizard-form-control select select-specs" tabindex="5">
				                    </select>
							</div>
							<div class="col-sm-2 col-sm config-detail-info">
								<i data-toggle="popver" class="fa fa-info-circle"></i>
							</div>
						</div>
					</div>
					
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-3"><span>* </span>云主机数量：</label>
							<div class="col-sm-7 col-sm">
								<div class="spinbox" data-initialize="spinbox" id="setVmNums">
								  <input type="text" style="height:35px;" value="1" class="wizard-form-control input-mini spinbox-input">
								  <div class="spinbox-buttons btn-group btn-group-vertical">
								    <button type="button" class="btn btn-default spinbox-up btn-xs">
								      <span class="glyphicon glyphicon-chevron-up"></span><span class="sr-only">Increase</span>
								    </button>
								    <button type="button" class="btn btn-default spinbox-down btn-xs">
								      <span class="glyphicon glyphicon-chevron-down"></span><span class="sr-only">Decrease</span>
								    </button>
								  </div>
								</div>
							</div>
						</div>
					</div>
					
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="server-name" class="control-label col-sm-3">配额：</label>
							<div class="col-sm-7 col-sm">
								<div class="progress">
								  <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;">
								    60%
								  </div>
								</div>
								<div class="progress">
								  <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%">
								    <span class="sr-only">20% Complete</span>
								  </div>
								</div>
								<div class="progress">
								  <div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: 80%">
								    <span class="sr-only">80% Complete (danger)</span>
								  </div>
								</div>
							</div>
						</div>
					</div>
					
				</div>
				<div class="wizard-card-desc col-sm-4">
					<p>属性的单选或多选框都能被赋予合适的样式。对于和多选或单选框联合使用的标签希望将悬停于上方的鼠标设置为“禁止点击”的样式</p>
				</div>
			</div>
			
			
			
			<!-- 网络  -->
			<div class="wizard-card wizard-card-overlay" data-cardname="networks">
			<h3>网络</h3>
				<div class="wizard-card-content col-sm-8">
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="available-network" class="control-label col-sm-2"><span>* </span>可用网络：</label>
							<div class="col-sm-9 col-sm">
								<div class="list-group available-network">
								</div>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="chosen-network" class="control-label col-sm-2"><span>* </span>已选网络：</label>
							<div class="col-sm-9 col-sm">
								<div class="list-group">
								</div>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="network-name" class="control-label col-sm-2"><span>* </span>网卡名称：</label>
							<div class="col-sm-7 col-sm">
								<input type="text" class="wizard-form-control" id="network-name" name="network-name" placeholder="网卡名称">
							</div>
						</div>
					</div>
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="sub-network" class="control-label col-sm-2"><span>* </span>指定子网：</label>
							<div class="col-sm-7 col-sm">
								<select class="wizard-form-control">
								  <option>默认子网</option>
								  <option>input-section2</option>
								  <option>input-section3</option>
								  <option>input-section4</option>
								  <option>input-section5</option>
								</select>
							</div>
						</div>
					</div>
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="network-ip" class="control-label col-sm-2"><span>* </span>指定IP：</label>
							<div class="col-sm-7 col-sm">
								<select class="wizard-form-control">
								  <option>DHCP默认</option>
								  <option>172.168.1.2</option>
								  <option>172.168.1.3</option>
								  <option>172.168.1.4</option>
								  <option>172.168.1.5</option>
								</select>
							</div>
						</div>
					</div>
					
					
				</div>
				
				
				<div class="wizard-card-desc col-sm-4">
					<p>网卡：
						通过按按钮或者拖拽释放来在选择可用网络中选择网络,当然也可以通过拖拽释放来改变nic的顺序.
						选择网卡后，可指定子网和IP。
						默认情况下，自动选择子网和DHCP方式</p>
				</div>
			</div>
			<div class="wizard-card wizard-card-overlay" data-cardname="security">
				<h3>访问安全</h3>
				<div class="wizard-card-content col-sm-8">
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="login" class="control-label col-sm-2"><span>* </span>登陆信息：</label>
							<div class="col-sm-9 col-sm">
								<ul class="nav nav-pills">
								  <li class="active"><a href="javascript:void(0)"  data-image="image">密钥</a></li>
								  <li><a href="javascript:void(0)"  data-image="snapshot">密码</a></li>
								</ul>
								<div class="login-info">
									<div class="usr clearfix">
					                  <label class="col-sm-2" for="login-name">用户名: </label>
					                  <div class="col-sm-9 col-sm">
					                  	 <input type="text" value="root"  class="wizard-form-control" id="login-name" name="login-name">
					                  </div>
					                </div>
					                <div class="pwd clearfix">
					                  <label  class="col-sm-2" for="login-key">密钥: </label>
					                  <input type="password" class="input-pwd hide" placeholder="请输入密码">
					                  <span class="text-danger" style="line-height:30px;">暂无密钥, <a href="javascript:;"> 创建密钥</a></span>
					                </div>
								</div>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label class="control-label col-sm-2"><span>* </span>安全组：</label>
							<div class="col-sm-9  security-group">
								<label><input type="checkbox" class="selectAll"> Security Group1</label>
								<label><input type="checkbox" class="selectAll"> Security Group2</label>
								<label><input type="checkbox" class="selectAll"> Security Group3</label>
								<label><input type="checkbox" class="selectAll"> Security Group4</label>
							</div>
						</div>
					</div>
				</div>
				<div class="wizard-card-desc col-sm-4">
					<p>登陆信息：选择登陆系统的方式，密钥或密码选择其中一种。如果是windows系统，只能选择密码的方式。</p>
					<p>安全组：通过安全组控制你的云主机的访问权限</p>
				</div>
			</div>

			<div class="wizard-card" data-cardname="senior">
				<h3>高级设置</h3>
				<div class="wizard-card-content col-sm-8">
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="scripts" class="control-label col-sm-2"><span>* </span>自定义脚本：</label>
							<div class="col-sm-9 col-sm">
								<textarea class="wizard-form-control" rows="8"  id="scripts" name="scripts" placeholder=""></textarea>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="scripts" class="control-label col-sm-2"><span>* </span>上传：</label>
							<div class="col-sm-9 col-sm">
								<button type="button" class="btn btn-info">上传脚本</button>
							</div>
						</div>
					</div>
					
					<div class="wizard-input-section">
						<div class="form-group">
							<label for="scripts" class="control-label col-sm-2"><span>* </span>磁盘分区：</label>
							<div class="col-sm-9 col-sm">
								<label>
		                            <input name="radio-auto"  class="icheck-success" value="auto" type="radio">
		                            	自动
	                        	</label>
	                        	<label>
		                            <input name="radio-non-auto"  class="icheck-success" value="non-auto" type="radio">
		                            	手动
	                        	</label>
							</div>
						</div>
					</div>
				</div>
				<div class="wizard-card-desc col-sm-4">
					<p>自定义脚本：云主机创建后执行的脚本。</p>
					<p>磁盘分区：自动：全部磁盘是一个分区，自动调整大小。手动：快速创建，但是需要手动分区。</p>
				</div>
			</div>
			
		</div>