function generateResult(message, status, data){
  let result = `
    {
      "message": `+message+`,
      "status": `+status+`,
      "data": `+JSON.stringify(data)+`
    }
  `;
  return result
}

function doPost(e){
  let bodyData = null;
  let method = null;

  try{
    bodyData = JSON.parse(e.postData.contents);
    method = bodyData["method"].toUpperCase();
  }
  catch(ex){}

  switch(method){
    case "POST":
      return ContentService.createTextOutput(POST(bodyData)).setMimeType(ContentService.MimeType.JSON);
    case "DELETE":
      return ContentService.createTextOutput(DELETE(bodyData)).setMimeType(ContentService.MimeType.JSON);
    case "PUT":
      return ContentService.createTextOutput(PUT(bodyData)).setMimeType(ContentService.MimeType.JSON);
    case "GET":
      return ContentService.createTextOutput(GET(bodyData)).setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput(generateResult("Method Not Found", 404, null)).setMimeType(ContentService.MimeType.JSON);
  }
}

function GET(bodyData){
  let ss = SpreadsheetApp.openById("1w31KMZvKD7CdgCnLhiBBruLJ8hoGDgeVI1z2g6I6yTM");
  let sheet = ss.getSheetByName("Sheet1");
  let data = [];

  let currentPage = null;
  let recordsPerPage = null;

  try{
    currentPage = parseInt(bodyData["currentPage"]);
    recordsPerPage = parseInt(bodyData["recordsPerPage"]);
  }
  catch(ex){}

  let startRow_Body = 0;
  let startColumn_Body = 0;
  let lastRow_Body = 0;
  let lastColumn_Body = 0;
  
  let startRow_Head = 1;
  let startColumn_Head = 1;
  let lastRow_Head = 1;
  let lastColumn_Head = 3;

  try{
    startRow_Body = 2;
    startColumn_Body = 1;
    lastRow_Body = sheet.getLastRow();
    lastColumn_Body = sheet.getLastColumn();

    if(currentPage > 0 && recordsPerPage > 0){
      lastRow_Body = recordsPerPage;
      startRow_Body = ((recordsPerPage * currentPage) - recordsPerPage) + 2;
    }
  }
  catch(err){
    return generateResult("Error Occured - pagination try catch", 0, err);
  }

  try{;
    var rows = sheet.getRange(startRow_Body,startColumn_Body,lastRow_Body,lastColumn_Body).getValues();
    var headers = sheet.getRange(startRow_Head,startColumn_Head,lastRow_Head,lastColumn_Head).getValues()[0];
    for(var i=0; i<rows.length; i++){
      var record = {};
      var dataRow = rows[i];
      for(j=0; j<headers.length; j++){
        record[headers[j]] = dataRow[j];
      }
      data.push(record);
    }
  }
  catch(err){
    return generateResult("Error Occured - get try catch", 0, {err, startRow_Body});
  }

  return generateResult("Records Found ("+data.length+")", 200, data);
}

function DELETE(bodyData){
  let ss = SpreadsheetApp.openById("1w31KMZvKD7CdgCnLhiBBruLJ8hoGDgeVI1z2g6I6yTM");
  let sheet = ss.getSheetByName("Sheet1");
  var rows = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();
  
  let rollNumber = null;

  try{
    rollNumber = parseInt(bodyData["rollNumber"]);
  }
  catch(err){
    return generateResult("Error - DELETE", 0, err);
  }

  let index = null;
  let deletedRow = null;
  try{
    if(rollNumber > 0){
      index = rows.findIndex(x => x[0] == rollNumber);
      if(index >= 0){
        deletedRow = rows[index];
        sheet.deleteRow(index + 1);
      }
      else{
        return generateResult("Record Not Found", 0, null);
      }
    }
  }
  catch(err){
    return generateResult("Error - DELETE", 0, {err, index});
  }

  return generateResult("Record DELETED", 200, deletedRow);
}

function POST(bodyData){
  let ss = SpreadsheetApp.openById("1w31KMZvKD7CdgCnLhiBBruLJ8hoGDgeVI1z2g6I6yTM");
  let sheet = ss.getSheetByName("Sheet1");
  var rows = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();

  let newRollNumber = null;
  let newName = null;
  let newMarks = null;
  try{
    newRollNumber = parseInt(bodyData["rollNumber"]);
    newName = bodyData["name"];
    newMarks = bodyData["marks"];
  }
  catch(err){
    return generateResult("Error Occured", 0, err);
  }

  if(!(newRollNumber > 0)){
    return generateResult("Roll Number is Required", 0, null);
  }
  else if(rows.findIndex(x => x[0] == newRollNumber) >= 0){
    return generateResult("Roll Number must be unique", 0, null);
  }
  else{
    try{
      let newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow,1).setValue(newRollNumber);
      sheet.getRange(newRow,2).setValue(newName);
      sheet.getRange(newRow,3).setValue(newMarks);
    }
    catch(err){}

    return generateResult("POST", 200, newRollNumber);
  }
}

function PUT(bodyData){
  let ss = SpreadsheetApp.openById("1w31KMZvKD7CdgCnLhiBBruLJ8hoGDgeVI1z2g6I6yTM");
  let sheet = ss.getSheetByName("Sheet1");
  var rows = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();

  let newRollNumber = null;
  let newName = null;
  let newMarks = null;
  try{
    newRollNumber = parseInt(bodyData["rollNumber"]);
    newName = bodyData["name"];
    newMarks = bodyData["marks"];
  }
  catch(err){
    return generateResult("Error Occured", 0, err);
  }

  if(!(newRollNumber > 0)){
    return generateResult("Roll Number is Required", 0, null);
  }
  else if(rows.findIndex(x => x[0] == newRollNumber) >= 0){
    try{
      let oldRow = rows.findIndex(x => x[0] == newRollNumber) + 1;
      sheet.getRange(oldRow,1).setValue(newRollNumber);
      sheet.getRange(oldRow,2).setValue(newName);
      sheet.getRange(oldRow,3).setValue(newMarks);
    }
    catch(err){}

    return generateResult("Record Updated", 200, newRollNumber);
  }
  else{
    return generateResult("Record Does Not Exist", 0, null);
  }
}
