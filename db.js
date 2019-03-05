
const DB_connector=require('./db_connector');
const db_connector=new DB_connector.DBConnector();
const DB_OPEN_ERROR="DB OPEN ERROR";
const DB_OPERATION_RESULT_ERROR="DB OPERATION RESULT ERROR";
const QUERY_INCOMPLETE="QUERY_INCOMPLETE";
const QUERY_RECORD_NOT_FOUND="RECORD_NOT_FOUND";
const QUERY_SUCCESSFUL="QUERRY SUCCESSFUL";
const USER_EXISTS="THIS USER ALREADY EXISTS";
const REGISTRATION_SUCCESSFULL="NEW USER CREATED";
const UPDATE_SUCCESSFULL="UPDATE_SUCCESSFUL";
const USER_NOT_FOUND="USER_NOT_FOUND";
class DataBaseOperations{
    constructor(url,port,DBName)
    {
        this.url=url;
        this.port=port;
        this.DBName=DBName;
        this.DBUrl=`mongodb://${this.url}:${this.port}`;
    }
    SearchDB(collectionName,jsonQuerry,callback){   
        db_connector.DBConnect(this.DBUrl,callback,DB=>{
            if(DB){
                
                DB.db(this.DBName).collection(collectionName).find(jsonQuerry).toArray((err,res)=>{
                DB.close();
                    
                if(err){
                        callback(QUERY_INCOMPLETE,{"result":DB_OPERATION_RESULT_ERROR,"details":err.toString()});
                        
                    }
                    else if(res.length==0)
                    {
                        callback(QUERY_RECORD_NOT_FOUND,{"result":QUERY_RECORD_NOT_FOUND,"details":"No Record:"+JSON.stringify(jsonQuerry)});
                        
                    }
                    else{
                        
                        
                        callback(QUERY_SUCCESSFUL,{"result":QUERY_SUCCESSFUL,"details":res[0]});
                        
                    }
                });
            }
        });
    }
    UpDateDB(collectionName,selection_criteria,jsonQuerry,callback){
        db_connector.DBConnect(this.DBUrl,callback,DB=>{
          //  console.log("HERE3");
            if(DB){
                DB.db(this.DBName).collection(collectionName).updateOne(selection_criteria,{$set:jsonQuerry},(err,res)=>{
                DB.close();
                if(err){
            //        console.log("HERE4");
                    callback(QUERY_INCOMPLETE,{"result":DB_OPERATION_RESULT_ERROR,"details":err.toString()});
                }
                else {
                    //console.log("HERE2");
                    callback(QUERY_SUCCESSFUL,{"result":UPDATE_SUCCESSFULL,"details":res});
                
                }
                });
            }
        });
    }

    AddDB(collectionName,jsonQuerry,callback){
        
        db_connector.DBConnect(this.DBUrl,callback,DB=>{
            if(DB){
                DB.db(this.DBName).collection(collectionName).insertOne(jsonQuerry,(err,res)=>{
                    DB.close();
                    if(err)
                    {
                        callback(DB_OPERATION_RESULT_ERROR,{"result":DB_OPERATION_RESULT_ERROR,"details":"err.toString()"});
                
                    }
                    else{
                        callback(REGISTRATION_SUCCESSFULL,{"result":REGISTRATION_SUCCESSFULL,"details":res});
                    }
                    });
                
            }
        })
    }
    
    AddUser(collectionName,jsonQuerry,callback){
        this.FindUserByEmailID(collectionName,jsonQuerry.EMAIL,(res_code,details)=>{
            if(res_code==QUERY_RECORD_NOT_FOUND){
                this.AddDB(collectionName,jsonQuerry,(res_code,details)=>{
                    callback(REGISTRATION_SUCCESSFULL,{"IsSuccessful":true,"details":details.details});
                });
            }
            else if(res_code==QUERY_INCOMPLETE){
                callback(details);

            }
            else{
                callback(USER_EXISTS,{"res_code":USER_EXISTS,"details":"This User Exists Already!!!"});
            }
        })
            
    }
    
    FindUserByEmailID(collectionName,EmailID,callback){
        this.SearchDB(collectionName,{"EMAIL":EmailID},callback);
    }
    
    LoginUser(collectionName,jsonQuerry,callback){
        this.FindUserByEmailID(collectionName,jsonQuerry.EMAIL,(res_code,details)=>{
            if(res_code==QUERY_SUCCESSFUL){
               // console.log(details);
                if(details.details.PASSWORD==jsonQuerry.PASSWORD){
                    callback(QUERY_SUCCESSFUL,{"IsSuccessful":true,"details":details.details});
                }
                else{
                  callback(QUERY_SUCCESSFUL,{"IsSuccessful":false});
                }
            }
            else{
                callback(QUERY_RECORD_NOT_FOUND,{"IsSuccessful":false});
            }
        });
    }
    
    ModifyProfileDetails(collectionName,jsonQuerry,callback){
        this.FindUserByEmailID(collectionName,jsonQuerry.EMAIL,(res_code,details)=>{
            if(res_code==QUERY_SUCCESSFUL){
               // console.log("HERE");
                this.UpDateDB(collectionName,{"EMAIL":jsonQuerry.EMAIL},jsonQuerry,(res_code,details)=>{
                    if(res_code==QUERY_SUCCESSFUL){
                        callback(UPDATE_SUCCESSFULL,{"IsSuccessful":true,"details":details});
                    }
                    else{
                        callback(res_code,{"IsSuccessful":false,"details":details});
                    }
                });
            }
            else{
                callback(USER_NOT_FOUND,{"IsSuccessful":false,"details":details});
            }
        });
    }

    FindPlaceByName(collectionName,jsonQuerry,callback){
        this.SearchDB(collectionName,{"PLACE_NAME":jsonQuerry},callback);
    }


    AddPlaceDetails(collectionName,jsonQuerry,callback){
        this.AddDB(collectionName,jsonQuerry,(res_code,details)=>{
            callback(res_code,details);
        });
    }

    LogLocationData(collectionName,jsonQuerry,callback){
        this.AddDB(collectionName,jsonQuerry,(res_code,details)=>{
            callback(res_code,{"IsSuccessful":true,"details":details});
        })
    }


}

module.exports.DB_OPEN_ERROR=DB_OPEN_ERROR;
module.exports.DB_OPERATION_RESULT_ERROR=DB_OPERATION_RESULT_ERROR;
module.exports.QUERY_INCOMPLETE=QUERY_INCOMPLETE;
module.exports.QUERY_RECORD_NOT_FOUND=QUERY_RECORD_NOT_FOUND;
module.exports.QUERY_SUCCESSFUL=QUERY_SUCCESSFUL;
module.exports.DataBaseOperationsClass=DataBaseOperations;