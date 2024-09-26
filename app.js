const express = require('express');
const { initializeSocketIO } = require('./socket-io');
const compression = require('compression');
const helmet = require('helmet');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const appConfig = require('./config/app.config');


const app = express();


// image cloud
cloudinary.config({
    cloud_name: appConfig.cloud.name,
    api_key: appConfig.cloud.apiKey,
    api_secret: appConfig.cloud.apiSecret
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
const streamifier = require('streamifier');

const streamUpload = async (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'my_app_images', 
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

module.exports = cloudinary;

//end

// const Storage = multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,path.join(__dirname,'/images'))
//     },
//     filename:(req,file,cb)=>{
//         const ext = path.extname(file.originalname);
//         const name = file.fieldname + '-' + Date.now() + ext
//         cb(null,name);
//     }
// })


// const fileFilter = (req,file,cb)=>{
//     if(file.mimetype.startWith('image/')){
//         cb(null,true);
//     }
//     else{
//         cb(null,false)
//     }
// }





// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const AuthRoute = require('./routes/Auth')
const UserProfileRoute = require('./routes/UserProfile');
const ServiceRoute = require('./routes/Service');
const AvailabilityRoute = require('./routes/Availability');
const ReportRoute = require('./routes/Report');
const ReviewRoute = require('./routes/Review');
const SecurityRoute = require('./routes/Security');


app.use(compression({threshold:'2kb'}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await streamUpload(req); 

    const { secure_url: imageUrl, public_id: publicId } = result;
    
    res.status(200).json({ imageUrl:imageUrl, publicId:publicId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// app.use(multer({storage:Storage,fileFilter:fileFilter}).single('image'))
// app.use('/images',express.static(path.join(__dirname,'images')));


app.use(cors());



app.use('/auth',AuthRoute); 
app.use('/profile',UserProfileRoute);
app.use('/service',ServiceRoute);
app.use('/availability',AvailabilityRoute);
app.use('/report',ReportRoute);
app.use('/review',ReviewRoute);
app.use('/security',SecurityRoute);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((error,req,res,next)=>{
    console.log(error);
    const errorStatusCode = error.statusCode || 500;
    const errorData = error.data;
    const message = error.message;
    res.status(errorStatusCode).json({
        message:message,data:errorData
    });
});


const server = app.listen(appConfig.port,(result,err)=>{
    console.log('got connected to server.')
});
initializeSocketIO(server);

