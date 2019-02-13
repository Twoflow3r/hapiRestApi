const Controller = require('../controllers/controller');
const Boom = require('boom');
module.exports = [{
    method: 'GET',
    path: `/api/{collection}`,
    async handler(request) {
        const result = {
            total: 0,
            category: [],
            categoryCount: [],
            array: [],
        }
        const db = request.mongo.db;
        
        try {
             result.array = await db.collection(`${encodeURIComponent(request.params.collection)}`).find({
            }).limit(1).toArray();
             result.total = await db.collection(`${encodeURIComponent(request.params.collection)}`).countDocuments();
            const regions = await db.collection(`${encodeURIComponent(request.params.collection)}`).aggregate([
                { "$project": { "$locality_name": { "$split" : [", "] } } },
                function( err, data ) {

                    if ( err )
                      throw err;
                
                   data 
                
                  }
                 ] );
                 console.log(regions);
             /*
             result.regions = await db.collection(`${encodeURIComponent(request.params.collection)}`).group(
                
                ["locality_name"],
            //{"locality_name": {$regex: "(.*?),"}},
           { "locality_name": {split: (",")}},
                { "count": 0 },
                "function (obj,prev) { prev.count++; }"
            );
          */  
             result.category = await db.collection(`${encodeURIComponent(request.params.collection)}`).distinct(`category`);
             result.categoryCount = await db.collection(`${encodeURIComponent(request.params.collection)}`).group(
                ["category"],
                {},
                { "count": 0 },
                "function (obj,prev) { prev.count++; }"
              );
            return result;
        }
        catch (err) {
            throw Boom.internal('Internal MongoDB error', err);
        }
    },
    config: {
        description: 'get collectoon',
        tags: ['api', 'collection']
    }
},{
    method: 'GET',
    path: `/api/{collection}/{pageId}`,
    async handler(request) {
        const db = request.mongo.db;
        try {
            const result = await db.collection(`${encodeURIComponent(request.params.collection)}`).findOne({
                pageId: `${encodeURIComponent(request.params.pageId)}`
            });
            return result;
        }
        catch (err) {
            throw Boom.internal('Internal MongoDB error', err);
        }
    },
    config: {
        description: 'Get analog',
        tags: ["/","collectoon","pageId"]
    }
},
{
    method: 'GET',
    path: `/api/{collection}/regions`,
    async handler(request) {
        const db = request.mongo.db;
        try {
            const result = db.collection(`${encodeURIComponent(request.params.collection)}`).aggregate([{
                    $project: {
                        _id: 0,
                        locality_name: {
                            "$split": ["$locality_name", ","]
                        }

                    }
                },
                {
                    $project: {
                        _id: 0,
                        locality_name: {
                            "$slice": ["$locality_name", 1]
                        }

                    }
                },
                {
                    $group: {
                        _id: "$locality_name",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray();
            return result;
        }

        catch (err) {
            throw Boom.internal('Internal MongoDB error', err);
        }
    },
    config: {
        description: 'Get regions stat',
        tags: ["/","api/","collectoon","regions"]
    }
}]