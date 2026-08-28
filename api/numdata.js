// Suppress deprecation warning
process.noDeprecation = true;
process.env.NODE_NO_WARNINGS = '1';

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  try {
    const apiUrl = `https://allapiinone.vercel.app/?key=FOR_U&type=m&term=${number}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Return the full JSON response for debugging
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(data, null, 2));

  } catch (error) {
    res.status(500).send(`❌ Error: ${error.message}`);
  }
}
