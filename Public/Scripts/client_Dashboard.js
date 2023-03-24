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


function Fetch_Dashboard() //function called at the page load [fetches dashboard content]
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")
    }
    if(Session.Session_ID == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        SendToServer(Session,"/Fetch_Dashboard_api").then( (response)=> {
            console.log(response);
            loadOverlay.hidden = true;
            if(response.Status == "Pass")
            {
                document.getElementById("profile_picture").src = response.Profile_Picture;
            }
            else
                alert(response.Description);

        })
    }
}

function Post_it()
{
    let JSON_to_Send = {
        Session_ID : Cookies.get("Session_ID"),
        Visibility : document.getElementById("visibility_Select").value,
        Content : document.getElementById("Post_Content").value
    }

    console.log(JSON_to_Send);
    if(JSON_to_Send.Session_ID == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        SendToServer(JSON_to_Send,"/Post_it_api").then( (response) => {
            loadOverlay.hidden = true;
            console.log(response);
            alert(response.Description);
        })
    }
}

function Update_Info_Details()
{ 
   if(document.getElementById("visibility_Select").value == "Public")
        document.getElementById("visibility_info").innerHTML = "[People who Buddied you, will know you posted this]"
   else
        document.getElementById("visibility_info").innerHTML = "[No one will know you posted this]"
}


Fetch_Dashboard();