var express = require('express');
var morgan = require('morgan');
const path = require('path');
const fs = require('fs');

var app = express();

app.use(morgan('tiny'));

var EXTENSION = ['.log', '.txt', '.json', '.yaml', '.xml', '.js'];

app.use(express.json());

app.post('/api/files', (req, res) => {
  const { filename, content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ message: "Please specify 'content' parameter" });
  }
  if (!filename) {
    return res
      .status(400)
      .json({ message: "Please specify 'filename' parameter" });
  }

  let extention = path.extname(filename);
  const good = EXTENSION.find((c) => c === extention);

  if (good) {
    fs.writeFile('files/' + filename, content, function (err, file) {
      if (err) {
        res.status(500).json({
          message: 'Server error'
        });
      } else {
        res.status(200).json({
          message: 'File created successfully'
        });
      }
    });
  } else {
    res.status(400).json({
      message: 'Unsupported extension - ' + extention
    });
  }
});

app.get('/api/files', (req, res) => {
  try {
    let newfiles = fs.readdirSync('files');
    res.status(200).json({
      message: 'Success',
      files: newfiles
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.get('/api/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;

  filePath = path.join(__dirname, 'files/' + fileName);

  try {
    if (fs.existsSync(filePath)) {
      const fileStats = fs.statSync(filePath);
      const fileData = fs.readFileSync(filePath, { encoding: 'utf-8' });
      res.status(200).json({
        message: 'Success',
        filename: fileName,
        content: fileData,
        extension: path.extname(fileName),
        uploadedDate: new Date(fileStats.ctime)
      });
    } else {
      res.status(400).json({
        message: "No file with '" + fileName + "' filename found"
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

if (!fs.existsSync('./files')) {
  fs.mkdirSync('./files');
}

app.listen(8080, () => console.log('Server has been started'));
