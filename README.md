# Data Grinder
Data Grinder is a WhatsApp bot that stores all records of messages, chats and participants in a PostgreSQL database, and use the data to make cool graphs via commands.  

**NOTE:** This bot will require the WhatsApp's multiuser-beta and uses a development branch of "whatsapp-web.js" which may result in some bugs and issues.

# Getting started

## Dependencies
* Google Chrome/Chromium v60.0+  
* Node.js    
* npm  
* PostgreSQL(doesn't have to be local)  

## Installation
You may follow this instructions:
1. Clone the repo and cd into it
```bash
git clone https://github.com/RoiKlevansky/data-grinder.git
cd data-grinder
```
2. Install NPM packages
```bash
npm install
```
3. Create .env file and fill it

# Usage
After you finished the installation and you're done with the configuration to start the bot using this command:
```bash
npm start
```

# License
Distributed under the MIT License. See `LICENSE.txt` for more information.

# Contact
Roi Klevansky - roiklevansky@gmail.com  
Project Link: [https://github.com/RoiKlevansky/data-grinder](https://github.com/RoiKlevansky/data-grinder)

# Acknowledgments
* [whatsapp-js.web](https://github.com/pedroslopez/whatsapp-web.js)