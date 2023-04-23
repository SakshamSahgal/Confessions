//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const bcrypt = require("bcrypt");
require("dotenv").config();//reading the .env file

function getGlobalDBs(req,res)
{
    if(req.headers.authorization == undefined)
        res.json({Error : "Not Authorized"});
    else
    {
        bcrypt.compare(req.headers.authorization,process.env.AdminHash).then((IsMatched) => {
    
            if(IsMatched)
            {
                let DBs = {
                    users : [],
                    Pending_Buddy_Requests : []
                }
        
                let usersDB = new Datastore("./Database/users.db");
                usersDB.loadDatabase();
                usersDB.find({},(err,competeUsersArray) => {
                    DBs.users = competeUsersArray;
        
                    let Pending_Buddy_Requests_db_Dir = "./Database/Buddy_Requests.db";
                    let Pending_Dubby_Requests_DB = new Datastore(Pending_Buddy_Requests_db_Dir);
                    Pending_Dubby_Requests_DB.loadDatabase();
        
                    Pending_Dubby_Requests_DB.find({},(err,completePendingArray) => {
        
                        DBs.Pending_Buddy_Requests = completePendingArray;
                        res.json(DBs);
        
                    })
                })
            }
            else
                res.json({Error : "Not Authorized"});
    
        })
    }

}



module.exports = {getGlobalDBs}