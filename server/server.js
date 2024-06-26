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
import cookie from "cookie";

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.json());

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
let GAME_STATE = {
    playId: null,
    scenarioId: null,
    votes: [0,0,0,0],
    gameCode: null
}
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

// Fetch results for plays
app.get('/admin/plays/results', verifyTokenMiddleware, async (req, res) => {
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');

        const results = await plays.aggregate([
            { $unwind: "$scenarios" },
            { $unwind: "$scenarios.choices" },
            { $project: {
                    playName: "$play",
                    scenarioQuestion: "$scenarios.question",
                    choiceDescription: "$scenarios.choices.description",
                    votes: "$scenarios.choices.votes",
                    nextStage: "$scenarios.choices.nextStage"
                }}
        ]).toArray();

        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to fetch results', err);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

app.post('/admin/reset', verifyTokenMiddleware, async (req, res) => {
    GAME_STATE = {
        playId: null,
        scenarioId: null,
        votes: [0,0,0,0],
        gameCode: null
    }
    if (GAME_STATE.playId === null) {
        res.status(200)
    } else {
        res.status(401)
    }
})

app.get('/admin/plays/results/:playId/:scenarioId', async (req, res) => {
    const { playId, scenarioId } = req.params;

    if (!ObjectId.isValid(playId) || !ObjectId.isValid(scenarioId)) {
        console.log("Invalid play or scenario ID");
        return res.status(400).json({ error: "Invalid play or scenario ID" });
    }

    try {
        const database = client.db('loading');
        const plays = database.collection('plays');

        console.log(`Fetching play with ID: ${playId}`);
        
        const play = await plays.findOne({ _id: new ObjectId(playId) });
if (!play) {
    console.log("Play not found");
    return res.status(404).json({ error: "Play not found" });
}

console.log(`Fetching scenario with ID: ${scenarioId}`);
const scenario = play.scenarios.find(scenario => {
    return scenario.scenario_id.toString() === scenarioId;
});

if (!scenario) {
    console.log("Scenario not found");
    return res.status(404).json({ error: "Scenario not found" });
}

const result = {
    playName: play.play,
    scenarioQuestion: scenario.question,
    choices: scenario.choices.map(choice => ({
        description: choice.description,
        votes: choice.votes,
        nextStage: choice.nextStage,
    }))
};

console.log("Results fetched successfully", result);
res.status(200).json(result);
} catch (err) {
    console.error('Failed to fetch results', err);
    res.status(500).json({ error: 'Failed to fetch results' });
}
});

// Route to get current scenario choices for a play
app.get('/play/scenario/:playId/:scenarioId', async (req, res) => {
    const { playId, scenarioId } = req.params;

    if (!ObjectId.isValid(playId) || !ObjectId.isValid(scenarioId)) {
        return res.status(400).json({ error: "Invalid play or scenario ID" });
    }

    try {
        const database = client.db('loading');
        const plays = database.collection('plays');

        const play = await plays.findOne({ _id: new ObjectId(playId) });
        if (!play) {
            return res.status(404).json({ error: "Play not found" });
        }

        const scenario = play.scenarios.find(scenario => scenario.scenario_id.toString() === scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: "Scenario not found" });
        }

        res.status(200).json(scenario);
    } catch (err) {
        console.error('Failed to fetch scenario', err);
        res.status(500).json({ error: 'Failed to fetch scenario' });
    }
});

