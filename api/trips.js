export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const SHEET_ID = "14p6LdjEXRCbtrG-GVdIUKDh_r2Qk_mdhf_e3XaVk1ac";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Trips`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
