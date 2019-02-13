const Hapi = require('hapi');
const Boom = require('boom');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');


const getRoutes = require('./routes/routes');

const launchServer = async function() {
       
    const dbOpts = {
        url: 'mongodb://localhost:29330/fincase',
        settings: {
            poolSize: 10
        },
        decorate: true
    };
    
    const server = Hapi.server({
    port: 4000,
    host: 'localhost'
});
    
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Parsers API Documentation',
                    version: Pack.version
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
            return `<h1>ахуеть</h1>`
        },
        config: {
            description: 'hello',
            tags: ["/"]
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