const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { findUser, findProviderimage } = require('../prisma/prisma');
const { json } = require('body-parser');
require('../prisma/prisma');
require('../prisma/prisma');
const clearImage = require('../util/ClearImage');
const bcrypt = require('bcrypt');
const cloudinary = require('../app');

exports.GetProfile = async(req,res,next)=>{
try{
    const {userId,type} = req;
    const user = await findUser(type,userId);
    res.status(200).json({
        message:'user Fetched.',
        user:user,
        type:type
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}



exports.EditCProfile = async(req,res,next)=>{
try{
    const userId = req.userId;
    //checking validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const {email,name,lastName,password,NIDN,phoneNumber,image,uniqueImageId} = req.body;
    //checking customer email
    const ExistCustomer = await prisma.user.count({where:{email:email,NOT:{
        id:userId
    }}});
    if(ExistCustomer>0){
        const error = new Error('Customer with this email already exist.')
        error.statusCode = 409;
        throw error;
    };
    const imageAndId = await prisma.user.findFirst({
        where:{id:userId},
        select:{image:true,uniqueImageId:true}
    })
    //image handle
    let Image = imageAndId.image;
    let UniqueImageId = imageAndId.uniqueImageId;
    if(image && uniqueImageId){
        if(UniqueImageId){
            await cloudinary.uploader.destroy(UniqueImageId,{resource_type:"image"});
        }
        Image = image;
        UniqueImageId = uniqueImageId;
    }
    //handling password
    const newpassword = await bcrypt.hash(password,12);
    //updating userProfile without include
    const updateduser = await prisma.user.update({
        where:{id:userId},
        data:{
            email:email,
            name:name,
            lastName:lastName,
            password:newpassword,
            NIDN:parseInt(NIDN,10),
            phoneNumber:phoneNumber,
            image:Image,
            uniqueImageId:UniqueImageId
        },
        select:{
            email:true,
            lastName:true,
            name:true,
            password:true,
            NIDN:true,
            phoneNumber:true,
            image:true
        }
    });
    // RESPOND
    res.status(200).json({
        message:'Edited succesfully.',
        user:updateduser
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}


exports.EditPProfile = async(req,res,next)=>{
try{
    const userId = req.userId;
    //checking validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const {email,name,lastName,password,NIDN,location,phoneNumber,image,uniqueImageId} = req.body;
    //checking provider email
    const ExistProvider = await prisma.user.count({where:{email:email,NOT:{
        id:userId
    }}});
    if(ExistProvider>0){
        const error = new Error('Provider with this email already exist.')
        error.statusCode = 409;
        throw error;
    };
    //handle image
    const imageAndId = await prisma.user.findFirst({
        where:{id:userId},
        select:{image:true,uniqueImageId:true}
    })
    //image handle
    let Image = imageAndId.image;
    let UniqueImageId = imageAndId.uniqueImageId;
    if(image && uniqueImageId){
        if(UniqueImageId){
            await cloudinary.uploader.destroy(UniqueImageId,{resource_type:"image"});
        }
        Image = image;
        UniqueImageId = uniqueImageId;
    }
    //handling password
    const newpassword = await bcrypt.hash(password,12);
    //updating userProfile
    const updateduser = await prisma.user.update({
        where:{id:userId},
        data:{
            email:email,
            name:name,
            lastName:lastName,
            password:newpassword,
            NIDN:parseInt(NIDN,10),
            image:Image,
            uniqueImageId:UniqueImageId,
            phoneNumber:phoneNumber,
            provider:{update:{
                data:{
                    location:location,
                }
            }}
        },
        select:{
            email:true,
            name:true,
            lastName:true,
            password:true,
            NIDN:true,
            phoneNumber:true,
            image:true,
            provider:{
                select:{
                    location:true
                }
            }
        }
    });
    // RESPOND
    res.status(200).json({
        message:'Edited succesfully.',
        user:updateduser
    })
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}
}