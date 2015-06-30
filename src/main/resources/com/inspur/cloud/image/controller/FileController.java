package com.inspur.cloud.image.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.ModelAndView;

import com.inspur.cloudframework.utils.web.ModelAndViewUtils;

@Controller
@RequestMapping(value="/imageFiles")
public class FileController {
	
	
	@RequestMapping(value="/{name}" , method=RequestMethod.GET)
	public ModelAndView getFile(@PathVariable String name, HttpServletRequest request, HttpServletResponse response){
		try {
			RequestAttributes ra = RequestContextHolder.getRequestAttributes();  
			HttpServletRequest req = ((ServletRequestAttributes)ra).getRequest(); 
			String uploadPath = req.getServletContext().getRealPath("/")+"imageFiles/";
			
            File file = new File(uploadPath + name);
            FileInputStream fis = new FileInputStream(file);
            
            // 清空response
            response.reset();
            // 设置response的Header
            response.addHeader("Content-Disposition", "attachment;filename=" + new String(name.getBytes()));
            response.addHeader("Content-Length", "" + file.length());
            response.setContentType("application/octet-stream");
            
            OutputStream toClient = new BufferedOutputStream(response.getOutputStream());
            byte bytes[] = new byte[100];
            int len;
            while ((len = fis.read(bytes)) > 0){
            	toClient.write(bytes, 0, len);
            }
            fis.close();
            toClient.flush();
            toClient.close();
		} catch (IOException e) {
			throw new RuntimeException("导出文件时出现错误！请稍后再试",e);
		}
		return ModelAndViewUtils.success(true);
	}

}
