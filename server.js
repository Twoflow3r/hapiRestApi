const Hapi = require('hapi');
const Boom = require('boom');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');


const getRoutes = require('./routes/routes');

const launchServer = async function() {
       
    const dbOpts = {
        url: 'mongodb://localhost:55556/fincase',
        settings: {
            poolSize: 10
        },
        decorate: true
    };
    
    const server = Hapi.server({
    port: 8085,
    host: '0.0.0.0',
	"routes": {
        "cors": {
            origin: ["*"],
            headers: ["Accept", "Content-Type"]
        }
    }
	
});
    


    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Parsers API Documentation',
                    version: Pack.version,
                    contact: {
                        'name': 'Alexander Klimov',
                        'email': 'klimnotdie@gmail.com'
                },
                }
            }
        }, {
            plugin: require('hapi-mongodb'),
            options: dbOpts
        }
    ]);

   server.route({
        method: 'GET',
        path: '/',
        async handler() {
            return `<h1>go</h1>`
        },
        config: {
            description: 'get main page',
            notes: ['Base path this API'],
            tags: ["/","api" ]
        }
    });

    server.route(getRoutes);

    await server.start();
    console.log(`Server started at ${server.info.uri}`);
};

launchServer().catch((err) => {
    console.error(err);
    process.exit(1);
});