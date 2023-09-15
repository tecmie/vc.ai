import fs from 'fs'


const angels = fs.readFileSync('scripts/angel.txt', 'utf8');
const accelerators = fs.readFileSync('scripts/incubator-accelerator-programs.txt', 'utf8');
const microVCs = fs.readFileSync('scripts/micro-vc.txt', 'utf8');

console.log(microVCs.split('\\').join('\n'))