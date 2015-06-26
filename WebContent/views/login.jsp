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
		<form id="login_form" class="form-signin" action="/identity/v2.0/tokens" method="post">
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-user">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input id="loginName" class="form-control" name="loginName" type="text" value="admin"/>
			</div>
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-pwd">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input id="password" class="form-control" name="password" type="password" value="123456a?"/>
			</div>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="remember_me" value="1" /> 记住密码
				</label>
				<label>
					<input type="checkbox" name="save_signin" value="1"> 自动登录
				</label>
			</div>
			<button id="signin-btn" type="button" class="btn btn-primary" >登&emsp;&emsp;录</button>
		</form>
	</div>
	<i class="signin-stamp"></i>
</div>   
</body>
<script type="text/javascript">

	require(['json'], function(JSON) {
		
		$(document).on('keydown', '#password', function() {
			var e = event || window.event || arguments.callee.caller.arguments[0];
			if (e && e.keyCode == 13) { // enter 键
				submitForm();
			}
		});
		$(document).on('keydown', '#loginName', function() {
			var e = event || window.event || arguments.callee.caller.arguments[0];
			if (e && e.keyCode == 13) { // enter 键
				document.getElementById('password').focus();
			}
		});
		//光标定位到账号输入框
		document.getElementById('loginName').focus();
		
		$(document).on('click', '#signin-btn', function() {
			submitForm();
		});
		function submitForm() {
			var url = "${pageContext.request.contextPath}/identity/v2.0/tokens";
			var data = {
					 'auth': {
					        'tenantId': "",
					        'passwordCredentials': {
					            'username': $('#loginName').val(),
					            'password':  $('#password').val()
					        }
					    }
			}
			$.ajax({
	            'type': 'POST',
	            'url': url,
	            'data': JSON.stringify(data),
	            'dataType': 'json',
		        'contentType': 'application/json',
	            'success': callbackSuccess,
	            'error':callbackErr
	        });
		}
		function callbackSuccess(res){
			if(res != null && res.error_code == null && res.access.token != null){
				window.location.href="${pageContext.request.contextPath}";
			}else{
				alert("错误代码："+res.error_code+"\n错误描述: "+res.error_desc);
			}
		}
		function callbackErr(res){
			alert("登录失败！"+res);
		}
	});
</script>
</html>
