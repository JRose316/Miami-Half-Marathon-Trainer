export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const APPS_SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL;
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?sheet=Trips`, { redirect: "follow" });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
