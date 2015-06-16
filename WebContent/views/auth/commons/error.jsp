<%@page import="java.io.PrintWriter"%>
<%@page import="java.io.StringWriter"%>
<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" isELIgnored="false" isErrorPage="true"%>
<%@page import="org.springframework.security.core.context.SecurityContextHolder"%>
<%@page import="java.util.Map"%>
<%@page import="com.google.common.collect.Maps"%>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper"%>
<%@ page import="org.springside.modules.utils.spring.SpringContextHolder"%>
<% 
	//response.addHeader("content-type", "application/json");
	//response.setContentType("application/json");
	//response.setHeader("Content-Disposition", "attachment; filename=exception"); 
	Map model = Maps.newHashMap(); 
	model.put("success", false);
	StringWriter sw = new StringWriter();  
    PrintWriter pw = new PrintWriter(sw);  
    exception.printStackTrace(pw);  
    Map exceptionMap = Maps.newHashMap();
    exceptionMap.put("_exception", sw.toString());
	model.put("data", exceptionMap);
	ObjectMapper objectMapper = (ObjectMapper) SpringContextHolder.getBean("objectMapper");
	//objectMapper.writeValue(System.out, model);
	objectMapper.writeValue(out, model);
	//out.clear();
	//out = pageContext.pushBody();
	
%>