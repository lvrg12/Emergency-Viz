"use strict";

/**
 * 
 * @param {String} user 
 * @param {String} time 
 * @param {String} text 
 * @returns {HTMLDivElement} 
 */
function genPost(user, time, text) {
    const post = document.createElement("div");
    post.className = "post";

    const left = document.createElement("div");
    left.className = "post-left";
    post.appendChild(left);

    const right = document.createElement("div");
    right.className = "post-right";
    post.appendChild(right);

    const pfp = document.createElement("div");
    pfp.className = "pfp";
    left.appendChild(pfp);

    const userDiv = document.createElement("div");
    userDiv.className = "user";
    right.appendChild(userDiv);

    const timeDiv = document.createElement("div");
    timeDiv.className = " - time";
    right.appendChild(timeDiv);

    const textDiv = document.createElement("div");
    textDiv.className = "text";
    right.appendChild(textDiv);

    pfp.innerHTML = user[0].toUpperCase();
    userDiv.innerHTML = "@" + user;
    timeDiv.innerHTML = time.toJSON();
    textDiv.innerHTML = text;

    return post;
};

function updatePosts(arr) {
    const posts = document.querySelector("#posts");
    posts.innerHTML = "";

    for (let i = 0; i < arr.length; i++) {
        let json = arr[i];

        posts.appendChild(genPost(
            json.account,
            json.time,
            json.message
        ));
    }
}

window.addEventListener("load", function(){
    const postButton = document.querySelector("#postButton");
    let show = false;

    postButton.addEventListener("click", function(){
        const content = document.querySelector("#content");
        const posts = document.querySelector("#posts");

        show = !show;

        content.className = show ? "left-col" : "";
        posts.className = show ? "right-col" : "not-visible";
        postButton.value = (show ? "Hide" : "Show") + " Posts";
    });
}, false);
