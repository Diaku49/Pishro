const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})
const {validationResult} = require("express-validator");
const { Login} = require('../prisma/prisma');
require('../prisma/prisma');
const cloudinary = require('../app');



// exports.SignupCustomer = async (req,res,next)=>{
// try{
//     //checking validation
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//         const error = new Error('Validation failed');
//         error.statusCode = 422;
//         error.data = errors.array();
//         throw error;
//     };
//     // reCAPTCHA
//     const captchaToken = req.body.g-recaptcha-response
//         const recaptchaSecretKey = 'YOUR_RECAPTCHA_SECRET_KEY'; 
        
//         // Verify reCAPTCHA token with Google
//         const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${captchaToken}`;

//         const response = await fetch(verifyUrl, { method: 'POST' });
//         const data = await response.json();

//         if (!data.success || data.score < 0.5) {  // Adjust 0.5 based on your desired security level
//             const error = new Error('Invalid CAPTCHA or potential bot activity');
//             error.statusCode = 400;
//             throw error;
//         }

//     const {email,name,password,NIDN} = req.body;
//     //checking customer email
//     const ExistCustomer = await prisma.user.count({where:{email:email}});
//     if(ExistCustomer>0){
//         const error = new Error('Customer with this email already exist.');
//         error.statusCode = 409;
//         throw error;
//     };
//     //hashing password
//     const newpassword = await bcrypt.hash(password,12);
//     //creating user and respond
//     const user = await prisma.user.create({
//         data:{
//             email:email,
//             name:name,
//             password:newpassword,
//             NIDN:NIDN,
//             customer:{create:{}}
//         }
//     });
//     res.status(201).json({
//         message:'Signed Up',
//         user:{name:name,createdAt:user.createdAt}
//     });
// }
// catch(err){
//     if (!err.statusCode) {
//         err.statusCode = 500;
//     }
//     next(err);
// }
// }



exports.Signup = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };

    const {email,name,lastName,password,NIDN,location,phoneNumber,image,uniqueImageId} = req.body;

    if(location){
        const ExistProvider = await prisma.user.count({where:{email:email}});
        if(ExistProvider>0){
            const error = new Error('Provider with this email already exist.')
            error.statusCode = 409;
            throw error;
        };
        let Image = null;
        let UniqueImageId = null;
        if(image && uniqueImageId){
            Image = image;
            UniqueImageId = uniqueImageId
        } 
        //hashing password
        const newPassword = await bcrypt.hash(password,12);
        //creating user and respond
        const user = await prisma.user.create({
            data:{
                email:email,
                name:name,
                lastName:lastName,
                password:newPassword,
                NIDN:parseInt(NIDN,10),
                phoneNumber:phoneNumber,
                image:Image,
                uniqueImageId:UniqueImageId
            },
            select:{id:true,name:true,createdAt:true}
        });
        const userId = user.id;
        const newProvider = await prisma.provider.create({
            data:{
                location:location,
                userId:userId
            },
            select:{
                id:true
            }
        });
        await prisma.user.update({
            where:{id:userId},
            data:{providerId:newProvider.id}
        })
        res.status(201).json({
            message:'Signed Up',
            user:{name:name,createdAt:user.createdAt}
        });
    }
    else{
        const ExistCustomer = await prisma.user.count({where:{email:email}});
        if(ExistCustomer>0){
            const error = new Error('Customer with this email already exist.');
            error.statusCode = 409;
            throw error;
        };
        let Image = null;
        let UniqueImageId = null;
        if(image && uniqueImageId){
            Image = image;
            UniqueImageId = uniqueImageId
        } 
        //hashing password
        const newpassword = await bcrypt.hash(password,12);
        //creating user and respond
        const user = await prisma.user.create({
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
            select:{id:true,name:true,createdAt:true}
        });
        const newCustomer = await prisma.customer.create({
            data:{
                userId:user.id
            },
            select:{id:true}
        });
        await prisma.user.update({
            where:{id:user.id},
            data:{
                customerId:newCustomer.id
            }
        })
        res.status(201).json({
            message:'Signed Up',
            user:{name:name,createdAt:user.createdAt}
        });
    }

}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}
}

