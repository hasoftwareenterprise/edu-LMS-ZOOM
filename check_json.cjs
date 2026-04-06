const fs = require('fs');
const path = require('path');

try {
  const filePath = path.resolve('google-service-account.json');
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  console.log("JSON Parsed successfully.");
  console.log("Project ID:", parsed.project_id);
  console.log("Private Key length:", parsed.private_key?.length);
  if (parsed.private_key.includes('\X')) {
      console.warn("WARNING: Private key contains invalid escape sequence \X");
  }
} catch (err) {
  console.error("JSON Parse FAILED:", err.message);
}
