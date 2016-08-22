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

## Feedback
To send me feedback on the bot, send me a [direct message on Reddit](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2Fneedamod%20bot%20feedback&message=).

## Python Dependancies
* Python 3.4.x
* PRAW
* Beautiful Soup 4
* Requests
* Datetime

**Note:** This will also create a new file called "checked.txt" which must be kept in order for posts to need be commented on multiple times.
