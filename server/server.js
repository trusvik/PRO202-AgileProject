import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.json());

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
const verifyTokenMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    console.log("Verifying token:", token);

    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Server got token: ", decoded);

        const database = client.db("loading");
        const users = database.collection("user");
        const user = await users.findOne({ username: decoded.username });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        console.log("Correct token version", user.tokenVersion);
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ error: "Token has expired " });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    handler: (req, res) => {
        res.status(429).json({ error: 'Too many login attempts from this IP, please try again after 15 minutes' });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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

app.get('/admin/plays/get/:id', verifyTokenMiddleware, async (req, res) => {
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

app.post("/admin/plays/start/:id", verifyTokenMiddleware, async (req, res) => {
    const playId = req.params.id;

    if (!ObjectId.isValid(playId)) {
        return res.status(400).json({ error: "Invalid play ID" });
    }

    try {
        const database = client.db("loading");
        const plays = database.collection("plays");
        const play = await plays.findOne({ _id: new ObjectId(playId) });

        if (!play) {
            return res.status(404).json({ error: "Play not found" });
        }

        // Generate a 6-digit random code
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Optionally, store the generated code in the play document
        await plays.updateOne({ _id: new ObjectId(playId) }, { $set: { accessCode: randomCode } });

        res.status(200).json({ play: play.play, code: randomCode });
    } catch (err) {
        console.error('Failed to start play', err);
        res.status(500).json({ error: 'Failed to start play' });
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

app.put('/admin/plays/:id', verifyTokenMiddleware, async (req, res) => {
    const playId = req.params.id;
    const { name, scenarios } = req.body;

    if (!ObjectId.isValid(playId)) {
        return res.status(400).json({ error: "Invalid play ID" });
    }

    if (!name || !Array.isArray(scenarios)) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const database = client.db('loading');
        const plays = database.collection('plays');
        const updatedPlay = {
            play: name,
            scenarios: scenarios.map(scenario => ({
                scenario_id: scenario.scenario_id || new ObjectId(),
                ...scenario,
                choices: scenario.choices.map(choice => ({
                    choice_id: choice.choice_id || new ObjectId(),
                    description: choice.description,
                    votes: choice.votes || 0
                }))
            }))
        };

        const result = await plays.updateOne(
            { _id: new ObjectId(playId) },
            { $set: updatedPlay }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: "Play updated successfully" });
        } else {
            res.status(404).json({ error: "Play not found" });
        }
    } catch (err) {
        console.error('Failed to update play', err);
        res.status(500).json({ error: 'Failed to update play' });
    }
});

// User login
app.post("/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const database = client.db("loading");
        const users = database.collection("user");
        const user = await users.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username, tokenVersion: user.tokenVersion }, JWT_SECRET);
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

app.get("/verify-token", verifyTokenMiddleware, (req, res) => {
    res.status(200).json({ valid: true, username: req.user.username });
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
app.put("/admin/change-password", async (req, res) => {
    const { newPassword } = req.body;
    console.log("New password request: ", newPassword);

    if (!newPassword) {
        console.log("Invalid input..");
        return res.status(400).json({ error: "Invalid input" });
    }

    const initToken = req.cookies.token;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log("New pwd hash: ", hashedPassword);

        const database = client.db("loading");
        const users = database.collection("user");

        const decoded = jwt.verify(initToken, JWT_SECRET);
        let user = await users.findOne({ username: decoded.username});

        const result = await users.updateOne(
            {}, // No filter needed as there's only one user
            { $set: { password: hashedPassword }, $inc: { tokenVersion: 1 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        user = await users.findOne({ username: decoded.username});

        const newToken = jwt.sign({ username: decoded.username, tokenVersion: user.tokenVersion}, JWT_SECRET);
        res.cookie('token', newToken, {httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 12 * 60 * 60 * 1000 });
        res.status(200).json({ message: "Password changed successfully" });
        
    } catch (err) {
        console.error("Failed to change password", err);
        res.status(500).json({ error: "Failed to change password" });
    }
});

// User logout
app.post("/logout", (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ message: "Logout successful" });
});



// Serve static files from the React app
app.use(express.static(join(__dirname, "../client/dist")));


// Midlertidig - skal slettes. API for å hente nåværende play
app.get('/admin/plays/getCurrent', verifyTokenMiddleware, async (req, res) => {
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');
        // Assuming you have a way to mark the current play, you might want to add a filter here
        const currentPlay = await plays.findOne(); // You may want to add conditions to find the current play

        if (!currentPlay) {
            return res.status(404).json({ message: 'No play found' });
        }
        res.json(currentPlay);
    } catch (error) {
        console.error('Failed to fetch current play', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get("/resultPage", (req, res) => {
   res.sendFile(join(__dirname, "../client/dist/index.html"));
});
app.get("/pinPage", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"));
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("/*", (req, res) => {
    res.redirect('/pinPage/');
});

// Create the server and the WebSocket server
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
        try {
            const data = JSON.parse(message);
            if (data.type === 'JOIN_ROOM') {
                // Example: Broadcast updated names to all clients
                const updatedNames = data.names; // You may want to update this logic as needed
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'UPDATE_NAMES', names: updatedNames }));
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Welcome to the WebSocket server!' }));
});

// Future Function to notify all clients that the lobby is ready
const notifyLobbyReady = () => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'LOBBY_READY' }));
        }
    });
};

// Example: Call this function when the lobby is ready
// This will be modified and replaced when future logic will be implemented
const someConditionForLobbyReady = true; // This should be your actual condition
if (someConditionForLobbyReady) {
    notifyLobbyReady();
}

// Start the server
connectToDatabase().then(async () => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(console.dir);
