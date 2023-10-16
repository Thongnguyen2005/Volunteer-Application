/*
Thong Nguyen
Project: Volunteer Application
Project's purpose: The project lets people apply for voluteering by choosing the available dates and times left over for days 
between 13 and 17th December. There are 5 time slots they can choose: 8am - 8pm, 8am - 1pm, 12pm - 5pm, 3pm -8pm, and 5pm - 8pm.
However, not all of them are available since slots might be taken by other people. Therefore, the main purpose of coding is to
make the system counts how many people have chosen that specific time slot for a specific date to determine the number of slots left
and whether new volunteers can apply for that time. If all time slots of a day runs out of slot, the google from should hide the options to let the applicants know that volunteering options of that date are no longer available.
*/

function main(){
  const form = FormApp.openById('1bYB8aH9O4zKag7avo3Nhwvfhm8I2r6ThgrRKkUnXgrM');
  const formResponses = form.getResponses();
  var dates = [4, 5, 6, 7, 8];
  const timeSlots = ['8:00 AM to 1:00 PM', '12:00 PM to 5:00 PM', '3:00 PM to 8:00 PM', '5:00 PM to 8:00 PM', 'Not today'];
  
  var timeSlotsLeft = []; //2D array to store the available time slots for each day
  //Format:
  // [ [Day 1], [Day 2], ... ]
  // [ ['8:00 AM to 1:00 PM', '12:00 PM to 5:00 PM', '3:00 PM to 8:00 PM', '5:00 PM to 8:00 PM'], [], ...]

  for (var i = 0; i < dates.length; i++) {
    timeSlotsLeft.push([...timeSlots]); // Create a copy of timeSlots
  }
  console.log(timeSlotsLeft);

  //create the initial availability with the maximum of 5 volunteers can register for each time slot.
  var availability = []; // A 2D array to store availability for each of 5 dates
  // Format: 
  //  [ [Day 1], [Day 2], ... ]
  //  = [ [5, 5, 5, 5], [... ] ]

  for(var i=0; i<dates.length; i++){
    availability.push(new Array(4).fill(5));
  }
  console.log(availability);
 
  for (const formResponse of formResponses) {
    for(var i=0; i<dates.length; i++){
      var itemIndex = dates[i];
      var item  = form.getItems()[itemIndex];
      var itemResponse = formResponse.getResponseForItem(item);
      var stringResponse = itemResponse.getResponse();
      if (stringResponse != 'Not today'){
        var choices = item.asMultipleChoiceItem().getChoices(); // an array of choices in the item
        //asMultipleChoiceItem() coverts data type itemResponse to multiple choice
        var selectedChoiceIndex = -1;  
        for (var j = 0; j < choices.length - 1; j++) {
          if (choices[j].getValue() == stringResponse) { //compare string with string
            selectedChoiceIndex = j; //determine the choice index in the item
            break;
          }
        }
        updateAvailability(availability, i, selectedChoiceIndex, timeSlotsLeft, item, stringResponse);
      } 
    }
  }
    console.log(availability);
    console.log(timeSlotsLeft);
     
}

//update the availability 
function updateAvailability(availability, date, choiceIndex, timeSlotsLeft, item, stringResponse) {
  if (availability[date][choiceIndex] > 1){ //check with availability to update it
    availability[date][choiceIndex]--;
  }
  else if (availability[date][choiceIndex] = 1){ //case when the time option for the date is unavailable
    availability[date][choiceIndex]--;
    //delete an element in availability
    availability[date] = availability[date].filter(function (element2) {
        return element2 !== availability[date][choiceIndex];
      });
    //delete an element in timeSlotsLeft
    timeSlotsLeft[date] = timeSlotsLeft[date].filter(function (element) {
        return element !== stringResponse;
      });
    item.asMultipleChoiceItem().setChoiceValues(timeSlotsLeft[date]); //reset choices for an item
  }
}