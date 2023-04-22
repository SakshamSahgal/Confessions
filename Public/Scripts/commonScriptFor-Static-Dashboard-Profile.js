
let postIDGot="";
let postPostedByGot="";

function closePallet(id) //function to close overlay pallets by id passed to it
{
    document.getElementById(id).hidden = true;
}


function viewComments(postID,postPostedBy) //function called when we click on comment Btn
{
    // alert(postID + " " + postPostedBy);
    document.getElementById("commentPallet").hidden = false;
    
    postIDGot = postID;
    postPostedByGot = postPostedBy;

    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        axios.get('/getComments/'+ postPostedBy +"/" + postID, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            console.log(response.data);
            loadOverlay.hidden = true;
            if(response.data.Status == "Fail")
                alert(response.data.Description)
            else
                displayComments(response.data.Comments)
        })
    }
}

function PostComment() //function called when we click on post comment Btn
{
    if(Cookies.get("Session_ID") == undefined)
        location.href = "./index.html";
    else
    {
        
        CommentJSON = {
            postPostedBy : postPostedByGot,
            postID : postIDGot,
            comment : document.getElementById("commentBox").value
        }

        loadOverlay.hidden = false;
        console.log(CommentJSON)

        axios.post("/commentPost", CommentJSON, {headers: {'Content-Type': 'application/json','Authorization': Cookies.get("Session_ID")}}).then(response => {
            
            loadOverlay.hidden = true;
            console.log(response.data);

            if(response.data.Status == "Fail")
                alert(response.data.Description)
            else
                displayComments(response.data.NewCommentList)
        })
    }
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


function displayComments(CommentsArray) //function that displays the comments
{
    document.getElementById("commentPallet").hidden = false;
    document.getElementById("commentsList").innerHTML = ""; //clearing the comments list
    CommentsArray.forEach(thisComment => {
        let DisplayComments = `
                                <div class="card" style="max-width: 80vw; border:5px solid black">
    
                                        <div class="card-header previewPostCardHeader">

                                                <div>

                                                    <table>
                                                        <tr> 
                                                            <td> <img src="../${thisComment.Profile_Picture}" alt="Profile Picture" class="rounded-circle me-3" width="30"> </td> 
                                                            <td> 
                                                                <div>
                                                                    <a href='/Profiles/${thisComment.Username}'  class="m-0 headerText" style="font-size: 15px;">${thisComment.Username}</a>
                                                                    <br>
                                                                    <small class="headerText" style="font-size: 10px;">${thisComment.CommentedBy}</small>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                
                                                </div>   
                                                
                                        </div>

                                        <div class="card-body">
                                            <p class="card-text postTextPreviewPlaceHolder">${thisComment.Comment}</p>
                                        </div>
                                        <div class="card-footer">
                                            <div class="d-flex align-items-center">
                                            <small style="font-size: 10px;position: absolute;right: 30;"> &nbsp;${Convert_Timestamp_To_Date(thisComment.CommentedAt)}</small>
                                            </div>
                                        </div>
                                </div>`;
        
        
        document.getElementById("commentsList").innerHTML += DisplayComments;
    })
}