const Controller = require('../controllers/controller');
const Boom = require('boom');
module.exports = [{
    method: 'GET',
    path: `/api/`,
    async handler(request) {
        const db = request.mongo.db;
        const result = {
            stats: {},
            arrCount: []
        };
        let collectionName = [];
        try {
        
          result.stats = await db.stats();
          const collectionArray = await db.listCollections().toArray();

          collectionArray.forEach((collection) => {
            collectionName.push(collection.name)
          });

          console.log(collectionName);

          for( let i = 0; i < collectionName.length;i++){

            result.arrCount.push( await db.collection(`${collectionName[i]}`).countDocuments());
          }

          return result;
        }
        catch (err) {
            throw Boom.internal('Internal MongoDB error', err);
        }
    },
    config: {
        description: "Get DB info",
        notes: ["Get DB info"],
        tags: ["/","api"]
    }
},{
    method: 'GET',
    path: `/api/{collection}.{quantity?}`,
    async handler(request) {
        const result = {
            total: 0,
            category: [],
            categoryCount: [],
            array: []
        }
        const quantity = request.params.quantity ?
            encodeURIComponent(request.params.quantity) :
            "10";
        const db = request.mongo.db;
        
        try {
             result.array = await db.collection(`${encodeURIComponent(request.params.collection)}`).find({
            }).limit(Number(`${quantity}`)).toArray();

             result.total = await db.collection(`${encodeURIComponent(request.params.collection)}`).countDocuments();

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
        description: 'get statistics of collection and array objects, ! after the point is not required!',
        notes: ['Get statistics of collection, quantity it is option for count objects that api response, His default value 10'],
        tags: ["/",'api', 'collection', "/", "quantity" ]
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
        description: "Get one analog",
        notes: ["Get one object by his id"],
        tags: ["/","api","collectoon","/","pageId"]
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
        description: 'Get regions statistics',
        notes: ["statistics on the number of objects by region"],
        tags: ["/","api","collection", "regions" ]
    }
}]