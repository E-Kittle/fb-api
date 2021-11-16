# Odin-API : OdinBook

OdinBook is a responsive Facebook clone that was independently created as a completion of The Odin Project. Using React on the frontend, users can add/remove friends, create posts, and write comments, all of which are preserved with the node.js API backend.

This application is the API for Odinbook.


## Demo
A live demo is available at: [OdinBook](odinbook.elisabethoconnor.com)
![Screenshot of Demo](/public/images/odinbook.png)

## Features
- Choose your network by sending/receiving friend requests, accepting or rejecting requests, and deleting current friends.
- Create/edit/delete newsfeed posts with the option to add images
- Create/edit/delete comments
- Add profile and cover images

## How to Use
To clone and run this application, you'll need Git and Node.js (which comes with npm) installed on your computer. From your command line:

```
#clone this repository
$ git clone https://github.com/E-Monstera/odin-api.git

#Go into the respository
$ cd odin-api

#Install dependencies
$ npm install

#run the app
$ npm run
```

## Configuration
In order to properly run this application, you will your own environmental variables.
The required variables are as follows:
 - DB_URL : For your database
 - SECRET: For your JWT key