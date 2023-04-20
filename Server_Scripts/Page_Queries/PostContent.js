const { Validate_Session } = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const fs = require("fs");
//Dotenv
require("dotenv").config();//reading the .env file

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

function validateVisibility(visibility){
    return ( ["Anonymous","Buddies-Only","Global"].includes(visibility) ); //checking if the visibility is any one of the three
}

function Post_it(req,res) { 

    Validate_Session(req).then(SessionResult => {

        if(SessionResult.length)
        {
            console.log(req.body)

            let check = {
                headerValid : validateHeader(req.body.postHeader),
                ContentValid : validateContent(req.body.content) ,
                moodValid : validateMoodBadge(req.body.moodBadge),
                visibilityValid : validateVisibility(req.body.visibility)
            }

            if(check.headerValid && check.ContentValid && check.moodValid && check.visibilityValid) //Everything is valid
            {

                let userPostDB = new Datastore("./Media/" + SessionResult[0].Username + "/Posts.db");
                userPostDB.loadDatabase();
                let postJSON = req.body;

                postJSON = {
                    PostType : "Post",
                    Visibility : req.body.visibility,
                    Content : req.body.content,
                    MoodBadge : req.body.moodBadge,
                    PostHeader : {
                        HeaderThemeBackground : req.body.postHeader.headerThemeBackground,
                        UsernameFontColor : req.body.postHeader.usernameFontColor,
                        EmailFontColor : req.body.postHeader.emailFontColor
                    },
                    PostedBy : SessionResult[0].Email,
                    Timestamp : Date.now()
                }
                
                console.log(postJSON)

                userPostDB.insert(postJSON,(err,newDoc) => {

                    if(err)
                    {
                        console.log(err);

                        let verdict = {
                            Status : "fail",
                            Description : err
                        }
                        res.json(verdict)
                    }
                    else
                    {
                        let verdict = {
                            Status : "Pass",
                            Description : "Successfully Posted",
                            Check : check
                        }
                        res.json(verdict)
                    }
                })

            }
            else
            {
                let verdict = {
                    status : "Fail",
                    Description : "One or more post format is wrong",
                    check : check
                }
                res.json(verdict)
            }
            
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