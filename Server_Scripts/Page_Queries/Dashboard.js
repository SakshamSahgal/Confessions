
const {Validate_Session} = require("../Auth/validate_session.js");
const fs = require("fs")


function Fetch_Dashboard(req,res)
{
    Validate_Session(req).then( (Session_Result) => {
        
        if(Session_Result.length) //session Exists
        {
            let verdict={
                Status : "Pass",
                Profile_Picture : Session_Result[0].Profile_Picture,
                Email : Session_Result[0].Email,
                Username : Session_Result[0].Username
            }

            res.json(verdict);
        }
        else
        {
            let verdict={
                Status : "Pass",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    })
}

function Fetch_All_Themes(req,res) {  

     Validate_Session(req).then( Session_Result => { //validating the session

        if(Session_Result.length) //If Session Exists
        {
            
            let headers = { } //object that contains all the info of this theme
            
            let HeaderThemesTextColor = JSON.parse(fs.readFileSync("./Public/GUI_Resources/Backgrounds.json","ascii")) //reading font color json 
            const headerThemes = fs.readdirSync("./Public/GUI_Resources/Backgrounds"); //reading all the theme names
            
            headerThemes.forEach( themeName => { //iterating over theme names
                
                console.log(themeName);

                let ThisTheme = [] //array that stores all the data of this theme

                const headerBackgrounds = fs.readdirSync("./Public/GUI_Resources/Backgrounds/" + themeName); //accessing all the background inside this theme
                
                headerBackgrounds.forEach( headerBackgroundName => { //iterating over backgrounds in this theme 
                    
                    console.log(headerBackgroundName);

                    let thisHeader = {
                        path : "./GUI_Resources/Backgrounds/" + themeName + "/" + headerBackgroundName,
                        HeaderFontColor : HeaderThemesTextColor[themeName][headerBackgroundName.split(".")[0]].headerFontColor
                    }

                    ThisTheme.push(thisHeader)
                })

                headers[themeName] = ThisTheme
            })


            let verdict = {
                Status : "Pass",
                Description : "Fetched Themes Successfully" ,
                headers : headers,
            }
    
            res.json(verdict);
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
     })
}

module.exports = {Fetch_All_Themes,Fetch_Dashboard}