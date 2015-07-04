<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="no-js">
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>未授权</title>
</head>
</head>

<body>

错误代码:<%=request.getAttribute("error_code") %>
<br>
错误描述：<%=request.getAttribute("error_desc") %>
</body>
</html>
