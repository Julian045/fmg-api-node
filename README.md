# FakeMail Generator Node.js Module

A lightweight Node.js module designed as an API for interacting with the Fake Mail Generator website.

Simplify the generation of random emails, retrieval of inbox details, and monitoring of incoming emails with ease.

## Features

- Quickly generate random emails or set your own email name.
- Retrieve inbox details for a specific email.
- Watch for incoming emails at specified intervals.

## Installation

Install the module via npm:

```bash
npm install fake-mail-generator
```

```javascript
const FMG = require('fake-mail-generator');

// Create an instance of FMG
const fmgInstance = new FMG({ name: 'your_random_mail_name', refreshInterval: 5000 });

// Generate an email
fmgInstance.generateEmail().then((generatedEmail) => {
  console.log(`Generated Email: ${generatedEmail}`);
    
  // Watch the generated email
  fmgInstance.watch(generatedEmail).then(() => {
    console.log('Watching for emails...');
  }).catch((error) => {
    console.error('Error while watching:', error.message);
  });
}).catch((error) => {
  console.error('Error while generating email:', error.message);
});
```

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to contribute in any way, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

We acknowledge the Fake Mail Generator website (https://www.fakemailgenerator.com/) for providing a valuable service.
This module is designed as an API to enhance the user experience with their service.
