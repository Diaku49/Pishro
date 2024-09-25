const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { Login, Logout, GetAllServices, CheckReport, CheckReview } = require('../prisma/prisma');
require('../prisma/prisma');

exports.GetReviews = async(rea,res,next)=>{
try{
    const providerId = req.params.providerId;
    const serviceId = req.params.serviceId;
    const allReviews = await prisma.review.findMany({
        include:{book:true},
        where:{providerId:providerId,book:{serviceId:serviceId}},
    });
    res.status(200).json({
        message:'Fetched all reviews.'
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.submitReview = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const type = req.type;
    const typeId = req.typeId;
    const providerId = req.params.providerId;
    const serviceId = req.params.serviceId;
    const {rating,comment} = req.body;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    await CheckReview(typeId,providerId,serviceId);
    if(!comment){
        comment = null;
    }
    const newReview = await prisma.review.create({
        data:{
            providerId:providerId,
            customerId:typeId,
            rating:rating,
            comment:comment
        }
    });
    res.status(201).json({
        message:'Review submited.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.EditReview = async(req,res,next)=>{
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
    const reviewId = req.params.reviewId;
    const {rating,comment} = req.body;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const CheckR = await prisma.review.findFirst({
        where:{id:reviewId,providerId:providerId,customerId:typeId}
    });
    if(!CheckR){
        const error = new Error('couldnt find the review for the user.');
        error.statusCode = 404;
        throw error;
    }
    const UpdatedReview = await prisma.review.update({
        where:{id:reviewId},
        data:{
            rating:rating,
            comment:comment
        }
    });
    res.status(200).json({
        message:'Review got updated.'
    });
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}

exports.deleteReview = async(req,res,next)=>{
try{
    const typeId = req.typeId;
    const type = req.type;
    const providerId = req.params.providerId;
    const reviewId = req.params.reviewId;
    if(type === 'Provider'){
        const error = new Error('providers are not allowed to report.');
        error.statusCode = 401;
        throw error;
    }
    const CheckR = await prisma.review.findFirst({
        where:{id:reviewId,providerId:providerId,customerId:typeId}
    });
    if(!CheckR){
        const error = new Error('couldnt find the review for the user.');
        error.statusCode = 404;
        throw error;
    }
    await prisma.review.delete({
        where:{id:reviewId}
    });
    res.status(200).json({
        message:'Review got deleted.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}