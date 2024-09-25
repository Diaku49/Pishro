const swaggerJsdoc = require('swagger-jsdoc');



// Inside components/schemas in swagger.js

const ServiceType = {
  OneTimeFeeService: "OneTimeFeeService",
  HourlyRateService: "HourlyRateService",
};

const ServiceList = {
  healthcareServices: "healthcareServices",
  carpetCleaning: "carpetCleaning",
  hairCut: "hairCut",
  electricalWiring: "electricalWiring",
  gasPiping: "gasPiping",
  applianceRepair: "applianceRepair",
  pipeFitting: "pipeFitting",
  HeatingSystemInstallation: "HeatingSystemInstallation",
  CleaningService: "CleaningService",
};

const CustomerWithDetails = {
  allOf: [
    { $ref: '#/components/schemas/User' },
    {
      type: 'object',
      properties: {
        customer: {
          allOf: [
            { $ref: '#/components/schemas/Customer' },
            {
              type: 'object',
              properties: {
                customerBookings: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Booking'
                  }
                },
                customerReviews: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Review'
                  }
                },
                Report: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Report'
                  }
                }
              }
            }
          ]
        }
      }
    }
  ]
};

const ProviderWithDetails = {
  allOf: [
    { $ref: '#/components/schemas/User' },
    {
      type: 'object',
      properties: {
        provider: {
          allOf: [
            { $ref: '#/components/schemas/Provider' },
            {
              type: 'object',
              properties: {
                Report: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Report'
                  }
                },
                providerBookings: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Booking'
                  }
                },
                providerReviews: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Review'
                  }
                },
                services: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Service' // Reference to the Service schema (with availability)
                  }
                },
                availabilities: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Availability'
                  }
                },
              }
            }
          ]
        }
      }
    }
  ]
};


const User = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    lastName: { type: 'string' },
    password: { type: 'string', format: 'password' },
    NIDN: { type: 'integer' },
    phoneNumber: { type: 'string' },
    isLoggedIn: { type: 'boolean' },
    isAdmin: { type: 'boolean' },
    isModerator: { type: 'boolean' },
    isBan: { type: 'boolean' },
    customerId: { type: 'integer' },
    providerId: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true }, // Make updatedAt nullable
  }
};

const Customer = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    userId: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  }
};


const Provider = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    image: { type: 'string', nullable: true },
    location: { type: 'string' },
    userId: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  }
};


const Service = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    title: { type: 'string', enum: Object.values(ServiceList) },
    serviceType: { type: 'string', enum: Object.values(ServiceType) },
    rating: { type: 'number', format: 'float', nullable: true },
    description: { type: 'string' },
    image: { type: 'string', nullable: true },
    price: { type: 'number', format: 'float' },
    providerId: { type: 'integer' },
    location: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  }
};


const Availability = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    providerId: { type: 'integer' },
    serviceId: { type: 'integer' },
    dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
    startTime: { type: 'integer' },
    endTime: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  }
};



const options = {
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'Pishro and open service',
      version: '1.0.0',
      description: 'API documentation for your project',
    },
    servers: [ // Add this to specify the base URL for your API
      {
        url: 'http://localhost:8000', // Adjust the port if needed
        description: 'Development server',
      },
    ],
  },
  apis: [ //routes
    './routes/Auth.js',
    './routes/Availability.js',
    './routes/Service.js',
    './routes/UserProfile.js'
  ],
    components: {
    schemas: {
        User: User,
        Customer: Customer,
        Provider: Provider,
        Service: Service,
        Availability: Availability,
        CustomerWithDetails:CustomerWithDetails,
        ProviderWithDetails:ProviderWithDetails
    }
  }
};

const openapiSpecification = swaggerJsdoc(options);

module.exports = openapiSpecification;