// exports.SignupProvider = async (req,res,next)=>{
// try{
//     //checking validation
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//         const error = new Error('Validation failed');
//         error.statusCode = 422;
//         error.data = errors.array();
//         throw error;
//     };
//     const {email,name,password,NIDN,location} = req.body;
//     //checking customer email
//     const ExistProvider = await prisma.user.findFirst({where:{email:email}});
//     if(ExistProvider){
//         const error = new Error('Provider with this email already exist.')
//         error.statusCode = 409;
//         throw error;
//     };
//     // const image = req.files ? req.files.path : null;
//     //hashing password
//     const newpassword = await bcrypt.hash(password,12);
//     //creating user and respond
//     const user = await prisma.user.create({
//         data:{
//         email:email,
//         name:name,
//         password:newpassword,
//         NIDN:NIDN,
//         provider:{create:{
//             image:image,
//             location:location,
//         }}
//         }
//     });
//     res.status(201).json({
//         message:'Signed Up',
//         user:{name:name,createdAt:user.createdAt}
//     });
// }
// catch(err){
//     if (!err.statusCode) {
//         err.statusCode = 500;
//     }
//     next(err);
// }
// }


exports.Login = async(req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const {email,password} = req.body;
    const {accessToken} = await Login(email,password);
    res.status(200).json({
        message:'User Logged In',
        accessToken:accessToken
    })
}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}
}


exports.Logout = async(req,res,next)=>{
try{
    await prisma.user.update({
        where:{id:req.userId},
        data:{isLoggedIn:false}
    });
    res.status(200).json({
        message:'User logged out'
    })
}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}
}

// exports.CLogout = async(req,res,next)=>{
// try{
//     await prisma.user.update({
//         where:{id:req.userId},
//         data:{refreshToken:null}
//     });
//     res.status(200).json({
//         message:'Customer LogedOut'
//     })
// }
// catch(err){
//     if (!err.statusCode) {
//         err.statusCode = 500;
//     }
//     next(err);
// }
// }

// exports.generateAccessToken = async(req,res,next)=>{
// try{
//         const RefreshToken = req.headers['x-refresh-token'];
//         if (!RefreshToken) {
//             throw new Error('Refresh token is required.');
//         }
//         const refreshToken = jwt.verify(RefreshToken,process.env.JWT_RSECRET);
//         const user = await prisma.user.findFirst({where:{id:refreshToken.id}});
//         //checking auth
//         if(!user){
//             const error = new Error('not Authorized.')
//             error.statusCode = 401;
//             throw error;
//         }
//         //checking refresh token
//         if(user.refreshToken !== RefreshToken){
//             const error = new Error('RefreshToken missing or invalid RefreshToken.');
//             error.statusCode = 401;
//             error.data = 'refreshToken expired.'
//             throw error;
//         }
//         // generating accessToken
//         let accessToken;
//         if(user.providerId){
//             accessToken = jwt.sign({id:user.id,type:'Provider'},process.env.JWT_SECRET,{expiresIn:'0.25h'});
//         }
//         else{
//             accessToken = jwt.sign({id:user.id,type:'Customer'},process.env.JWT_SECRET,{expiresIn:'0.25h'});
//         }
//         //respond
//         res.status(200).json({
//             message:'new AccessToken successfully generated.',
//             accessToken:accessToken
//         })
// }
// catch(err){
//     if (err instanceof jwt.JsonWebTokenError) {
//         console.log('Refresh token expired.');
//         const error = new Error('not Authorized.')
//         error.statusCode = 401;
//         error.data = 'refreshToken expired.'
//         return res.status(error.statusCode).json({
//             message:'generating accessToken failed.',
//             error:error
//         })
//     }
//     if(!err.statusCode){
//         err.statusCode = 500;
//     }
//     throw err;
// }
// }