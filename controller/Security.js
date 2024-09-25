const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
require('../prisma/prisma');
const path = require('path');
const clearImage  = require('../util/ClearImage');


exports.BanUser = async(req,res,next)=>{
try{
    const userId = req.params.userId;
    const banUser = await prisma.user.update({
        where:{id:userId},
        data:{
            isBan:true
        }
    });
    res.status(200).json({
        message:'user got Banned.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.SetModerator = async(req,res,next)=>{
try{
    const SecurityId = req.userId;
    const userId = req.params.userId;
    const CheckAdmin = prisma.user.findFirst({
        where:{id:SecurityId,isAdmin:true}
    });
    if(!CheckAdmin){
        const error = new Error('Not Admin.');
        error.statusCode = 401;
        throw error;
    }
    const SetModUser = await prisma.user.update({
        where:{id:userId},
        data:{
            isModerator:true
        }
    });
    res.status(200).json({
        message:'user now is a Moderator.'
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.getUser = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const email = req.body.email
    const user = await prisma.user.findFirst({
        where:{email:email},
        select: {
                id: true,
                email: true,
                name: true,
                NIDN: true,
                phoneNumber: true,
                isAdmin: true,
                isModerator: true,
                isBan: true,
                customerId: true,
                providerId: true,
                customer: {
                    select: {
                        id: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                provider: {
                    select: {
                        id: true,
                        image: true,
                        location: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                createdAt: true,
                updatedAt: true
            }
    })
    res.status(200).json({
        message:'Fetched users.',
        user:user
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}