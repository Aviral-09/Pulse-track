import fs from 'fs';
import path from 'path';

const searchDir = './src';
const searchStr = 'localhost:5000';
const replaceStr = 'localhost:6543';

function walk(dir, done) {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let i = 0;
        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err, res) => {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
}

walk(searchDir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes(searchStr)) {
                console.log(`Updating ${file}`);
                const updatedContent = content.split(searchStr).join(replaceStr);
                fs.writeFileSync(file, updatedContent, 'utf8');
            }
        }
    });
});
