document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#reply').addEventListener('click', reply_email);




  // By default, load the inbox
  load_mailbox('inbox');
  //---------------------sendEmail---------------------------//
  document.querySelector('#compose-form').onsubmit = function (e) {
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;


    if(recipients === null||recipients == ""){

      alert("At least one recipient required.")

    }
    else{
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
        })
      })
      .then(response => response.json())
      .then(result => {
          
        if(result.error == undefined){
          alert(result.message)
          load_mailbox('sent');
        }else{
          alert(result.error)
          return false
        }
        console.log(result.error)
      });
    } 
  };
});

//-------------------------------------------------------------//
function clear_mailbox() {
  document.querySelectorAll(".table-row").forEach(e => e.parentNode.removeChild(e));;
}
//---------------------------------------------------------------//
function compose_email(recipients, subject, body, tsp) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email-complete').style.display = 'none';

  // set up composition fields
  if (subject === 'undefined' || subject === null || subject === undefined) {
    document.querySelector('#compose-recipients').focus()
    document.querySelector('#compose-recipients').value = "";
    document.querySelector('#compose-subject').value = "";
    document.querySelector('#compose-body').value = "";

  } else {
    document.querySelector('#compose-recipients').value = recipients;
    if (subject.includes("Re:")){
      document.querySelector('#compose-subject').value = subject;
    }
    else{
      document.querySelector('#compose-subject').value = "Re:"+subject;
    }
    document.querySelector('#compose-body').value = "\nOn " + tsp + " " + recipients + " wrote:\n\n" + body;
    document.querySelector('#compose-body').focus();
    document.querySelector('#compose-body').setSelectionRange(0, 0)
  }


};
//--------------------------------loadMailBox--------------------------------//
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email-complete').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //---------------CreateTableForMail--------------------------//
  const table = document.createElement('TABLE');
  table.setAttribute('class', 'table');
  document.querySelector('#emails-view').appendChild(table);

  load_mails(mailbox)
};

//--------------------------------------loadMails-----------------------------//
function load_mails(mailbox) {
  // Load mails
  const mailbox_url = `/emails/${mailbox}`;

  fetch(mailbox_url)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      for (email in emails) {
        //It Creates rows and data for table
        const element = document.createElement('TR');
        element.setAttribute('class', "table-row");
        element.setAttribute('id', `${emails[email].id}`)
        if (emails[email].read == false) {
          element.style.backgroundColor = 'white';
        } else {
          element.style.backgroundColor = '#ededed';
        };

        element.innerHTML = `
                  <td>${emails[email].sender}</td>
                  
                  <td><span style="font-weight:900;">${emails[email].subject}</span> - ${emails[email].body.substring(0,20)}...</td>
                  <td>${emails[email].timestamp}</td>
                `;
        document.querySelector(".table").appendChild(element);
      };
      console.log(mailbox_url)
      //... do something else with emails ...
      document.querySelectorAll(".table-row").forEach(tr => {
        tr.onclick = () => {

          let emailValue = `emails/${event.currentTarget.id}`;
          load_Email_View(emailValue);

        };
      });
    });
}

//--------------loadEmailCompleteView---------------//
function load_Email_View(emailValue) {

  fetch(emailValue)
    .then(response => response.json())
    .then(email => {
      //---------------------Print-Email-----------------------//
      document.querySelector('#email-subject').innerHTML = `${email.subject}`
      document.querySelector('.email-body').innerHTML = `<p style="white-space:pre-wrap" id="email-body-text">${email.body}</p>`;
      document.querySelector('.sender').innerHTML = `${email.sender}`;
      document.querySelector('.recipient').innerHTML=`${email.recipients[0]}`;
      document.querySelector('.tsp').innerHTML = `${email.timestamp}`
      if (email.archived == false) {
        document.querySelector('#archv').innerHTML = 'Archive';
      } else if (email.archived == true) {
        document.querySelector('#archv').innerHTML = 'Unarchive';
      }
    });
  //-------------------changeReadStatus----------------------//
  fetch(emailValue, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email-complete').style.display = 'block';
  document.querySelector('#archv').addEventListener('click', () => archive(emailValue));
}
//-------------------ChangeAchiveStatus------------------//
function archive(emailValue) {

  fetch(emailValue)

    .then(response => response.json())

    .then(email => {
      if (email.archived == false) {
        fetch(emailValue, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        });
      } else if (email.archived == true) {
        fetch(emailValue, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        });
      };
    });
  location.reload()
}

function reply_email(emailValue) {

  let recipients = document.querySelector('.sender').innerHTML;
  let subject = document.querySelector('#email-subject').innerHTML;
  let body = document.querySelector('#email-body-text').innerHTML;
  let tsp = document.querySelector('.tsp').innerHTML

  compose_email(recipients, subject, body, tsp)
}