package com.inspur.cloud.image.controller;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import org.springside.modules.orm.Page;

import com.inspur.cloud.image.entity.Image;
import com.inspur.cloud.image.service.ImageService;
import com.inspur.cloudframework.spring.web.servlet.ModelAndView;
import com.inspur.cloudframework.utils.web.ModelAndViewUtils;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiParam;

/**
 * image controller layer
 * @author Administrator
 * @version V1.2.0  May 21, 2015 4:48:31 PM
 */
@Controller
@RequestMapping(value="/image/v2/{tenant_id}/images")
@Api(value = "Images", description = "Creates, lists, updates, and deletes images etc.")
public class ImageController {
	@Autowired
    private ImageService service;
	
	@RequestMapping(value="/fileUpload", method=RequestMethod.POST)
	public String handleFormUpload(@RequestParam("name") String name,MultipartFile file) throws IOException
	{
		if(!file.isEmpty())
		{
			String filename = file.getOriginalFilename();
			System.out.println(filename);
			
			byte[] bytes = file.getBytes();
			
			return "uploadSuccess";
		}
		else
			return "uploadFailed";
	}
	
	@RequestMapping(value="/fileUpload2", method=RequestMethod.POST)
	public String handleFormUpload2(@RequestParam("name") String name,
									@RequestPart Part file) throws IOException
	{
		RequestAttributes ra = RequestContextHolder.getRequestAttributes();  
		HttpServletRequest req = ((ServletRequestAttributes)ra).getRequest(); 
		if(file.getSize() != 0)
		{
			/*
			 * 取得"/"表示的tomcat中的实际路径
			 * http://<host>:<port>/<contextPath>/index.html would be mapped, 
			 * where <contextPath> corresponds to the context path of this ServletContext. 
			 */
			String uploadPath = req.getServletContext().getRealPath("/");
			System.out.println("------ upLoadPath:" + uploadPath + " ------");
			
			//从header中解译出上传的文件名
			String value = file.getHeader("content-disposition");
			System.out.println("------ value:" + value + " ------");
			
			String filename = value.substring(value.lastIndexOf("=") + 2, value.length() - 1);
			System.out.println("------ filename:" + filename + " ------");
			
			//end
			System.out.println("------ the file size is:" + file.getSize() + "B ------");
			System.out.println("------ " + file.getName() + " ------");
			
			//将文件写到硬盘上
			file.write(uploadPath + filename);
			
			return "uploadSuccess";
		}
		else
			return "uploadFailed";
	}
	
	/**
	 * create a new image by upload file
	 * @param entity:entity of the created image
	 * @return     
	 * May 21, 2015 4:48:48 PM
	 */
    @RequestMapping(value="/upload", method = RequestMethod.POST)
    @ApiOperation(
    	value = "create image",
    	notes = "create a image",
    	response = Image.class
    )
	public ModelAndView<Image> create(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			MultipartFile file,
			@RequestParam("name") String name,
			@RequestParam("description") String description,
			@RequestParam("locations") String locations,
			@RequestParam("diskFormat") String diskFormat,
			@RequestParam("minDisk") String minDisk,
			@RequestParam("minRam") String minRam,
			@RequestParam("isPublic") String isPublic,
			@RequestParam("isProtected") String isProtected){
    	try{
    		if(!file.isEmpty()){
    			RequestAttributes ra = RequestContextHolder.getRequestAttributes();  
    			HttpServletRequest req = ((ServletRequestAttributes)ra).getRequest(); 
    			String uploadPath = req.getServletContext().getRealPath("/")+"imageFiles/";
//    			String fileName = file.getOriginalFilename();
    			String fileName = UUID.randomUUID().toString();
    			
    			byte[] buffer = file.getBytes();
    			
    			FileOutputStream fs = new FileOutputStream(uploadPath+fileName);
    			fs.write(buffer, 0, buffer.length);
    			
    			String path = req.getContextPath();  //输出内容:"/cloud-web"
    			String basePath = req.getScheme()+"://"+req.getServerName()+":"+req.getServerPort()+path+"/";    //输出内容:"http://localhost:8089/cloud-web/"
    			locations = basePath+"imageFiles/"+fileName;
    		}
    	}catch(Exception e){}
    	
    	Map properties = new HashMap();
    	properties.put("description", "description");
    	
    	Image entity = new Image();
    	entity.setVdcId(tenant_id);
    	entity.setName(name);
    	entity.setLocations(locations);
    	entity.setDiskFormat(diskFormat);
    	entity.setMinDisk(Integer.parseInt(minDisk));
    	entity.setMinRam(Integer.parseInt(minRam));
    	entity.setIsPublic("1".equals(isPublic)?true:false);
    	entity.setIsProtected("1".equals(isProtected)?true:false);
    	
    	entity.setContainerFormat("BARE");
    	entity.setStatus("queued");
    	entity.setImageType("image");
    	
    	entity.setProperties(properties);
    	service.create(entity);
        return ModelAndViewUtils.success(entity);
    }
    
