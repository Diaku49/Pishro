const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { GetAllServices, searchServices, GetServicesByName } = require('../prisma/prisma');
require('../prisma/prisma');
const cloudinary = require('../app');
const clearImage  = require('../util/ClearImage');

// get all services used by customers
exports.GetServices = async(req,res,next)=>{
try{
    const totalservices = await prisma.service.count();
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 8;
    const totalPages = Math.ceil(totalservices/perPage);
    // all services with count property
    const services = await GetAllServices(currentPage,perPage);
    if(!services){
        const error = new Error('empty.');
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        message:'All services Fetched.',
        services:services,
        totalPages:totalPages
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.searchServicesByName = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const name = req.body.name
    const totalservices = await prisma.service.count({
        where:{provider:{user:{name:name}}}
    });
    const currentPage = req.query.page || 1;
    const perPage = 8;
    const totalPages = Math.ceil(totalservices/perPage);
    // all services with count property
    const services = await GetServicesByName(currentPage,perPage,name);
    if(!services){
        const error = new Error('empty.');
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        message:'All services Fetched.',
        services:services,
        totalPages:totalPages
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.searchServices = async(req,res,next)=>{
try{
    const { title, serviceType, minPrice, maxPrice, minRating, maxRating, page, sortByBookingCount } = req.query;
    const {services,totalPages} = await searchServices({
        title,
            serviceType,
            minPrice,
            maxPrice,
            minRating,
            maxRating,
            page: parseInt(page) || 1,
            sortByBookingCount: sortByBookingCount === 'true',
    });
    res.status(200).json({
        message:'Fetched services.',
        services,
        totalPages,
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


// deatil of a service
exports.ServiceDetail = async(req,res,next)=>{
try{
    const serviceId = parseInt(req.params.serviceId);
    const service = await prisma.service.findFirst({
        where:{id:serviceId},
        select:{
            id:true,
            Rating:true,
            title:true,
            serviceType:true,
            description:true,
            price:true,
            providerId:true,
            image:true,
            uniqueImageId:true,
            provider:{select:{image:true,user:{select:{name:true,}}}},
            location:true,
            bookings:{select:{
                review:{select:{rating:true,comment:true,customer:{select:{user:{select:{name:true}}}}}}}
            },
            availability:{select:{
                id:true,
                dayOfWeek:true,
                startTime:true,
                endTime:true
            }},
            _count:{
                select:{bookings:true}
            }
        }
    });
    if(!service){
        const error = new Error('Service not found.');
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        message:'Fetched service Detail',
        service:service,
        bookCount:service._count.bookings
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.CreateService = async(req,res,next)=>{
try{
    const {type,typeId} = req;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    if(type !== 'Provider'){
        const error = new Error('not authroized.');
        error.statusCode = 403;
        throw error;
    };
    const {title,name,serviceType,description,location,price,image,uniqueImageId} = req.body;
    let Image = null;
    let UniqueImageId = null;
    if(image && uniqueImageId){
        Image = image;
        UniqueImageId = uniqueImageId;
    }
    console.log(typeId);
    const newservice = await prisma.service.create({
        data:{
            title:title,
            name:name,
            description:description,
            serviceType:serviceType,
            location:location,
            price:parseFloat(price),
            image:Image,
            uniqueImageId:UniqueImageId,
            providerId:typeId
        }
    });
    res.status(201).json({
        message:'Service created.',
        service:{id:newservice.id,title:newservice.title}
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.EditService = async(req,res,next)=>{
try{
    const {type,typeId} = req;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const serviceId = parseInt(req.params.serviceId);
    if(type !== 'Provider'){
        const error = new Error('not authroized.');
        error.statusCode = 403;
        throw error;
    };
    const ServiceEqual = await prisma.service.findFirst({
        where:{id:serviceId,providerId:typeId}
    });
    if(!ServiceEqual){
        const error = new Error('Forbbiden,you are not the provider of this service.');
        error.statusCode = 403;
        throw error;
    };
    const {title,name,serviceType,description,location,price,image,uniqueImageId} = req.body;
    let Image = ServiceEqual.image;
    let UniqueImageId = ServiceEqual.uniqueImageId;
    if(image && uniqueImageId){
        await cloudinary.uploader.destroy(UniqueImageId,{resource_type:'image'})
        // await clearImage(ServiceEqual.image);
        Image = image;
        UniqueImageId = uniqueImageId;
    }
    await prisma.service.update({
        where:{id:serviceId},
        data:{
            title:title,
            name:name,
            description:description,
            serviceType:serviceType,
            location:location,
            price:parseFloat(price),
            image:Image,
            uniqueImageId:UniqueImageId
        }
    });
    res.status(200).json({
        message:'Service Updated.',
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.DeleteService = async(req,res,next)=>{
try{
    const {typeId,type} = req;
    const serviceId = parseInt(req.params.serviceId);
    if(type !== 'Provider'){
        const error = new Error('not authroized.');
        error.statusCode = 403;
        throw error;
    };
    const ServiceEqual = await prisma.service.findFirst({
        where:{id:serviceId,providerId:typeId}
    });
    if(!ServiceEqual){
        const error = new Error('Forbbiden,you are not the provider of this service.');
        error.statusCode = 403;
        throw error;
    };
    await cloudinary.uploader.destroy(ServiceEqual.uniqueImageId,{resource_type:"image"});

    await prisma.service.delete({where:{id:ServiceEqual.id}});
    res.status(200).json({
        message:'Service deleted.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}