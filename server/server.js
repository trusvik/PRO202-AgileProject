import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

// API route to fetch plays
app.get('/admin/plays/get', async (req, res) => {
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');
        const playsList = await plays.find({}).toArray();
        console.log("Fetched plays:", playsList); // Log the fetched data
        res.status(200).json(playsList);
    } catch (err) {
        console.error('Failed to fetch plays', err);
        res.status(500).json({ error: 'Failed to fetch plays' });
    }
});

// Create new Play-API
app.post("/admin/plays/new", async (req, res) => {
    const { play, scenarios } = req.body;
    if (!play || typeof scenarios !== 'number') {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const database = client.db("loading");
        const plays = database.collection("plays");
        const result = await plays.insertOne({ play, scenarios });
        res.status(201).json(result);
    } catch (err) {
        console.error("Failed to insert play", err);
        res.status(500).json({ error: "Failed to insert play" });
    }
});

// Delete current Play-API
app.delete("/admin/plays/delete/:id", async (req, res) => {
    const playId = req.params.id;

    if (!ObjectId.isValid(playId)) {
        return res.status(400).json({ error: "Invalid play ID" });
    }

    try {
        const database = client.db("loading");
        const plays = database.collection("plays");
        const result = await plays.deleteOne({ _id: new ObjectId(playId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Play deleted successfully" });
        } else {
            res.status(404).json({ error: "Play not found" });
        }
    } catch (err) {
        console.error("Failed to delete play", err);
        res.status(500).json({ error: "Failed to delete play" });
    }
});

// User login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const database = client.db("loading");
        const users = database.collection("user");
        const user = await users.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Failed to authenticate user", err);
        res.status(500).json({ error: "Failed to authenticate user" });
    }
});

// User registration
app.post("/admin/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const database = client.db("loading");
        const users = database.collection("user");
        const result = await users.insertOne({ username, password: hashedPassword });

        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (err) {
        console.error("Failed to register user", err);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// Serve static files from the React app
app.use(express.static(join(__dirname, "../client/dist")));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("/*", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});

connectToDatabase().then(() => {
    app.listen(3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
}).catch(console.dir);