app.get('/admin/plays/get/:id', async (req, res) => {
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
                question: scenario.question,
                choices: scenario.choices.map(choice => ({
                    choice_id: new ObjectId(),
                    description: choice.description,
                    nextStage: choice.nextStage, // Add the nextStage field
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
    console.log("admin/plays/start was called");

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

        let randomCode = GAME_STATE.randomCode;
        // Generate a 6-digit random code
        if (GAME_STATE.gameCode === null) {
            console.log("Game code was null...");
            randomCode = Math.floor(100000 + Math.random() * 900000).toString();
            GAME_STATE.gameCode = randomCode;
            GAME_STATE.scenarioId = play.scenarios[0].scenario_id;
            await plays.updateOne({ _id: new ObjectId(playId) }, { $set: { accessCode: randomCode } });
        }

        GAME_STATE.playId = playId;

        console.log(GAME_STATE);
        res.status(200).json({ play: play.play, code: GAME_STATE.gameCode });
    } catch (err) {
        console.error('Failed to start play', err);
        res.status(500).json({ error: 'Failed to start play' });
    }
});

// Route to handle the "Show" button press
app.post('/admin/start-game', verifyTokenMiddleware, (req, res) => {
    // Notify all WebSocket clients to redirect to /play
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'REDIRECT_TO_PLAY' }));
        }
    });
    res.status(200).json({ message: 'Game started, users redirected' });
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
                question: scenario.question,
                choices: scenario.choices.map(choice => ({
                    choice_id: choice.choice_id || new ObjectId(),
                    description: choice.description,
                    nextStage: choice.nextStage, // Add the nextStage field
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

app.get('/gameState', async (req, res) => {
    res.status(200).json(GAME_STATE);
})
// Gets the current play - I hope.
app.get('/admin/plays/getCurrent', verifyTokenMiddleware, async (req, res) => {
    const { playId } = req.query;
    console.log(playId);
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');

        const results = await plays.aggregate([
            { $match: { _id: new ObjectId(playId) } },
            { $unwind: "$scenarios" },
            { $unwind: "$scenarios.choices" },
            { $project: {
                    playName: "$play",
                    scenarioQuestion: "$scenarios.question",
                    choiceDescription: "$scenarios.choices.description",
                    votes: "$scenarios.choices.votes"
                }}
        ]).toArray();

        console.log(results);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to fetch results', err);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Protected admin route
app.get("/admin", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});

app.post('/admin/reset-votes', verifyTokenMiddleware, async (req, res) => {
    try {
        const database = client.db('loading');
        const plays = database.collection('plays');

        // Reset all votes for all scenarios
        await plays.updateMany(
            {},
            { $set: { "scenarios.$[].choices.$[].votes": 0 } }
        );

        res.status(200).json({ message: 'Votes reset successfully' });
    } catch (err) {
        console.error('Failed to reset votes', err);
        res.status(500).json({ error: 'Failed to reset votes' });
    }
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

app.post("/verify-pin", async (req, res) => {
    const { pin } = req.body;

    if (!pin || pin !== GAME_STATE.gameCode) {
        return res.status(400).json({ error: "Invalid or missing PIN code" });
    }

    try {
        // Generate a token for the user session
        const token = jwt.sign({ pin: GAME_STATE.gameCode }, JWT_SECRET, { expiresIn: '12h' });
        res.cookie('user_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 12 * 60 * 60 * 1000 });
        res.status(200).json({ message: "PIN verified successfully!" });
    } catch (err) {
        console.error("Failed to verify PIN", err);
        res.status(500).json({ error: "Failed to verify PIN" });
    }
});

app.get("/verify-user-token", (req, res) => {
    const token = req.cookies.user_token;
    if (!token) {
        return res.status(401).json({ valid: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ valid: true, pin: decoded.pin });
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ valid: false });
    }
});

// User logout
app.post("/logout", (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ message: "Logout successful" });
});

// Serve static files from the React app
app.use(express.static(join(__dirname, "../client/dist")));

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
const wsServer = new WebSocketServer({ noServer: true });
const sockets = [];

// Nå er du down bad as kompis
server.on("upgrade", (req, socket, head) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const signedCookies = cookieParser.signedCookies(cookies, process.env.COOKIE_SECRET); // Ensure this matches your setup
    const { username } = signedCookies;

    wsServer.handleUpgrade(req, socket, head, (ws) => {
        sockets.push(ws);
        ws.send(JSON.stringify({ message: `Hello to "${username}" from the server.` }));

        ws.on("message", async (buffer) => {
            const message = buffer.toString();
            const data = JSON.parse(message);

            if (data.type === 'ADMIN_START_GAME') {
                const { playId, scenarioId, countdown } = data; // Include countdown
                // Admin wants to start the game, notify all users
                for (const client of sockets) {
                    client.send(JSON.stringify({ type: 'REDIRECT_TO_PLAY', playId, scenarioId, countdown })); // Include countdown
                }
            } else if (data.type === 'USER_VOTE') {
                const { playId, scenarioId, choiceIndex } = data;

                if (!ObjectId.isValid(playId) || !ObjectId.isValid(scenarioId)) {
                    console.log("Invalid play or scenario ID");
                    return;
                }

                try {
                    const database = client.db('loading');
                    const plays = database.collection('plays');

                    const play = await plays.findOne({ _id: new ObjectId(playId) });
                    if (!play) {
                        console.log("Play not found");
                        return;
                    }

                    const scenarioIndex = play.scenarios.findIndex(scenario => scenario.scenario_id.toString() === scenarioId);
                    if (scenarioIndex === -1) {
                        console.log("Scenario not found");
                        return;
                    }

                    const choicePath = `scenarios.${scenarioIndex}.choices.${choiceIndex}.votes`;

                    await plays.updateOne(
                        { _id: new ObjectId(playId) },
                        { $inc: { [choicePath]: 1 } }
                    );

                    const updatedPlay = await plays.findOne({ _id: new ObjectId(playId) });
                    const updatedScenario = updatedPlay.scenarios[scenarioIndex];
                    const updatedVotes = updatedScenario.choices.map(choice => ({ description: choice.description, votes: choice.votes, nextStage: choice.nextStage }));

                    // Broadcast the updated votes to the admin
                    sockets.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'UPDATE_RESULTS', playId, scenarioId, updatedVotes }));
                        }
                    });
                } catch (err) {
                    console.error('Failed to update votes', err);
                }
            }
        });

        ws.on('close', () => {
            const index = sockets.indexOf(ws);
            if (index !== -1) {
                sockets.splice(index, 1);
            }
        });
    });
});

// Start the server
connectToDatabase().then(async () => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(console.dir);
