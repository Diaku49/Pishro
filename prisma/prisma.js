const bcrypt = require('bcrypt')
const {PrismaClient} = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient({
    errorFormat:'pretty'
})

exports.Login = async(email,password)=>{
try{
        //finding user
        const user = await prisma.user.findFirst({
            where:{email:email}
        });
        if(!user){
            const error = new Error('Couldnt find the user.');
            error.statusCode = 404;
            throw error;
        };
        //checking password
        const decodedPass = await bcrypt.compare(password,user.password);
        if(!decodedPass){
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        let accessToken;
        //creating accessToken
        if(user.providerId){
            const provider = await prisma.user.findFirst({
                where:{email:email},
                select:{id:true,provider:{select:{id:true}}}
            });
            console.log(provider.provider.id);
            accessToken = jwt.sign({id:provider.id,type:'Provider',typeId:provider.provider.id},process.env.JWT_SECRET,{expiresIn:'6h'});
            await prisma.user.update({
            where:{id:provider.id},
            data:{isLoggedIn:true},
            select:{createdAt:true}
            })
        }
        else{
            const customer = await prisma.user.findFirst({
                where:{email:email},
                select:{id:true,customer:{select:{id:true}}}
            });
            accessToken = jwt.sign({id:customer.id,type:'Customer',typeId:customer.customer.id},process.env.JWT_SECRET,{expiresIn:'6h'});
            await prisma.user.update({
            where:{id:customer.id},
            data:{isLoggedIn:true},
            select:{createdAt:true}
            })
        }
        return {accessToken};
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
};


exports.findUser = async(type,userId)=>{
try{
    if(type === 'Provider'){
        const user = await prisma.user.findFirst({
            where:{id:userId},
            include:{
                provider:{
                    include:{Report:true,providerBookings:true,
                    providerReviews:true,services:{include:{availability:true}},availabilities:true}
                }
            }
        });
        if(!user){
            const error = new Error('no User found.');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }
    else{
        const user = await prisma.user.findFirst({
            where:{id:userId},
            include:{customer:{
                    include:{customerBookings:true,customerReviews:true,Report:true}
                }
            }
        });
        if(!user){
            const error = new Error('no User found.');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}


exports.findProviderimage = async(userId)=>{
try{
    const result = await prisma.user.findFirst({
        where:{id:userId},
        select:{
            provider:{
                select:{
                    image
                }
            }
        }
    });
    if (!result) {
            const error = new Error('Provider not found.');
            error.statusCode = 404;
            throw error;
        }
    return image;
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}



exports.GetAllServices = async(currentPage,perPage)=>{
try{
    const services = prisma.service.findMany({
        skip:(currentPage-1) * perPage,
        take:perPage,
        select:{
            id: true,
            title:true,
            serviceType:true,
            name:true,
            location:true,
            createdAt:true,
            updatedAt:true,
            price:true,
            provider:{select:{
                user:{
                    select:{
                        name:true
                    }
                },
                id:true
            }},
            image:true,
            Rating:true,
            _count:{select:{bookings:true}},
        }
    });
    return services;
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}


exports.GetServicesByName = async(currentPage,perPage,name)=>{
try{
    const services = prisma.service.findMany({
        where:{provider:{user:{name:name}}},
        skip:(currentPage-1) * perPage,
        take:perPage,
        select:{
            id: true,
            title:true,
            serviceType:true,
            name:true,
            location:true,
            createdAt:true,
            updatedAt:true,
            price:true,
            pricePerHour:true,
            provider:{select:{
                user:{
                    select:{
                        name:true
                    }
                },
                id:true
            }},
            image:true,
            rating:true,
            _count:{select:{bookings:true}},
        }
    });
    return services;
}
catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}



// search services based on the query
exports.searchServices = async({ title, serviceType, minPrice, maxPrice, minRating, maxRating, page = 1, sortByBookingCount = false })=>{
    const pageSize = 8;
    const whereClause = {
        AND:[
            title ? { title: { contains: title, mode: 'insensitive' } } : {},
            serviceType ? { serviceType } : {},
            minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
            maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
            minRating ? { rating: { gte: parseFloat(minRating) } } : {},
            maxRating ? { rating: { lte: parseFloat(maxRating) } } : {},
        ],
    };
    const totalRecords = await prisma.service.count({ where: whereClause });
    const totalPages = Math.ceil(totalRecords / pageSize);

    let services = await prisma.service.findMany({
        where: whereClause,
        select:{
            id: true,
            title:true,
            serviceType:true,
            name:true,
            location:true,
            createdAt:true,
            updatedAt:true,
            price:true,
            pricePerHour:true,
            provider:{select:{
                user:{
                    select:{
                        name:true
                    }
                },
                id:true
            }},
            image:true,
            rating:true,
            _count:{select:{bookings:true}},
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
    });
    if(sortByBookingCount){
        services.sort((a,b)=> b._count.bookings - a._count.bookings)
    }
    return {services,totalPages};
};



exports.CheckAvail = async(typeId,startTime,endTime,dayOfWeek)=>{
try{
    const allAvailability = await prisma.availability.findMany({
        where:{
            providerId:typeId,
            dayOfWeek:dayOfWeek
        },
        select:{
            startTime:true,
            endTime:true,
            dayOfWeek:true
        }
    });
    const Conflict = allAvailability.some(av=>{
        return (  dayOfWeek === av.dayOfWeek && (startTime<av.endTime && endTime > av.startTime));
    });
    if(Conflict){
        const error = new Error('Time has conflicts.');
        error.statusCode = 409;
        throw error;
    }
}
catch(err){
    console.error(err);
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}

exports.CheckReport = async(typeId,providerId)=>{
try{
    const HadService = prisma.customer.findFirst({
        where:{
            id:typeId,
            customerBookings:{some:{providerId:providerId}}
        }
    });
    if(!HadService){
        const error = new Error('never had service from this provider.')
        error.statusCode =  409;
        throw error;
    }
}
catch(err){
    console.error(err);
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}


exports.CheckReview = async(typeId,providerId,serviceId)=>{
try{
    const HadService = await prisma.customer.findFirst({
        where:{
            id:typeId,
            customerBookings:{some:{providerId:providerId,serviceId:serviceId}},
            customerReviews:{some:{NOT:{providerId:providerId}}}
        }
    });
    if(!HadService){
        const error = new Error('never had service from this provider or already gave review.')
        error.statusCode =  409;
        throw error;
    };
}
catch(err){
    console.error(err);
    if(!err.statusCode){
        err.statusCode = 500;
    }
    throw err;
}
}