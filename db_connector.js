var MongoClient=require('mongodb').MongoClient;
var OpDB=require('./db');
class DBConnector{
    DBConnect(url,parentCallback,dbcallback){
        MongoClient.connect(url,function(err,db){
            if(err){
                if(parentCallback){
                    parentCallback(OpDB.DB_OPEN_ERROR,{"result":OpDB.DB_OPERATION_RESULT_ERROR,"response":err.toString()});
                 }  
            }
            else{
                dbcallback(db);
            }
        });
    }
}

module.exports.DBConnector=DBConnector;
