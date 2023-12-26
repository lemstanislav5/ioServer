const process = require('process');
const fs = require("fs");
const path = require('path');

module.exports = (req, res) => {
  try {
    if (fs.existsSync(path.join(process.cwd(), req.originalUrl).replace('/api', ''))) {
      return res.status(200).sendFile(path.join(process.cwd(), req.originalUrl.replace('/api', '')));
    }
    return res.status(202).send();
  } catch(err) {
    console.error(err);
  }
}
