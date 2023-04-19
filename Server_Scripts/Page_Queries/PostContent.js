const { Validate_Session } = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const fs = require("fs");
//Dotenv
require("dotenv").config();//reading the .env file

// function Post_it(req,res)
// {
//     console.log(req.body)
//     Validate_Session(req).then( (SessionResult) => {

//         if(SessionResult.length)
//         {
//             if(req.body.Visibility == "Anonymous" || req.body.Visibility == "Public")
//             {
//                 if(req.body.Content.length >= 5 && req.body.Content.length <= 280)
//                 {
//                     let json_to_post = {
//                         Timestamp : Date.now(),
//                         Content : req.body.Content,
//                         Visibility : req.body.Visibility
//                     }

//                     let posts_db_dir = "./Media/" + SessionResult[0].Username + "/Posts.db";
//                     const posts_db = new Datastore(posts_db_dir);
//                     posts_db.loadDatabase();
//                     posts_db.insert(json_to_post);
//                     let verdict = {
//                         Status : "Pass",
//                         Description : "Successfully Posted!"
//                     }
//                     res.json(verdict);
//                 }
//                 else
//                 {
//                     if(req.body.Content.length < 5)
//                     {
//                         let verdict = {
//                             Status : "Fail",
//                             Description : "Content Length < 5"
//                         }
//                         res.json(verdict);
//                     }
//                     else
//                     {
//                         let verdict = {
//                             Status : "Fail",
//                             Description : "Content Length > 280"
//                         }
//                         res.json(verdict);
//                     }
//                 }
//             }
//             else
//             {
//                 let verdict = {
//                     Status : "Fail",
//                     Description : "Visibility Undefined"
//                 }
//                 res.json(verdict);
//             }    
//         }
//         else
//         {
//             let verdict = {
//                 Status : "Fail",
//                 Description : "Invalid Session"
//             }
//             res.json(verdict);
//         }


//     }) 
//}


function validateHeader(postHeader){ //function that checks if the header bg and the header font colors are actually valid is actually valid 
    
    if(postHeader.headerThemeBackground == '' && postHeader.usernameFontColor == '' && postHeader.emailFontColor == '') //no header selected
        return true;

    let bgJSON = JSON.parse(fs.readFileSync("./Customization_Datasets/Backgrounds.json","ascii"));
    //console.log(bgJSON)
    for (let [ThemeName, themeBackgrounds] of Object.entries(bgJSON)) { //iterating over the themes
        if(  themeBackgrounds[postHeader.headerThemeBackground] != undefined && themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.emailFontColor &&  themeBackgrounds[postHeader.headerThemeBackground].headerFontColor == postHeader.usernameFontColor)
            return true;
    }
    return false;
}

function validateContent(content){ //function that validates the content inputed

    if(content.length >= process.env.Min_Content_Length && content.length <= process.env.Max_Content_Length)
        return true;
    else
        return false;
}

function validateMoodBadge(moodBadge){ //function that validates the mood badge for any hazards

    if(moodBadge == 'N/A')
        return true;

    let moods = JSON.parse(fs.readFileSync("./Customization_Datasets/Moods.json","ascii"))

    for(let [moodTheme , thisThemeArray] of Object.entries(moods)) //iterating over emoji database
    {
        if(thisThemeArray.find(obj => obj.emoji == moodBadge) != undefined) //finding this emoji in DB
            return true;
    }
    return false;
}


function Post_it(req,res) { 
    Validate_Session(req).then(SessionResult => {

        if(SessionResult.length)
        {
            console.log(req.body)
            console.log(validateHeader(req.body.postHeader))
            let verdict = {
                check : {
                    headerValid : validateHeader(req.body.postHeader),
                    ContentValid : validateContent(req.body.content) ,
                    moodValid : validateMoodBadge(req.body.moodBadge),
                }
            }
            res.json(verdict)
        }
        else
        {
            let verdict = {
                Status : "Fail",
                Description : "Invalid Session"
            }
                res.json(verdict);
        }

    })
 }


module.exports = {Post_it};