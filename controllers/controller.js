module.exports = {
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
    }
};