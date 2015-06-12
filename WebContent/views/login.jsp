<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="no-js">
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="renderer" content="webkit">
    <title>云海开放平台</title>
    <!-- stylesheets -->
    <link href="${pageContext.request.contextPath}/resources/lib/css/base.css" rel="stylesheet" type="text/css"/>
    <link href="${pageContext.request.contextPath}/resources/css/login/login.css" rel="stylesheet" type="text/css"/>
    <!-- scripts -->
    <script src="${pageContext.request.contextPath}/resources/lib/js/pubView.js" data-pub-root="${pageContext.request.contextPath}" data-require-base="${pageContext.request.contextPath}/resources"></script>
</head>
</head>

<body>
<div class="signin-box">
	<div class="signin-header">
		<div class="signin-title">
			<img class="signin-logo" alt="IOP Manager" src="${pageContext.request.contextPath}/resources/css/login/img/header-logo.png"/>
		</div>
	</div>
	<div class="signin-body">
		<form id="form-signin" class="form-signin" action="#" method="post">
			<input type="hidden" name="action" value="login" />
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-user">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input id="account" class="form-control" name="account" type="text" />
			</div>
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-pwd">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input class="form-control" type="hidden" name="password" value="" />
				<input id="password" class="form-control" name="password_org" type="password" />
			</div>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="remember_me" value="1" /> 记住密码
				</label>
				<label>
					<input type="checkbox" name="save_signin" value="1"> 自动登录
				</label>
			</div>
			<button id="signin-btn" type="button" class="btn btn-primary" onclick="submitForm()">登&emsp;&emsp;录</button>
		</form>
	</div>
	<i class="signin-stamp"></i>
</div>   
</body>
<script type="text/javascript">
require(['jq/form'], function() {
	$().ajaxSubmit({
		
	});
});
 function submitForm(){
	
}
 
 $(document).ready(function() {
	 document.getElementById('password').onkeydown=function(event){
		    var e = event || window.event || arguments.callee.caller.arguments[0];   
		     if(e && e.keyCode==13){ // enter 键
		    	 submitForm();
		    }
		}; 
	 document.getElementById('account').onkeydown=function(event){
		    var e = event || window.event || arguments.callee.caller.arguments[0];   
		     if(e && e.keyCode==13){ // enter 键
		    	 document.getElementById('password').focus();
		    }
		}; 
	//光标定位到账号输入框
	document.getElementById('account').focus();
	 });
</script>
</html>
