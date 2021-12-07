<!-- PROJECT LOGO -->
<div align="center">
    <img src="assets/icon.png" alt="logo" width="80" heigh="80">
    <h3 align="center">Data Grinder</h3>
    <p align="center">WhatsApp bot that makes cool graphs out of saved WhatApp records.</p>
</div>


## Table of contents <!-- omit in toc -->
- [About The Project](#about-the-project)
- [Getting started](#getting-started)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## About The Project
Data Grinder is a WhatsApp bot that stores all records of messages, chats and participants in a PostgreSQL database, and use the data to make cool graphs via commands.  

**NOTE:** This bot will require the WhatsApp's multiuser-beta and uses a development branch of "whatsapp-web.js" which may result in some bugs and issues.

## Getting started

### Dependencies
* Google Chrome/Chromium v60.0+  
* Node.js    
* npm  
* PostgreSQL(doesn't have to be local)  

### Installation
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

## Usage
After you finished the installation and you're done with the configuration to start the bot using this command:
```bash
npm start
```

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact
Roi Klevansky - roiklevansky@gmail.com  
Project Link: [https://github.com/RoiKlevansky/data-grinder](https://github.com/RoiKlevansky/data-grinder)

## Acknowledgments
* [whatsapp-js.web](https://github.com/pedroslopez/whatsapp-web.js)
<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>