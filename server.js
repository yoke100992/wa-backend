const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

let credentials;

if (process.env.CREDENTIALS) {
  credentials = JSON.parse(process.env.CREDENTIALS);
} else {
  credentials = require("./credentials.json"); // fallback lokal
}
const app = express();
const PORT = process.env.PORT || 3000; // penting untuk Railway

const SHEET_ID = "1JNFMxWz-0A7QUKWOcNlxn_Yb4xlyNOlnBRnJd_Bz5qA";

app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ======= GET DATA2 ========
app.get("/api/data2", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DATA2",
    });

    const rows = result.data.values;
    const headers = rows[0];
    const data = rows.slice(1).map((row, index) => {
      const obj = { _row: index + 2 };
      headers.forEach((h, i) => (obj[h] = row[i] || ""));
      return obj;
    });

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// ======= POST DATA2 ========
app.post("/postData2", async (req, res) => {
  const { id, action, data } = req.body;
  const rowIndex = parseInt(id);

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    if (action === "edit") {
      const range = `DATA2!A${rowIndex}`;
      const values = [[
        data.No,
        data.Waktu,
        data.Nama,
        data.Area,
        data.SKU,
        data["Nama SKU"],
        data.Penjualan,
        data.Value,
        data.Image,
        data.Tanggal,
        data.Jam
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });

    } else if (action === "delete") {
      const sheetId = 0; // ID sheet DATA2 — sesuaikan jika berbeda

      const request = {
        spreadsheetId: SHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex,
                },
              },
            },
          ],
        },
      };

      await sheets.spreadsheets.batchUpdate(request);
    }

    res.json({ status: "ok" });
  } catch (e) {
    console.error("❌ ERROR:", e.toString());
    res.status(500).json({ error: e.toString() });
  }
});

// ======= INBOX2 ========
app.get("/api/inbox", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INBOX2",
    });

    const rows = result.data.values;
    const headers = rows[0];
    const data = rows.slice(1).map((row, index) => {
      const obj = { "Key ID": `${index + 2}` };
      headers.forEach((h, i) => (obj[h] = row[i] || ""));
      return obj;
    });

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.post("/postInbox", async (req, res) => {
  const { id, action, data } = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    if (action === "edit") {
      const range = `INBOX2!A${id}`;
      const values = [[data.Waktu, data.Nomor, data.Jenis, data["Isi Pesan"], data.Url]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });

    } else if (action === "delete") {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `INBOX2!A${id}:E${id}`,
      });
    }

    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// ======= START SERVER ========
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
