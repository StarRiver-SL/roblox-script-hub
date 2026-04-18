module.exports = {
    obfuscate: function(code) {
        let lines = code.split('\n');
        let obfuscatedLines = [];
        let varMap = new Map();
        let varCounter = 0;

        function generateRandomName() {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let name = '';
            for (let i = 0; i < 8; i++) {
                name += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return name;
        }

        for (let line of lines) {
            let trimmed = line.trim();
            if (trimmed.startsWith('local ')) {
                let varMatch = trimmed.match(/^local\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
                if (varMatch) {
                    let originalName = varMatch[1];
                    if (!varMap.has(originalName)) {
                        varMap.set(originalName, generateRandomName());
                    }
                    let newName = varMap.get(originalName);
                    line = line.replace(new RegExp(`\\b${originalName}\\b`, 'g'), newName);
                }
            }
            obfuscatedLines.push(line);
        }

        let obfuscated = obfuscatedLines.join('\n');
        let stringEncryption = `
local function __d(str)
    return str:gsub('.', function(c) return string.char(c:byte() + 1) end)
end
`;
        obfuscated = stringEncryption + '\n' + obfuscated;
        return obfuscated;
    }
};
