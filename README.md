# spotify-sort [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

> Spotify should already allow creation of playlists by genre. It doesn't. So making this.

Table of Contents
-----------------

- [Background](#background)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Developing](#developing)
- [Building](#building)


Background
-----------

I read on a few forums that the ability to export a playlist by genre would be cool. Seems nobody is doing this yet, so attempting a simple client side app to achieve this.

Prerequisites
-------------

- [Node.js 6.10.0+](http://nodejs.org)

Getting Started
---------------

```bash
# Make sure you are using the correct version of node / npm
nvm use

# Install NPM dependencies
npm install

# Then simply start the app
npm start
```

Developing
----------

```bash
npm run start
```

This will run a webpack server with a watch task & rebuild on any changes

Building
--------
```bash
npm run build
````

Will create a bundle in `dist/` suitable for deployment.

---

Pull requests accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.
