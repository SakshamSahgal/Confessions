let loadOverlay = document.getElementById("Load_overlay");


function Logout()
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {    
        loadOverlay.hidden = false;  //Revealing the load overlay
        
        axios.put('/logout_api',{},{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID") }}).then(response => {
            
            console.log(response.data);
            loadOverlay.hidden = true; //hiding load overlay

            if(Cookies.get("Session_ID") != undefined)
                Cookies.remove("Session_ID");
            location.href = "./index.html";
        })
    }
}


function Fetch_Dashboard() //function called at the page load [fetches dashboard content]
{
    if(Cookies.get("Session_ID") == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        axios.get('/Fetch_Dashboard_api',{headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            if(response.data.Status == "Pass")
                document.getElementById("profile_picture").src = response.data.Profile_Picture;
            else
                alert(response.data.Description);
        })
    }
}

function Post_it()
{
    
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;

        let JSON_to_Send = {
            Visibility : document.getElementById("visibility_Select").value,
            Content : document.getElementById("Post_Content").value
        }

        axios.post('/Post_it_api', JSON_to_Send, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            alert(response.data.Description);
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