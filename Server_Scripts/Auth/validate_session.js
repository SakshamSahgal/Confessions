//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

async function Validate_Session(sesssion)
{
    console.log("searching for session -> ");
    console.log(sesssion.Session_ID);
    users.loadDatabase();
    let Session_Judgement = await new Promise((resolve, reject) => {
        let ID = String(sesssion.Session_ID);
        users.find({"Session.Session_ID" : ID},(err,session_match_array) => { //checking if the user is currently logged in
            if (err) reject(err);
            console.log("found logged in data = ");
            console.log(session_match_array);
            let Judgement = session_match_array;
            resolve(Judgement);
        })
    });
    return Session_Judgement;    
}

module.exports = {Validate_Session}