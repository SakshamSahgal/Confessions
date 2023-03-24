const { Validate_Session } = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 


function Post_it(req_JSON,res)
{
    Validate_Session(req_JSON).then( (SessionResult) => {

        if(SessionResult.length)
        {
            if(req_JSON.Visibility == "Anonymous" || req_JSON.Visibility == "Public")
            {
                if(req_JSON.Content.length >= 5 && req_JSON.Content.length <= 280)
                {
                    let json_to_post = {
                        Timestamp : Date.now(),
                        Content : req_JSON.Content,
                        Visibility : req_JSON.Visibility
                    }

                    let posts_db_dir = "./Media/" + SessionResult[0].Username + "/Posts.db";
                    const posts_db = new Datastore(posts_db_dir);
                    posts_db.loadDatabase();
                    posts_db.insert(json_to_post);
                    let verdict = {
                        Status : "Pass",
                        Description : "Successfully Posted!"
                    }
                    res.json(verdict);
                }
                else
                {
                    if(req_JSON.Content.length < 5)
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Content Length < 5"
                        }
                        res.json(verdict);
                    }
                    else
                    {
                        let verdict = {
                            Status : "Fail",
                            Description : "Content Length > 280"
                        }
                        res.json(verdict);
                    }
                }
            }
            else
            {
                let verdict = {
                    Status : "Fail",
                    Description : "Visibility Undefined"
                }
                res.json(verdict);
            }    
        }
        else
        {
            let verdict = {
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.req_JSON(verdict);
        }


    }) 
}

module.exports = {Post_it};