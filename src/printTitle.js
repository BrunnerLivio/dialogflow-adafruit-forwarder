const emoji = require('node-emoji');
const noEmoji = process.env.NO_EMOJI || false;

if (noEmoji === 'true' || noEmoji === true) emoji.get = () => '';

const printLine = () => {
    for (let i = 0; i < 47; i++) {
        process.stdout.write(emoji.get('coffee') + ' ');
    }
    process.stdout.write('\n');
};

const printTitle = () => {
    process.stdout.write('\n');
    printLine();
    console.log(require('figlet').textSync('Dialogflow Adafruit'));
    printLine();
    process.stdout.write('\n');
};


module.exports = printTitle;
