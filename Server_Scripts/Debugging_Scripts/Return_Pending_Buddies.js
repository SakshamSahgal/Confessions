//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 



function Return_Buddy_Request_DB(res)
{
    let Pending_Buddy_Requests_db_Dir = "./Database/Buddy_Requests.db";
    let Pending_Dubby_Requests_DB = new Datastore(Pending_Buddy_Requests_db_Dir);
    Pending_Dubby_Requests_DB.loadDatabase();
    Pending_Dubby_Requests_DB.find({},(err,complete_DB_Array) => {
        res.json(complete_DB_Array);
    })

}



module.exports = {Return_Buddy_Request_DB}