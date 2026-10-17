/**
 * 6SLOT onboarding form: builds the whole Google Form in one run, plus a Google Sheet that
 * collects the answers, and saves both in your "6SLOT" Drive folder.
 *
 * How to run (once):
 *   1. Go to https://script.google.com and click "New project".
 *   2. Delete what's there, paste this whole file, click Save.
 *   3. Choose "createOnboardingForm" in the function menu at the top and click Run.
 *   4. Allow the permissions Google asks for (it's your own script, creating files in your Drive).
 *   5. Open "Execution log": it prints the form link to put on the website.
 */
function createOnboardingForm() {
  const RANKS = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
  const SERVERS = [
    "US East",
    "US West",
    "South America",
    "Europe West",
    "Europe East",
    "Russia",
    "Middle East (Dubai)",
    "India",
    "Southeast Asia",
    "China",
    "Japan",
    "Australia",
    "South Africa",
  ];

  const form = FormApp.create("6SLOT Onboarding");
  form
    .setDescription(
      "Welcome to 6SLOT. 2 minutes and you're set: Eixn adds your role within 24 hours of this form.\n" +
        "Use the same email you paid with on PayPal."
    )
    .setConfirmationMessage("You're all set. Eixn adds your role within 24 hours. See you at the first session!")
    .setShowLinkToRespondAgain(false)
    .setProgressBar(false);

  // 1. PayPal email (matches the form to the payment)
  form
    .addTextItem()
    .setTitle("Email you paid with on PayPal")
    .setHelpText("So we can match your form to your payment.")
    .setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().setHelpText("Enter a valid email.").build());

  // 2. Discord username (who gets the role)
  form
    .addTextItem()
    .setTitle("Discord username")
    .setHelpText("Exactly as it shows in Discord, so Eixn can add your role.")
    .setRequired(true);

  // 3. Name or nickname
  form.addTextItem().setTitle("What should we call you?").setHelpText("Name or nickname.").setRequired(true);

  // 4. Server (region, feeds the session-time survey)
  form.addListItem().setTitle("Which server do you play on most?").setChoiceValues(SERVERS).setRequired(true);

  // 5. Positions
  form
    .addCheckboxItem()
    .setTitle("Your main position(s)")
    .setChoiceValues(["Pos 1 (Carry)", "Pos 2 (Mid)", "Pos 3 (Offlane)", "Pos 4 (Soft support)", "Pos 5 (Hard support)"])
    .setRequired(true);

  // 6. Current rank
  form.addListItem().setTitle("Your current rank").setChoiceValues(RANKS).setRequired(true);

  // 7. Goal rank
  form.addListItem().setTitle("The rank you're chasing").setChoiceValues(RANKS).setRequired(true);

  // 8. Where they found 6SLOT (free conversion tracking)
  form
    .addMultipleChoiceItem()
    .setTitle("How did you find 6SLOT?")
    .setChoiceValues(["Discord", "TikTok", "Instagram", "YouTube", "A friend", "eixn-dota.com"])
    .showOtherOption(true)
    .setRequired(true);

  // 9. Anything else
  form
    .addParagraphTextItem()
    .setTitle("Anything Eixn should know?")
    .setHelpText("Optional: your goals, what you struggle with, your schedule.");

  // Answers go to a Google Sheet.
  const sheet = SpreadsheetApp.create("6SLOT Onboarding (responses)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // Move both into the "6SLOT" folder (or leave them in My Drive if it isn't found).
  const folders = DriveApp.getFoldersByName("6SLOT");
  if (folders.hasNext()) {
    const folder = folders.next();
    DriveApp.getFileById(form.getId()).moveTo(folder);
    DriveApp.getFileById(sheet.getId()).moveTo(folder);
    Logger.log("Saved in your 6SLOT folder.");
  } else {
    Logger.log('No folder named "6SLOT" found: the form and sheet are in My Drive.');
  }

  Logger.log("Form link for the website (onboardingForm): " + form.getPublishedUrl());
  Logger.log("Edit the form: " + form.getEditUrl());
  Logger.log("Responses sheet: " + sheet.getUrl());
}
