function main() {
  const form = FormApp.openById('1bYB8aH9O4zKag7avo3Nhwvfhm8I2r6ThgrRKkUnXgrM');
  const formResponses = form.getResponses();
  var dates = [4, 5, 6, 7, 8];
  const timeSlots = ['8:00 AM to 1:00 PM', '12:00 PM to 5:00 PM', '3:00 PM to 8:00 PM', '5:00 PM to 8:00 PM', 'Not today'];

  var timeSlotsLeft = []; // 2D array to store the available time slots for each day
  // Format:
  // [ [Day 1], [Day 2], ... ]
  // [ ['8:00 AM to 1:00 PM', '12:00 PM to 5:00 PM', '3:00 PM to 8:00 PM', '5:00 PM to 8:00 PM'], [], ...]

  for (var i = 0; i < dates.length; i++) {
    timeSlotsLeft.push([...timeSlots]); // Create a copy of timeSlots
  }
  console.log(timeSlotsLeft);

  // Create the initial availability with the maximum of 5 volunteers can register for each time slot.
  var availability = []; // A 2D array to store availability for each of 5 dates
  // Format:
  // [ [Day 1], [Day 2], ... ]
  // = [ [5, 5, 5, 5], [... ] ]

  for (var i = 0; i < dates.length; i++) {
    availability.push(new Array(4).fill(5));
  }
  console.log(availability);

  var timeReceiveEmails = [];
  //format
  //[[person 1], [person 2]]
  //everyone should only receive the reminder email once
  for (var i = 0; i < formResponses.length; i++) {
    timeReceiveEmails.push(0);
  }
  console.log(timeReceiveEmails);

  for (const formResponse of formResponses) {
    for (var i = 0; i < dates.length; i++) {
      var itemIndex = dates[i];
      var item = form.getItems()[itemIndex];
      var itemResponse = formResponse.getResponseForItem(item);
      var stringResponse = itemResponse.getResponse();
      if (stringResponse != 'Not today') {
        var choices = item.asMultipleChoiceItem().getChoices(); // an array of choices in the item
        // asMultipleChoiceItem() converts data type itemResponse to multiple choice
        var selectedChoiceIndex = -1;
        for (var j = 0; j < choices.length - 1; j++) {
          if (choices[j].getValue() == stringResponse) { // compare string with string
            selectedChoiceIndex = j; // determine the choice index in the item
            break;
          }
        }
        updateAvailability(availability, i, selectedChoiceIndex, timeSlotsLeft, item, stringResponse);
      }
    }
  }

  // Emailing reminder
  // This reminds volunteers of the specific time that they have registered for each day
  var mostRecentFormResponse = formResponses[formResponses.length - 1];
  sendReminderEmails(mostRecentFormResponse);

  console.log(availability);
  console.log(timeSlotsLeft);
}

// Update the availability
function updateAvailability(availability, date, choiceIndex, timeSlotsLeft, item, stringResponse) {
  if (availability[date][choiceIndex] > 1) { // check availability to update it
    availability[date][choiceIndex]--;
  } else if (availability[date][choiceIndex] == 1) { // case when the time option for the date is unavailable
    availability[date][choiceIndex]--;
    // Delete an element in availability
    availability[date] = availability[date].filter(function (element2) {
      return element2 !== availability[date][choiceIndex];
    });
    // Delete an element in timeSlotsLeft
    timeSlotsLeft[date] = timeSlotsLeft[date].filter(function (element) {
      return element !== stringResponse;
    });
    item.asMultipleChoiceItem().setChoiceValues(timeSlotsLeft[date]); // reset choices for an item
  }
}

// Update the sendReminderEmails function
function sendReminderEmails(formResponse) {
  const responseData = formResponse.getItemResponses();

  // Extract relevant information from the form response
  const email = formResponse.getRespondentEmail();

  let registrationDetails = '';

  for (const response of responseData) {
    const question = response.getItem().getTitle();
    const answer = response.getResponse();

    // Check if this is a date and time question
    if (question.startsWith('What time on December')) {
      registrationDetails += `${question}: ${answer}\n`;
    }
  }

  // Send an email reminder to the volunteer
  const subject = 'Volunteer Time Slot Reminder';
  const message = `Hello,\n\nThank you for volunteering at WoMen of Connection Ministry!\n\nYou have registered for the following time slot:\n\n${registrationDetails}\nPlease arrive on time.\n\nBest regards,\nWoMen of Connection Ministry`;
  
  // Send the email using MailApp or GmailApp
  MailApp.sendEmail(email, subject, message);
  
}