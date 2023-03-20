let loadOverlay = document.getElementById("Load_overlay");
let Confessions_Pallet =  document.getElementById("Confessions_Pallet");

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

    function Logout() //function called when user logs out
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

    function Fetch_Profile_Page() //funtion fetches the static profile data
    {
        let req_json = {
            Session_ID : Cookies.get("Session_ID") ,
            Username : ((window.location.href).split("/")[4]).split(".")[0] //getting the usrename from the URL
        }
        
        console.log(req_json);

        if(req_json.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            loadOverlay.hidden = false; //revealing the load overlay

            SendToServer(req_json,"/Fetch_Static_Profile_api").then((response) => {
                console.log(response);
                loadOverlay.hidden = true; //hiding the load overlay
                if(response.Status == "Pass")
                {
                    document.getElementById("Profile_Photo").src = "../" + (response.His_Profile_Picture);
                    document.getElementById("Username").textContent = response.Username;
                    document.getElementById("user_bio").textContent = response.Bio;
                    document.getElementById("User_Gender").textContent = response.Gender;
                    document.getElementById("User_Email").textContent = response.Email;
                    document.getElementById("Activity_Status").textContent = response.Activity_Status;
                    document.getElementById("profile_picture").src = "../" + response.My_Profile_Picture;

                    if(response.Activity_Status == "Online")
                        document.getElementById("Activity_Status").style="color: green;";
                    else
                        document.getElementById("Activity_Status").style="color: red;";
                }
                else
                {
                    if(response.Description == "You are accessing your Own Profile")
                        location.href = "../Profiles.html";
                    else
                        alert(response.Description);
                }
            })
        }
    }

    function Logout()
    {
        let Session = {
            Session_ID : Cookies.get("Session_ID")
        }
    
        if(Session.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            loadOverlay.hidden = false;
            let Server_Response = SendToServer(Session,"/logout_api");
            Server_Response.then((response)=>{
                loadOverlay.hidden = true;
                console.log(response);
                if(Cookies.get("Session_ID") != undefined)
                    Cookies.remove("Session_ID");
                location.href = "../index.html";
            })
        }
    }

    function Submit_Confession() //function called when user submits an anonymous confession form
    {
        let Session = {
            Session_ID : Cookies.get("Session_ID"),
            Confessed_To_Email : document.getElementById("User_Email").textContent, //getting the username from the URL
            Confession_Data : document.getElementById("confession_data").value,
        }

        if(Session.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            console.log("Submitting Confession" , Session);
            loadOverlay.hidden = false;
            SendToServer(Session,"/Confess_api").then((response) => {
                loadOverlay.hidden = true;
                console.log(response);
                alert(response.Description);
            })
        }

    }

    function Close_Confession_Pallet()
    {
        Confessions_Pallet.hidden = true;
    }


    function View_Confessions()
    {
        Confessions_Pallet.hidden = false;
        let Session = {
            Session_ID : Cookies.get("Session_ID"),
            Username_To_Fetch : document.getElementById("Username").textContent
        }

        if(Session.Session_ID == undefined) //someone tried accessing through link [he'll be redirected]
            location.href = "../index.html";
        else
        {
            console.log(Session);
            loadOverlay.hidden = false;
            SendToServer(Session,"/fetch_static_confessions_got_api").then((response) => {
                console.log(response);
                display_confessions_got_data(response.Confessions_Got_array);
                loadOverlay.hidden = true;
                alert(response.Description);
            })
        }

    }

    function display_confessions_got_data(confessions_got_array) //function displays the ftched confessions data 
    {
        let Confessions_Got_List = document.getElementById("Confessions_Got_div");
        Confessions_Got_List.innerHTML = ""; //emptying the prefiously fetched data
        confessions_got_array.forEach((element) => {

            // anchor tag for list element
            let this_a = document.createElement("a"); 
            this_a.href = "#/";
            this_a.classList.add("list-group-item");  //Adding Bootstrap CSS Classes
            this_a.classList.add("list-group-item-action");
            this_a.classList.add("flex-column");
            this_a.classList.add("align-items-start");
            this_a.classList.add("list-group-item-info");
    
            let this_div = document.createElement("div");
            this_div.classList.add("d-flex");
            this_div.classList.add("w-100");
            this_div.classList.add("justify-content-between");
            
            let this_h5_content_heading = document.createElement("h5");
            this_h5_content_heading.classList.add("mb-1");
            this_h5_content_heading.innerHTML = 'Anonymous Confession';
            
            let this_small_timestamp = document.createElement("small");
            this_small_timestamp.innerHTML = element.Timestamp;
    
            let this_p_content = document.createElement("p");
            this_p_content.classList.add("mb-1");
            this_p_content.innerHTML = element.Confession;
    
            this_div.appendChild(this_h5_content_heading);
            this_div.appendChild(this_small_timestamp);
            this_a.appendChild(this_div);
            this_a.appendChild(this_p_content);
            Confessions_Got_List.appendChild(this_a); //appending the list anchor to the list
        })

    }

    function Add_Buddy()
    {
        alert("Add Buddy");
        let Session = {
            Session_ID : Cookies.get("Session_ID"),
            Buddied_Email : document.getElementById("User_Email").textContent
        }

        if(Session.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            console.log("Sending" , Session);   
            SendToServer(Session,"/Add_Buddy_api").then((response) => {
                console.log(response);
            })

        }
    }

    Fetch_Profile_Page();