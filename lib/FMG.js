const axios = require('axios');
const cheerio = require('cheerio');

class FMG {
  /**
   * Create an instance of FMG.
   *
   * @param {Object} options - Options for FMG instance.
   * @param {string} options.name - The name for generating emails.
   * @param {number} options.refreshInterval - The interval for refreshing email data.
   */
  constructor(options) {
    this.name = options.name !== '' ? options.name : this.randomString();
    this.domain = null;
    this.apiUrl = 'http://www.fakemailgenerator.com/';
    this.refreshInterval = options.refreshInterval || 5000; // Default refresh interval is 5 seconds
    this.emails = []; // Array to store received emails
    this.uniqueEmailIds = new Set(); // Set to keep track of unique email IDs
  }

  /**
   * Generate a random email.
   *
   * @returns {Promise<string>} A Promise that resolves with the generated email.
   */
  async generateEmail() {
    try {
      await this.fetchDomains();

      if (this.name === '') {
        this.name = this.randomString();
      }

      this.domain = this.domains[Math.floor(Math.random() * this.domains.length)];

      console.log(`Your email: ${this.name}${this.domain}\n`);

      return `${this.name}${this.domain}`;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieve emails for a specific generated email.
   *
   * @param {string} email - The generated email to retrieve data for.
   * @returns {Promise<void>} A Promise that resolves when emails are retrieved.
   */
  async getMail(email) {
    try {
      const inboxUrl = email.includes('@')
        ? `${this.apiUrl}inbox/${email.split('@')[1]}/${email.split('@')[0]}`
        : `${this.apiUrl}inbox/${this.domain.split('@')[1]}/${email}`;

      const response = await axios.get(inboxUrl); // Fetch the inbox page for the specified email
      const $ = cheerio.load(response.data);

      for (const element of $('ul#email-list li')) {
        const emailInfo = {};

        // Extract email details from the list item
        emailInfo.to = $(element).find('dt:contains("To:") + dd').text().trim();
        emailInfo.from = $(element).find('dt:contains("From:") + dd').text().trim();
        emailInfo.subject = $(element).find('dt:contains("Subject:") + dd').text().trim();
        emailInfo.received = $(element).find('dt:contains("Received:") + dd').text().trim();
        emailInfo.expires = $(element).find('dt:contains("Expires:") + dd').text().trim();

        // Extract email text and time from the embedded iframe
        const iframeSrc = $(element).find('iframe').attr('src');

        if (!iframeSrc) return; //handle undefined url bug

        const iframeContent = await axios.get(iframeSrc ? iframeSrc : null).then((response) => response.data);
        const iframe$ = cheerio.load(iframeContent);
        const emailText = iframe$('body').text().trim();

        // Extract time from the main page
        const time = $(element).find('.col-xs-3.col-sm-2.col-md-2.col-lg-2 p').text().trim();
        const emailId = `${emailInfo.to}-${emailInfo.from}-${emailInfo.subject}`;

        // Finalize the emailInfo object data
        emailInfo.emailText = emailText;
        emailInfo.time = time;

        if (!this.uniqueEmailIds.has(emailId)) {
          // Check not to add again the same email after refreshing
          this.emails.push(emailInfo);
          this.uniqueEmailIds.add(emailId);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Watch for emails.
   *
   * @param {string} email - The email to watch for.
   * @returns {Promise<void>} A Promise that resolves when watching is initiated.
   */
  async watch(email) {
    await this.fetchDomains();

    if (!this.domains.includes(`@${email.split('@')[1]}`)) {
      // Check if the provided email is one of the fetched domains
      throw new Error(`The provided email domain (${email.split('@')[1]}) is not among the fetched domains.`);
    }

    try {
      this.getMail(email);

      return new Promise((resolve, reject) => {
        setTimeout(() => this.watch(email), this.refreshInterval);
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch available domains.
   *
   * @returns {Promise<void>} A Promise that resolves when domains are fetched.
   */
  async fetchDomains() {
    try {
      const response = await axios.get(this.apiUrl);
      const $ = cheerio.load(response.data);
      this.domains = $('ul.dropdown-menu li a').map((_, element) => $(element).text()).get();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate a random string.
   *
   * @returns {string} The generated random string.
   */
  randomString() {
    return [...Array(Math.floor(Math.random() * (25 - 5 + 1)) + 5)].map(() => Math.random().toString(36).charAt(2)).join('');
  }
}

// Export the FMG class for use in other modules
module.exports = FMG;