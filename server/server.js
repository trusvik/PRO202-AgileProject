import express from "express";
import {dirname, join} from "path";
import {fileURLToPath} from "url";


const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(express.static("../client/dist"));
app.get('/*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'), function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});
app.listen(3000);