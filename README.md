## What is this?
This is a bot that will automate the job of moderators on /r/needamod by automatically commenting to posts with things that usually moderators would have to do manually.  
This bot was created by me, [/u/MatthewMob](https://www.reddit.com/user/MatthewMob/).

The bot has two comment templates.

For regular posts (where people are looking for mods):

> Subreddit Info (/r/\<Subreddit\>):
>
> **Age**: \<Number\> days
>
> **Subscribers**: \<Number\>
>
> **Current Mods**: \<Number\>
>
> **Over 18**: \<True/False\>
>
> ---
>
> <sup>I am a bot. [Feedback](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2Fneedamod%20bot%20feedback&message=) | [Source Code](https://github.com/Matthewmob/needamod-bot)</sup>

In "Offer to Mod" posts (based on the flair):

> Here are three questions to help people who want to recruit you know what your like.
>
> 1.**How Active are you (Eg, hours per day) and what timezone are you in?**
> 
> 2.**If you see a highly upvoted post, but it doesn't follow the rules, what would you do?**
> 
> 3.**In your opinion, what the most important quality a mod can have?**
> 
> ---
> <sup>I am a bot. [Feedback](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2Fneedamod%20bot%20feedback&message=) | [Source Code](https://github.com/Matthewmob/needamod-bot)</sup>

## Features
* Automatically reply with subreddit information of a subreddit mentioned in a post.
* Automatically reply with suggested questions on "Offer to Mod" posts.
* Will check and reply only to the last **five** posts made in the last **15 minutes** (by default, can be changed in the config vars)).

You can find additional, and more detailed information about the bot [here](https://redd.it/4v4z1u).

You can find planned features [here](https://redd.it/4v50l2).

## Installation and Running the Bot
This is a quick guide on how to set up the bot for hosting on [PythonAnywhere](https://www.pythonanywhere.com).

1. In this github repo, press the "Clone or download" button, and download the repo as a ZIP file, and extract `automobbot.py` anywhere.
2. Go to [PythonAnywhere](https://www.pythonanywhere.com) > Pricing & signup > Create a Beginner account. Remember, this is **free**.
3. Once you've created your account you should be taken to the dashboard. First we're going to install dependencies:
    1. Under the "Consoles" tab scroll down and under "Start a new console:" click on "Bash". Give it a bit of time to load up.
    2. Once it's loaded type:
      - `pip install praw --user` *Enter*
      - `pip install beautifulsoup4 --user` *Enter*
      - `pip install requests --user` *Enter*
      - `pip install datetime --user` *Enter*
    3. You're done installing dependencies! Now we'll get the actual bot running.
4. Go back to the PythonAnywhere dashboard and go to the "Files" tab.
5. Click on "Upload a file" and upload the `automobbot.py` file that you extracted previously.
6. Now select "edit" [next to the upload file](http://i.imgur.com/oFFpLZF.png) (a box with a pencil icon).
7. Change the bots configuration.
  - Change `<Username>` to the username of your bot account (remember you should have made a seperate account for your bot).
  - Change `<Password>` to the password of your bot account, this will ensure that the script can automate things on the bots behalf. 
  - Change `<Subreddit>` to the subreddit you want the bot to be active in (excluding the `/r/` or `r/` - eg instead of `/r/example` just have `example`).
  - You can also change the value of other variables such as `LOOP_DELAY` (default 600 seconds - 10 minutes), `GET_POSTS` (default 3 posts), `WAIT_TIME` (default 5 minutes).
8. Hit the "Save" button in the top right and go back to Dashboard, and then back to the "Consoles" tab.
9. Start another Bash console (like we did in step 3. i.) and type `python automobbot.py` (remember to make the bots account an approved submitter in your subreddit so it doesn't get caught by the spam filter).
10. That's it! If you've done everything correctly the bot should be running and the console should go on to say `Checks started`, then if it finds something to post it will log it, and then say `Checks finished`. The bot is now correctly functioning! [Here's an example of what my console looks like when I run it](http://i.imgur.com/x3P8M8V.png).

**IMPORTANT:** Because you're on a free PythonAnywhere account they don't dedicate as much server space for you, so the bot may go down every 12-72 hours (it's annoying, but it's free). Remember to consistently check if it's still running by going to the Bash console (not starting a new console) under "Your consoles:" and click on the console, if it's just a long list of `Checks started` and `Checks finished` then it's still running and you don't have to do anythong. If you see anything other than this, [such as a large error block of text](http://i.imgur.com/s0pxALf.png), or there's just nothing there (as if you just started a new console) just restart it by typing `python automobbot.py` again.

## Feedback
To send me feedback on the bot or ask for installation help, send me a [direct message on Reddit](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2Fneedamod%20bot%20feedback&message=).

## Python Dependancies
* Python 3.4.x
* PRAW
* Beautiful Soup 4
* Requests
* Datetime

**Note:** This will also create a new file called "checked.txt" which must be kept in order for posts to not be commented on multiple times.
