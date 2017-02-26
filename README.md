# front-end-boilerplate [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

> For starting front end projects

Table of Contents
-----------------

- [Background](#background)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Developing](#developing)
- [Building](#building)


Background
-----------

I needed a quick way to start up a project

Prerequisites
-------------

- [Node.js 6.10.0+](http://nodejs.org)

Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/robhuzzey/front-end-boilerplate.git myproject
rm -rf .git # Prevents trying to push changes to this repo

# Change directory
cd myproject

# Install NPM dependencies
npm install

# Then simply start your app
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
