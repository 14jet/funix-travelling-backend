async function append(auth, spreadsheetId, range, values) {
  const { google } = require("googleapis");
  const service = google.sheets({ version: "v4", auth });

  const request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: spreadsheetId, // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values are appended after the last row of the table.
    range: range, // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: "RAW", // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: "INSERT_ROWS", // TODO: Update placeholder value.

    resource: {
      // TODO: Add desired properties to the request body.
      // range: range,
      majorDimension: "ROWS",
      values: [values],
    },
  };

  try {
    const spreadsheet = await service.spreadsheets.values.append(request);
    return spreadsheet.data.spreadsheetId;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
}

module.exports = append;
