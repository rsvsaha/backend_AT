const express=require('express');
const bodyparser=require('body-parser');
const fs=require('fs');
const app=express();


const URL="localhost";
const port="27017";
const DBName="AT_DB";

const DIRECTORIES=require('./constants');
const PROFILE_IMG_DIR=DIRECTORIES.PROFILE_IMAGE_DIR;
const DEFAULT_PROFILE_IMAGE="\\Default.jpg"; 
const PLACE_IMAGE_DIR=DIRECTORIES.PLACE_IMAGE_DIR;



const DBOP=require('./config/db');
const DBOPClass=new DBOP.DataBaseOperationsClass(URL,port,DBName);

const collection_names=require('./models/collection_names');
const USER_DETAILS=collection_names.USER_DETAILS;
const PLACE_DETAILS=collection_names.PLACE_DETAILS;
const LOCATION_DATA_LOGGER=collection_names.LOCATION_DATA_LOGGER;



const QUERY_SUCCESSFUL=DBOP.QUERY_SUCCESSFUL;
app.use(bodyparser.json())
app.get("/HELLO",function(req,res){
    res.send("HELLO");
});

app.post("/sign_up",function(req,res){
    
    let UserDetails={
        "EMAIL":req.body.EMAIL,
        "NAME":req.body.NAME,
        "PASSWORD":req.body.PASSWORD,
        "MOB":null,
        "AGE":null,
        "DOB":null,
        "HOBBY":null,
        "IMAGE_URL":PROFILE_IMG_DIR+DEFAULT_PROFILE_IMAGE
    }
    
    
    
    DBOPClass.AddUser(USER_DETAILS,UserDetails,function(response_code,details){
    if(response_code==DBOP.REGISTRATION_SUCCESSFULL)
        {
            res.send(details);
        }
    else{
        res.send(details);
    }
    });
    
});
app.get("/sign_in",function(req,res){
        
        DBOPClass.LoginUser(USER_DETAILS,req.body,function(res_code,details){
            res.send(details);
        })
    
    
});

app.post("/update_profile",function(req,res){
    if(req.body.NEW_IMAGE_UPLOADED==true)
    {req.body.IMAGE_URL=PROFILE_IMG_DIR+"\\"+req.body.EMAIL+".jpg";}    
    DBOPClass.ModifyProfileDetails(USER_DETAILS,req.body,function(res_code,details){
            res.send(details);
        })
});

app.get("/get_profile_image/:userid",function(req,res){
    let EMAIL_ID=req.params.userid;
        
        DBOPClass.FindUserByEmailID(USER_DETAILS,EMAIL_ID,function(res_code,details){
        
            if(res_code==QUERY_SUCCESSFUL){ 
                try{res.sendFile(details.details.IMAGE_URL);}
                catch(err){res.send({"ERROR":"NO FILE FOUND"});}        
            }
            else{
                res.send({"ERROR":"NO FILE FOUND"});
            }

        })
});
app.post("/addPlaces",function(req,res){
    
    let PLACE_HOLDERS={
        "PLACE_NAME":req.body.PLACE_NAME,
        "PLACE_ABOUT":req.body.PLACE_ABOUT,
        "PLACE_IMAGE":PLACE_IMAGE_DIR+"\\"+req.body.PLACE_NAME+".jpg"
    }
    
    DBOPClass.AddPlaceDetails(PLACE_DETAILS,PLACE_HOLDERS,(res_code,details)=>{
        res.send(details);
    })
})
app.get("/placesImages/:placeName",function(req,res){
    let PLACE_NAME=req.params.placeName;
    DBOPClass.FindPlaceByName(PLACE_DETAILS,PLACE_NAME,(res_code,details)=>{
        if(res_code==QUERY_SUCCESSFUL){
            try{res.sendFile(details.details.PLACE_IMAGE);}
            catch(err){res.send({"ERROR":"NO FILE FOUND"});}        }
        else{
            res.send({"ERROR":"NO FILE FOUND"});
        }
    })
    
});

app.get("/get_placeDetails",function(req,res){
    DBOPClass.FindPlaceByName(PLACE_DETAILS,req.body.PLACE_NAME,(res_code,details)=>{
        if(res_code==QUERY_SUCCESSFUL){
            res.send({"IsSuccessful":true,"details":details.details});
        }
        else{
            res.send({"IsSuccessful":false});
        }
    })
});



app.post("/LogLocationData",function(req,res){

    DBOPClass.LogLocationData(LOCATION_DATA_LOGGER,req.body,(res_code,details)=>{
        res.send(details);
    });


});

app.post("/upload_profile_image/:userid",function(req,res){
    let EMAIL_ID=req.params.userid;
        
        DBOPClass.FindUserByEmailID(USER_DETAILS,EMAIL_ID,function(res_code,details){
        
            if(res_code==QUERY_SUCCESSFUL){
                console.log(req.body.IMAGE_CONTAINER);
                let image_64=new Buffer(req.body.IMAGE_CONTAINER,'base64');
                let user_profile_pic_location=details.details.IMAGE_URL;
                console.log(details);
                fs.writeFile(user_profile_pic_location,image_64,(err)=>{
                    if(err){
                        res.send({"IsSuccesful":false})
                    }
                    else{
                        res.send({"IsSuccesful":true});
                    }

                })

            }

        }) 
});

app.listen(3000);

console.log("APPSTARTED AT PORT 3000");