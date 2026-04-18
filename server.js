const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const customObfuscator = require('./obfuscator');
const prometheusObfuscator = require('./prometheus-obfuscator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const USERS_FILE = './users.json';
const INVITE_CODES_FILE = './config/invite-codes.json';
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

if (!fs.existsSync(SCRIPTS_DIR)) fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('config')) fs.mkdirSync('config');

if (!fs.existsSync(INVITE_CODES_FILE)) {
    fs.writeFileSync(INVITE_CODES_FILE, JSON.stringify({
        codes: ['ROBLOX-SECRET-2026', 'DEV-INVITE-ONLY']
    }, null, 2));
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}

function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function readInviteCodes() {
    return JSON.parse(fs.readFileSync(INVITE_CODES_FILE)).codes;
}

function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const db = readUsers();
    const user = db.users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
}

app.post('/api/register', async (req, res) => {
    const { username, password, inviteCode } = req.body;
    if (!username || !password || !inviteCode) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const inviteCodes = readInviteCodes();
    if (!inviteCodes.includes(inviteCode)) {
        return res.status(400).json({ error: 'Invalid invite code' });
    }
    const db = readUsers();
    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        token,
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeUsers(db);
    res.json({ success: true, token });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = readUsers();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    user.token = uuidv4();
    writeUsers(db);
    res.json({ token: user.token });
});

app.post('/api/upload', authenticate, upload.single('script'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const originalPath = req.file.path;
    const originalName = req.file.originalname;
    const obfuscationMethod = req.body.method || 'custom';
    const scriptId = uuidv4();
    const outputFileName = `${scriptId}.lua`;
    const outputPath = path.join(SCRIPTS_DIR, outputFileName);

    try {
        const originalCode = fs.readFileSync(originalPath, 'utf8');
        let obfuscatedCode;

        if (obfuscationMethod === 'prometheus') {
            obfuscatedCode = await prometheusObfuscator.obfuscate(originalPath, outputPath);
        } else {
            obfuscatedCode = customObfuscator.obfuscate(originalCode);
            fs.writeFileSync(outputPath, obfuscatedCode);
        }

        fs.unlinkSync(originalPath);

        const db = readUsers();
        const user = db.users.find(u => u.id === req.user.id);
        if (!user.scripts) user.scripts = [];
        user.scripts.push({
            id: scriptId,
            originalName,
            method: obfuscationMethod,
            createdAt: new Date().toISOString()
        });
        writeUsers(db);

        res.json({
            success: true,
            scriptId,
            url: `/api/script/${scriptId}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Obfuscation failed' });
    }
});

app.get('/api/script/:id', authenticate, (req, res) => {
    const scriptId = req.params.id;
    const filePath = path.join(SCRIPTS_DIR, `${scriptId}.lua`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Script not found' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="script_${scriptId}.lua"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
});

app.get('/api/me', authenticate, (req, res) => {
    res.json({ username: req.user.username, scripts: req.user.scripts || [] });
});

app.post('/api/logout', authenticate, (req, res) => {
    const db = readUsers();
    const user = db.users.find(u => u.id === req.user.id);
    user.token = null;
    writeUsers(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
