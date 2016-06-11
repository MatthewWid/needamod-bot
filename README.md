## What is this?
This is a bot that will automate the job of moderators on /r/needamod by automatically commenting to posts with things that usually moderators would have to do manually.  
This bot was created by me, /u/MatthewMob.

## Features
* Automatically reply with subreddit information of a subreddit mentioned in a post.
* Automatically reply with suggestions to "Offer to Mod" posts.
* Will check and reply only to the last **five** posts made in the last **15 minutes** (can be altered).

## Dependancies
* Python 3.4.x
* PRAW
* Beautiful Soup 4
* Requests
* OS
* Time
* Math
* Datetime

##_WARNING_
The code here was written in under three days and contains a **high amount of spaghetti**, right now there is next to nothing in optimisation.  
This also creates a text file (*checked.txt*) to store the IDs of posts that have been checked.
