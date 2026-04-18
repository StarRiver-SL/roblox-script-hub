const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    obfuscate: function(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            const cmd = `lua ./prometheus/cli.lua --preset Medium ${inputPath} -o ${outputPath}`;
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(fs.readFileSync(outputPath, 'utf8'));
                }
            });
        });
    }
};
