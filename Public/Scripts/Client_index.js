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

    function Register_Email()
    {
        let Register = {
        Email : document.getElementById("register_email").value,
        }
        console.log(Register);
        loadOverlay.hidden = false;
         SendToServer(Register,"/Register_Email_api").then((response) => {
            loadOverlay.hidden = true;
             console.log(response);   
             if(response.Status == "Pass")
             {
                document.getElementById("Register_Email_Div").hidden = true; //hiding email div
                document.getElementById("Register_Username_Div").hidden = false; //revealing username div

             }  
             else
                alert(response.Description);       
        })
    }

    function Register_Username()
    {
        console.log("Register_USERNAME");
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value
        }

        loadOverlay.hidden = false;
        SendToServer(Register,"/Register_Username_api").then((response)=>{
            loadOverlay.hidden = true;
            console.log(response);
            
            if(response.Status == "Pass")
            {
                document.getElementById("Register_Username_Div").hidden = true; //hiding username div
                document.getElementById("Register_OTP_Div").hidden = false; //revealing OTP div
            }
            else
                alert(response.Description);
        })

    }

    function Register_OTP()
    {
        console.log("Register_OTP");
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value,
            OTP : document.getElementById("register_otp").value
        }
        loadOverlay.hidden = false;
        SendToServer(Register,"/Register_OTP_api").then((response)=>{
            loadOverlay.hidden = true;
            console.log(response);
            if(response.Status == "Pass")
            {
                document.getElementById("Register_OTP_Div").hidden = true;//hiding OTP div
                document.getElementById("Register_Password_Div").hidden = false;//revealing register password div
            }
            else
                alert(response.Description);
        })
    }


    function Register_Password()
    {
        console.log("Register_Password");
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value,
            Password :document.getElementById("register_password").value
        }

        SendToServer(Register,"/Register_Password_api").then((response)=>{
            console.log(response);
            if(response.Status == "Pass")
            {
                alert(response.Description);
                window.location.reload();//refresh page
            }
            else
                alert(response.Description);
        }) 

    }