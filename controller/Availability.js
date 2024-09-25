const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { Login, Logout, GetAllServices, CheckAvail } = require('../prisma/prisma');
require('../prisma/prisma');
const path = require('path');




exports.getAllAvail = async(req,res,next)=>{
try{
    const {userId,type} = req;
    const allAvailability = await prisma.availability.findMany({
        where:{providerId:userId},
        include:{service:{select:{title,price,serviceType}}}
    });
    res.status(200).json({
        message:'all availability fetched.',
        allAvailability:allAvailability
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.getAllAvailByService = async(req,res,next)=>{
try{
    const userId = parseInt(req.userId);
    const serviceId = req.params.serviceId;
    const checkUserService = await prisma.provider.findFirst({
        where:{id:userId,services:{some:{id:parseInt(serviceId)}}}
    });
    if(!checkUserService){
        const error = new Error("the service is not yours.");
        error.statusCode = 403;
        throw error;
    }
    const allAvailability = await prisma.availability.findMany({
        where:{serviceId:serviceId},
        include:{service:true}
    });
    res.status(200).json({
        message:'all availability fetched.',
        allAvailability:allAvailability
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.createAvail = async(req,res,next)=>{
try{
    const type = req.type;
    const typeId = req.typeId;
    const serviceId = parseInt(req.params.serviceId);
    //validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    if(type !== 'Provider'){
        const error = new Error("Not a Provider");
        error.statusCode = 403;
        throw error;
    }
    //checking the owner
    const checkUserService = await prisma.provider.findFirst({
        where:{id:typeId,services:{some:{id:parseInt(serviceId)}}}
    });
    if(!checkUserService){
        const error = new Error("the service is not yours.");
        error.statusCode = 403;
        throw error;
    }
    const {dayOfWeek,startTime,endTime} = req.body
    //checking conflicts
    await CheckAvail(typeId,parseInt(startTime),parseInt(endTime),parseInt(dayOfWeek));
    //create
    const newAvailability = await prisma.availability.create({
        data:{
            startTime:parseInt(startTime),
            endTime:parseInt(endTime),
            dayOfWeek:parseInt(dayOfWeek),
            providerId:typeId,
            serviceId:serviceId
        }
    });
    res.status(201).json({
        message:'availability got created.',
        newAvailability:newAvailability
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.editAvail = async(req,res,next)=>{
try{
    const type = req.type;
    const typeId = req.typeId;
    if(type !== 'Provider'){
        const error = new Error("Not a Provider");
        error.statusCode = 403;
        throw error;
    }
    const serviceId = parseInt(req.params.serviceId);
    const availId = parseInt(req.params.availId);
    //validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    //checking the owner
    const checkUserService = await prisma.provider.findFirst({
        where:{id:typeId,services:{some:{id:parseInt(serviceId)}}}
    });
    if(!checkUserService){
        const error = new Error("the service is not yours.");
        error.statusCode = 403;
        throw error;
    }
    //checking conflicts
    const {dayOfWeek,startTime,endTime} = req.body;
    await CheckAvail(typeId,parseInt(startTime),parseInt(endTime),parseInt(dayOfWeek));
    //update
    const updatedAvailability = await prisma.availability.update({
        where:{id:availId},
        data:{
            startTime:parseInt(startTime),
            endTime:parseInt(endTime),
            dayOfWeek:parseInt(dayOfWeek),
        }
    });
    //respond
    res.status(200).json({
        message:'Availability Updated.',
        updatedAvailability:updatedAvailability
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.deleteAvail = async(req,res,next)=>{
try{
    const type = req.type;
    const typeId = req.typeId;
    if(type !== 'Provider'){
        const error = new Error("Not a Provider");
        error.statusCode = 403;
        throw error;
    }
    const serviceId = parseInt(req.params.serviceId);
    const availId = parseInt(req.params.availId);
    //checking the owner
    const checkUserService = await prisma.provider.findFirst({
        where:{id:typeId,services:{some:{id:parseInt(serviceId)}}}
    });
    if(!checkUserService){
        const error = new Error("the service is not yours.");
        error.statusCode = 403;
        throw error;
    }
    //delete
    await prisma.availability.delete({
        where:{id:availId}
    });
    res.status(200).json({
        message:'Availability got deleted.'
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}