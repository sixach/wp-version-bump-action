const fs = require('fs');

const core = require('@actions/core')
const github = require('@actions/github')

const newVersion = core.getInput('version')
const filePath = core.getInput('file_path')

// Check if File Exists
if (fs.existsSync(filePath)) {
    // File Exists
} else {
    core.setFailed("File "+ filePath + " does not exist");
}

// Valid SemVer
const regex = new RegExp(/^\d+\.\d+\.\d+$/mg)
if (regex.test(newVersion)) {
    console.log("Version Valid")
} else {
    console.log("Version Invalid")
    core.setFailed("Version Invalid");
}

// Now things are valid, lets do the thing...
// Read the file
fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
        // if there's an error of some kind then return that to console log
        return console.log(err)
    }

    // change the version string and save to result var
    var result = data.replace(/^(\s?)+Version: \d+\.\d+\.\d+$/mg, 'Version: ' + newVersion)

    // Write the changes back to the file
    fs.writeFile(filePath, result, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
});

