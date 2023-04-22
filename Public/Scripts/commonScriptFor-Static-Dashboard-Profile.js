

function closePallet(id) //function to close overlay pallets by id passed to it
{
    document.getElementById(id).hidden = true;
}


function viewComments(postID,postPostedBy) //function called when we click on comment Btn
{
    alert(postID + " " + postPostedBy);
    document.getElementById("commentPallet").hidden = false;
}

function PostComment()
{
    let comment = document.getElementById("commentBox").value;
    document.getElementById("commentPallet").hidden = false; 
}

function react(reaction,postID,postedBy) //function called when we click on any reaction Btn
{
    // alert(reaction + " " + postID)
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {

        let reactJSON = {
            postedBy : postedBy,
            postID : postID,
            Reaction : reaction
        }

        console.log(reactJSON)
        loadOverlay.hidden = false;
        axios.put('/reactPost', reactJSON, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            
            if(response.data.Status == "Fail")
                alert(response.data.Description)
            else
            {
                //update the reaction count
                document.getElementById(postID + "_Angry").innerText = response.data.NewReactions.Angry.length;
                document.getElementById(postID + "_Sad").innerText = response.data.NewReactions.Sad.length
                document.getElementById(postID + "_Love").innerText = response.data.NewReactions.Love.length
                document.getElementById(postID + "_Laugh").innerText = response.data.NewReactions.Laugh.length
                document.getElementById(postID + "_Excited").innerText = response.data.NewReactions.Excited.length
            }
        })
    }
}