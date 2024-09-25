const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { CheckReport } = require('../prisma/prisma');
require('../prisma/prisma');



exports.Report = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const typeId = req.typeId;
    const type = req.type;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const {title,description} = req.body;
    await CheckReport(typeId,providerId);
    await prisma.report.create({
        data:{
            title:title,
            description:description,
            providerId:providerId,
            customerId:typeId
        }
    });
    res.status(201).json({
        message:'Successfully Reported.'
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.EditReport = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const typeId = req.typeId;
    const type = req.type;
    const providerId = req.params.providerId;
    const reportId = req.params.reportId;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const {title,description} = req.body;
    await CheckReport(typeId,providerId);
    const HasReport = await prisma.report.findFirst({
        where:{id:reportId,providerId:providerId,customerId:typeId}
    });
    if(!HasReport){
        const error = new Error('not Owner of the report');
        error.statusCode = 409;
        throw error;
    }
    await prisma.report.update({
        where:{id:reportId},
        data:{
            title:title,
            description:description
        }
    });
    res.status(200).json({
        message:'report got updated'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.DeleteReport = async(req,res,next)=>{
try{
    const typeId = req.typeId;
    const type = req.type;
    const providerId = req.params.providerId;
    const reportId = req.params.reportId;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const HasReport = await prisma.report.findFirst({
        where:{id:reportId,providerId:providerId,customerId:typeId}
    });
    if(!HasReport){
        const error = new Error('not Owner of the report');
        error.statusCode = 409;
        throw error;
    }
    await prisma.report.delete({
        where:{id:reportId}
    });
    res.status(200).json({
        message:'report got deleted.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.getAllReports = async(req,res,next)=>{
try{
    const type = req.type;
    const typeId = req.typeId;
    const providerId = req.params.providerId;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const allReports = await prisma.report.findMany({
        where:{providerId:providerId},
    })
    const totalReports = allReports.length 
    res.status(200).json({
        message:'report got deleted.',
        allReports:allReports,
        totalReports:totalReports
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}