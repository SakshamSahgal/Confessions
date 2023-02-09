let loadOverlay = document.getElementById("Load_overlay");


async function SendToServer(JSON_to_Send,Route)
{
        let send_package_obj = { //packing it in an object
        method : 'POST' ,
        headers : {
            'Content-Type' : 'application/json' //telling that i am sending a JSON
        } ,
        body : JSON.stringify(JSON_to_Send)
        }
    
        let server_response = await fetch(Route,send_package_obj);
        return await server_response.json()
}

function Logout()
{
        if(Cookies.get("Session_ID") == undefined)
            location.href = "./index.html";
        else
        {
            let Session_Data = {
                Session_ID : Cookies.get("Session_ID")
            }
        loadOverlay.hidden = false;  //Revealing the load overlay
        let Server_Response = SendToServer(Session_Data,"/logout_api");
        Server_Response.then((response)=>{
            loadOverlay.hidden = true; //hiding load overlay
            console.log(response);
            if(Cookies.get("Session_ID") != undefined)
                Cookies.remove("Session_ID");
            location.href = "./index.html";
        })
    }
}

function Validate_Session() //checks if the user is already logged in
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }

    if(Session.Session_ID != undefined )
    {
        loadOverlay.hidden = false; //revealing the load overlay

        SendToServer(Session,"/validate_session_api").then((response)=>{

            loadOverlay.hidden = true; //hiding the load overlay

            console.log(response);
            if(response.Status == "Invalid Session")
            {
                Cookies.remove("Session_ID");
                location.href = "./index.html";
            }
        });
    }
    else
        location.href = "./index.html";
}

Validate_Session();