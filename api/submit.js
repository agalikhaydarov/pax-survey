export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const T1 = "pat9ks5zJvz3Xo6vh";
  const T2 = ".abf5ec9f18cfb3e4e9e1e0942ea4d8032da4a9d2eb79796d6766469be3f31672";
  const response = await fetch(
    "https://api.airtable.com/v0/appweX4l7UHT1EJJD/Answers",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + T1 + T2,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  );
  const data = await response.json();
  res.status(response.status).json(data);
}
