document.addEventListener("DOMContentLoaded", function ()
{
    // Use buttons to toggle between views
    document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
    document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
    document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
    document.querySelector("#compose").addEventListener("click", compose_email);
    document.querySelector("#compose-form").addEventListener("submit", reply);
    // By default, load the inbox
    load_mailbox("inbox");
});

function archive(event)
{
    let email_id = this.parentElement.className.split(" ")[2];
    if (this.className.split(" ")[2] == "archived")
    {
        fetch(`/emails/${email_id}`, {
            method: "PUT",
            body: JSON.stringify({
                archived: false,
            }),
        }).then(() => load_mailbox("inbox"));
    } else
    {
        fetch(`/emails/${email_id}`, {
            method: "PUT",
            body: JSON.stringify({
                archived: true,
            }),
        }).then(() => load_mailbox("inbox"));
    }
}

function read(event)
{
    let email_id = this.parentElement.className.split(" ")[2];
    console.log("YES");
    fetch(`/emails/${email_id}`, {
        method: "PUT",
        body: JSON.stringify({
            read: true,
        }),
    });
    fetch(`/emails/${email_id}`)
        .then((response) => response.json())
        .then((email) =>
        {
            // Print emails
            document.querySelector("#emails-view").innerHTML = `
                <div class="email read ${email["id"]}">
                    <p>Sender : <span class="sender">${email["sender"]}</span> </p>
                    <p>Subject : <span class="subject">${email["subject"]}</span></p>
                    <p>Recipients : <span>${email["recipients"]}</span></p>
                    <p>Body : <span class="email_body">${email["body"]}</span></p>
                    <button class="btn btn-outline-primary reply"  type="submit">Reply</button>
                    ${email["archived"]
                    ? `<button class="btn btn-outline-primary archived"  type="submit">Remove From Archive</button>`
                    : `<button class="btn btn-outline-primary archive"  type="submit">Archive</button>`
                }
                    <span class="email_time">${email["timestamp"]}</span>

                </div>
                `;
        })
        .then(() =>
        {
            document.querySelector(".reply").addEventListener("click", reply);
            document.querySelectorAll(".archive").forEach((button) =>
            {
                button.addEventListener("click", archive);
            });
        });
}

function reply(event)
{
    let recipients = document.querySelector("#compose-recipients");
    let subject = document.querySelector("#compose-subject");
    if (event.type == "click")
    {
        document.querySelector("#emails-view").style.display = "none";
        document.querySelector("#compose-view").style.display = "block";
        recipients.value = document.querySelector(".sender").innerHTML;
        let subject_class = document.querySelector(".subject").innerHTML;
        console.log(subject_class);
        document.querySelector("#compose-body").innerHTML = `On ${document.querySelector(
            ".email_time"
        ).innerHTML} ${document.querySelector(".sender").innerHTML} wrote : ${document.querySelector(".email_body").innerHTML}`;
        if (subject_class.includes("Re:"))
        {
            subject.value = subject_class;
        } else
        {
            console.log("LOLOL");
            subject.value = `RE: ${subject_class}`;
        }
    } else
    {
        let body = document.querySelector("#compose-body").value;
        event.preventDefault();
        fetch("/emails", {
            method: "POST",
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body,
            }),
        })
            .then((response) => response.json())
            .then((result) =>
            {  
                event.preventDefault();
                load_mailbox("sent");
            });
    }
}

function compose_email()
{
    // Show compose view and hide other views
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "block";

    // Clear out composition fields
    document.querySelector("#compose-recipients").value = "";
    document.querySelector("#compose-subject").value = "";
    document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox)
{
    //<p>Body : <span>${email["body"]}</span></p>
    if (mailbox == "inbox")
    {
        fetch("/emails/inbox")
            .then((response) => response.json())
            .then((emails) =>
            {
                // Print emails
                for (let [index, email] of emails.entries())
                {
                    document.querySelector("#emails-view").innerHTML += `
                        <div class="email ${email["read"] ? `read` : `not_read`} ${email["id"]}">
                            <p>Sender : <span>${email["sender"]}</span> </p>
                            <p>Subject : <span>${email["subject"]}</span></p>
                            <span>${email["timestamp"]}</span>
                            <button class="btn btn-outline-primary read_button"  type="submit">Read</button>
                            <button class="btn btn-outline-primary archive"  type="submit">Archive</button>
                        </div>
                        `;
                }
                document.querySelectorAll(".archive").forEach((button) =>
                {
                    button.addEventListener("click", archive);
                });
                document.querySelectorAll(".read_button").forEach((button) =>
                {
                    button.addEventListener("click", read);
                });
                // ... do something else with emails ...
            });
    } else if (mailbox == "sent")
    {
        console.log("BBBB");
        fetch("/emails/sent")
            .then((response) => response.json())
            .then((emails) =>
            {
                // Print emails
                for (let [index, email] of emails.entries())
                {
                    document.querySelector("#emails-view").innerHTML += `
                <div class="email ${email["id"]}">
                    <p>To : <span>${email["recipients"][0]}</span> </p>
                    <p>Subject : <span>${email["subject"]}</span></p>
                    <p>Body : <span>${email["body"]}</span></p>
                    <button class="btn btn-outline-primary archive"  type="submit">Archive</button>
                </div>
                `;
                }
                document.querySelectorAll(".archive").forEach((button) =>
                {
                    button.addEventListener("click", archive);
                });
                document.querySelectorAll(".read_button").forEach((button) =>
                {
                    button.addEventListener("click", read);
                });
                console.log("CCCC");
                // ... do something else with emails ...
            });
    } else if (mailbox == "archive")
    {
        fetch("/emails/archive")
            .then((response) => response.json())
            .then((emails) =>
            {
                // Print emails
                for (let [index, email] of emails.entries())
                {
                    if (email["read"])
                    {
                        document.querySelector("#emails-view").innerHTML += `
                        <div class="email read ${email["id"]}">
                            <p>Sender : <span>${email["sender"]}</span> </p>
                            <p>Subject : <span>${email["subject"]}</span></p>
                            <span>${email["timestamp"]}</span>
                            <button class="btn btn-outline-primary read_button"  type="submit">Read</button>
                            <button class="btn btn-outline-primary archived"  type="submit">Remove From Archive</button>
                        </div>
                        `;
                    } else
                    {
                        document.querySelector("#emails-view").innerHTML += `
                        <div class="email not_read ${email["id"]}">
                            <p>Sender : <span>${email["sender"]}</span> </p>
                            <p>Subject : <span>${email["subject"]}</span></p>
                            <span>${email["timestamp"]}</span>
                            <button class="btn btn-outline-primary read_button"  type="submit">Read</button>
                            <button class="btn btn-outline-primary archived"  type="submit">Remove From Archive</button>

                        </div>
                        `;
                    }
                }
                document.querySelectorAll(".archived").forEach((button) =>
                {
                    button.addEventListener("click", archive);
                });
                document.querySelectorAll(".read_button").forEach((button) =>
                {
                    button.addEventListener("click", read);
                });
            });
    }
    // Show the mailbox and hide other views
    document.querySelector("#emails-view").style.display = "block";
    document.querySelector("#compose-view").style.display = "none";

    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}
