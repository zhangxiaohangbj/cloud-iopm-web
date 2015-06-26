<%@page import="com.inspur.cloud.vdc.entity.Vdc"%>
<%@page import="com.inspur.cloud.am.entity.Token"%>
<%@page import="com.inspur.cloud.am.SessionUtil"%>
<%@page import="com.inspur.cloud.am.entity.User"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="no-js">
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>云海开放平台</title>
</head>
<body>
<%
//当前用户entity
User user = SessionUtil.user.get();
out.print(user);
out.print("<hr>");

//当前tokenId
String tokenId = SessionUtil.tokenId.get();
out.print(tokenId);
out.print("<hr>");

//当前token entity
Token token = SessionUtil.token.get();
out.print(token);
out.print("<hr>");

//当前 vdc entity
Vdc vdc = SessionUtil.vdc.get();
out.print(vdc);
out.print("<hr>");
%>
</body>
</html>
