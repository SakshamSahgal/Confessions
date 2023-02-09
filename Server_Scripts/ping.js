//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

async function Update_Last_Activity(sesssion)
{
    console.log("searching for session -> ");
    console.log(sesssion.Session_ID);
    users.loadDatabase();
    let Update_Judgement = await new Promise((resolve, reject) => {
        let ID = String(sesssion.Session_ID);
        users.find({"Session.Session_ID" : ID},(err,session_match_array) => { //checking if the user is currently logged in
            if (err) reject(err);

            console.log("found logged in data = ");
            console.log(session_match_array);

            if(session_match_array.length) //found a Session
            {
                let Updated_JSON =  JSON.parse(JSON.stringify(session_match_array[0]));
                Updated_JSON.Last_Activity = String(Date.now());
                users.loadDatabase();
                users.update(session_match_array[0],Updated_JSON,{},(err,NumReplaced) => {
                    console.log("Updated entries = " + NumReplaced);
                    let Judgement = "Pass";
                    resolve(Judgement);
                })
            }
            else
                resolve("Fail");
        })
    });
    return Update_Judgement;    
}

module.exports = {Update_Last_Activity};