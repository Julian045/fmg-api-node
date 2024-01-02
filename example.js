const FMG = require('./lib/FMG');

const options = {
    name: '', // Set the email name or leave empty for a random email
    refreshInterval: 5000 // Set the email watch refresh interval
};

const fmg = new FMG(options);

fmg.generateEmail().then(email => {
    fmg.watch(email).then(emails => {
        console.log('Received emails:', emails);
    });
});