    /**
     * delete a image
     * @param id:id of the deleted image
     * @return     
     * May 21, 2015 4:48:00 PM
     */
	@RequestMapping(value="/{id}", method = RequestMethod.DELETE)
	@ApiOperation(
	    value = "Delete image",
	    notes = "Delete a image.",
	    response = Boolean.class
    )
	public ModelAndView delete(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@ApiParam(value = "the id of deleted image",required = false)
			@PathVariable String id) {
		service.delete(id);
		return ModelAndViewUtils.success(true);
	}
	
	/**
     * delete images by ids
     * @param id:id of the deleted image
     * @return     
     * May 21, 2015 4:48:00 PM
     */
	@RequestMapping(value="/ids/{ids}", method = RequestMethod.DELETE)
	@ApiOperation(
	    value = "Delete images",
	    notes = "Delete images.",
	    response = Boolean.class
    )
	public ModelAndView deleteByIds(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@ApiParam(value = "the ids of deleted images,eg: 1,2,3",required = false)
			@PathVariable String ids) {
		service.deleteByIds(ids);
		return ModelAndViewUtils.success(true);
	}
	
	/**
	 * get a image
	 * @param id:id of the image
	 * @return     
	 * May 21, 2015 4:49:21 PM
	 */
	@RequestMapping(value = "/{id}" ,method = RequestMethod.GET )
	@ApiOperation(
	    value = "Get image",
	    notes = "Get a image.",
	    response = Image.class
    )
	public ModelAndView get(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@ApiParam(value = "the id of image",required = false)
			@PathVariable String id) {
		return ModelAndViewUtils.success(service.get(id));
	}
	
	/**
	 * get list of image
	 * @param params:filter params
	 * @return     
	 * May 21, 2015 4:49:34 PM
	 */
	@RequestMapping(value="" , method=RequestMethod.GET)
	@ApiOperation(
        value = "List images",
        notes = "Lists public virtual machine (VM) images and snapshots.",
        response = Image.class
    )
	public ModelAndView list(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@ApiParam(value = "owner:tenant of images;imageType:valid values is image,snapshot;name:the name of images",required = false)
			@RequestParam Map<String, Object> params){
		List<Image> list = service.list(params);
		return ModelAndViewUtils.success(list);
	}
	
	/**
	 * get the page search
	 * @param pageNo
	 * @param pageSize
	 * @param map
	 * @return     
	 * May 21, 2015 4:49:49 PM
	 */
	@RequestMapping(value="/page/{pageNo}/{pageSize}", method=RequestMethod.GET)
	public ModelAndView queryPage(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@PathVariable int pageNo, @PathVariable int pageSize, @RequestParam Map<String, Object> map){
		Page<Image> page = new Page<Image>(pageSize);
		page.setPageNo(pageNo);
		return ModelAndViewUtils.success(service.queryPage(page, map));
	}
	
	/**
	 * update a image
	 * @param entity
	 * @return     
	 * May 21, 2015 4:50:00 PM
	 */
	@RequestMapping(value = "/{id}" ,method = RequestMethod.PUT )
	@ApiOperation(
	    value = "Update image",
	    notes = "Update a image.",
	    response = Image.class
    )
	public ModelAndView update(
			@ApiParam(value = "ID of tenant", required = true) @PathVariable String tenant_id,
			@ApiParam(value = "the id of image",required = true) @PathVariable String id,
			@RequestBody Image entity) {
		entity.setId(id);
		return ModelAndViewUtils.success(service.update(entity));
	}
}
