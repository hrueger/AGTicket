const fs = require('fs');

const files = {
    "src/environments/environment.ts": 'export const environment = {apiUrl: "", appUrl: "",production: false};',
    "src/environments/environment.prod.ts": 'export const environment = {apiUrl: "", appUrl: "",production: true};',
};
var args = process.argv.slice(2);
counter = 0;
for (key in files) {
    if (!fs.existsSync(key)) {
        var value = files[key];
        if (args[counter]) {
            value = Buffer.from(args[counter], 'base64').toString('ascii');
        }
        fs.writeFileSync(key, value);
        console.info("File", key, "created, please insert your credentials there!");
    } else {
        console.info("File", key, "skipped, as it already exists!");
    }
    counter = counter + 1;
}