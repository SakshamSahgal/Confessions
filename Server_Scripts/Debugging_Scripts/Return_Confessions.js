//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 


function Return_ConessionDBs(res)
{
    let verdict = [];
    const files = fs.readdirSync("./Media");
    
    let no_of_files = 0;
    files.forEach(filename => {no_of_files++}); //counting nuber of users

    console.log("No of users = " + no_of_files);

    files.forEach( filename => {
        
        console.log(filename);

        let got_user = {
            Username : filename,
            Confessions_Got_DB : [],
            Confessions_Sent_DB : []
        }

        let Confessions_Got_DB_of_this_user = new Datastore("./Media/" + filename + "/Confessions_Got.db");
        let Confessions_Sent_DB_of_this_user = new Datastore("./Media/" + filename + "/Confessions_Sent.db");

        Confessions_Got_DB_of_this_user.loadDatabase();
        Confessions_Got_DB_of_this_user.find({},(err,got_array) => {

            got_user.Confessions_Got_DB = got_array;

            Confessions_Sent_DB_of_this_user.loadDatabase();
            Confessions_Sent_DB_of_this_user.find({},(err,sent_array) => {

                got_user.Confessions_Sent_DB = sent_array;
                verdict.push(got_user);

                if(verdict.length == no_of_files)
                    res.json(verdict);


            })

        })
        

    })
}

module.exports = {Return_ConessionDBs}