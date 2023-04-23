
require("dotenv").config();//reading the .env file
const bcrypt = require("bcrypt");
const path = require('path');
const archiver = require('archiver');

function getDBsZip(req,res)
{
    if(req.headers.authorization == undefined)
        res.json({Error : "Not Authorized"});
    else
    {
        bcrypt.compare(req.headers.authorization,process.env.AdminHash).then((IsMatched) => {

            if(IsMatched)
            {
                databaseFolderPath = (path.join(__dirname, "../../Database"))
                mediaFolderPath = (path.join(__dirname, "../../Media"))

                console.log(databaseFolderPath)
                console.log(mediaFolderPath)

                console.log(fs.existsSync(databaseFolderPath))
                console.log(fs.existsSync(mediaFolderPath))

                // create a new zip archive

                const archive = archiver('zip', {
                zlib: { level: 9 } // compression level for the archive
                });
                
                
                res.setHeader('Content-disposition', 'attachment; filename=databases.zip'); // set the content-disposition header to attachment and set the filename   
                archive.pipe(res); // pipe the archive data to the response object
                archive.directory(databaseFolderPath, 'Database'); // add the folder to the archive with the specified name  
                archive.directory(mediaFolderPath, 'Media'); // add the folder to the archive with the specified name  
                archive.finalize(); // finalize the archive (write the zip data to the response)
            }
            else
                res.json({Error : "Not Authorized"});
        })
    }
}

module.exports = {getDBsZip}