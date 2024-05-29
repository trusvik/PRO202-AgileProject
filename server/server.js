import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

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

// Middleware to verify JWT token
const verifyTokenMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Verifying token:", token);

    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token verified successfully. Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

async function insertDocument() {
    const database = client.db('loading');
    const plays = database.collection('plays');

    const newPlay = {
        _id: new ObjectId("665709e1f729babc6cd5daa9"),
        play: "Mormor og de 8 Ungene",
        scenarios: [
            {
                scenario_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e2"),
                question: "What should the character feel?",
                choices: [
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e3"), description: "Sint", votes: 0 },
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e4"), description: "Glad", votes: 0 },
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e5"), description: "Trist", votes: 0 },
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e6"), description: "Irritert", votes: 0 }
                ]
            },
            {
                scenario_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e7"),
                question: "What should the character do?",
                choices: [
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e8"), description: "Løp", votes: 0 },
                    { choice_id: new ObjectId("6142bc7f4f1c4c3f4c18b2e9"), description: "Kjemp", votes: 0 }
                ]
            }
        ]
    };

    try {
        const result = await plays.insertOne(newPlay);
        console.log(`New play created with the following id: ${result.insertedId}`);
    } catch (err) {
        console.error("Failed to insert play", err);
    }
}

// API route to fetch plays
app.get('/admin/plays/get', verifyTokenMiddleware, async (req, res) => {
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');
        const playsList = await plays.find({}).toArray();
        const formattedPlaysList = playsList.map(play => ({
            _id: play._id, // Ensure the _id is included
            name: play.play,
            numberOfScenarios: play.scenarios.length // Access scenarios correctly
        }));
        res.status(200).json(formattedPlaysList);
    } catch (err) {
        console.error('Failed to fetch plays', err);
        res.status(500).json({ error: 'Failed to fetch plays' });
    }
});

app.get('/admin/plays/:id', verifyTokenMiddleware, async (req, res) => {
    const playId = req.params.id;

    if (!ObjectId.isValid(playId)) {
        return res.status(400).json({ error: "Invalid play ID" });
    }

    try {
        const database = client.db('loading');
        const plays = database.collection('plays');
        const play = await plays.findOne({ _id: new ObjectId(playId) });

        if (play) {
            res.status(200).json(play);
        } else {
            res.status(404).json({ error: "Play not found" });
        }
    } catch (err) {
        console.error('Failed to fetch play', err);
        res.status(500).json({ error: 'Failed to fetch play' });
    }
});

// Create new Play-API
app.post("/admin/plays/new", verifyTokenMiddleware, async (req, res) => {
    const { name, scenarios } = req.body;
    if (!name || !Array.isArray(scenarios)) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const database = client.db("loading");
        const plays = database.collection("plays");
        const newPlay = {
            play: name, // Ensure the field matches the fetch structure
            scenarios: scenarios.map(scenario => ({
                scenario_id: new ObjectId(),
                ...scenario,
                choices: scenario.choices.map(choice => ({
                    choice_id: new ObjectId(),
                    description: choice,
                    votes: 0
                }))
            }))
        };
        const result = await plays.insertOne(newPlay);
        res.status(201).json(result);
    } catch (err) {
        console.error("Failed to insert play", err);
        res.status(500).json({ error: "Failed to insert play" });
    }
});

// Delete current Play-API
app.delete("/admin/plays/delete/:id", verifyTokenMiddleware, async (req, res) => {
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
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
            console.log("Login successful. Generated token:", token);
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 12 * 60 * 60 * 1000 });
            res.status(200).json({ message: "Login successful!" });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Failed to authenticate user", err);
        res.status(500).json({ error: "Failed to authenticate user" });
    }
});

app.get("/verify-token", (req, res) => {
    const token = req.cookies.token;
    console.log("Server got token: ", token);

    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token verification successful. Decoded token:", decoded);
        res.status(200).json({ valid: true, username: decoded.username });
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

// Protected admin route
app.get("/admin", verifyTokenMiddleware, (req, res) => {
    // If the token is valid, allow access to admin page
    res.sendFile(join(__dirname, "../client/dist/index.html"), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
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

app.get("/pinPage", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"));
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("/*", (req, res) => {
    res.redirect('/pinPage/');
});

connectToDatabase().then(async () => {
    await insertDocument(); // Call the function to insert the document when the server starts
    app.listen(3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
}).catch(console.dir);
