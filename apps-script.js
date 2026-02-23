// Google Apps Script v2 — now stores voter name
// Redeploy after updating: Deploy > Manage deployments > Edit > New version > Deploy

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Votes");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Votes");
    sheet.appendRow(["Timestamp", "Name", "Cat1", "Cat2", "Cat3", "Cat4"]);
  }
  
  var data = JSON.parse(e.postData.contents);
  var votes = data.votes || {};
  
  sheet.appendRow([
    new Date().toISOString(),
    data.name || "Anonymous",
    (votes.cat1 || []).join(", "),
    (votes.cat2 || []).join(", "),
    (votes.cat3 || []).join(", "),
    (votes.cat4 || []).join(", ")
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Votes");
  if (!sheet || sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(JSON.stringify({
      totalVoters: 0, cat1: {}, cat2: {}, cat3: {}, cat4: {}
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  var counts = {cat1: {}, cat2: {}, cat3: {}, cat4: {}};
  
  data.forEach(function(row) {
    // Name is col 2 (index 1), cats are cols 3-6 (index 2-5)
    ["cat1","cat2","cat3","cat4"].forEach(function(cat, i) {
      var val = row[i + 2];
      if (val && val.toString().trim()) {
        val.toString().split(",").forEach(function(opt) {
          opt = opt.trim();
          if (opt) counts[cat][opt] = (counts[cat][opt] || 0) + 1;
        });
      }
    });
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    totalVoters: data.length,
    cat1: counts.cat1, cat2: counts.cat2, cat3: counts.cat3, cat4: counts.cat4
  })).setMimeType(ContentService.MimeType.JSON);
}
