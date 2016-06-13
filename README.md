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
> <sup>I am a bot. [Feedback](https://www.reddit.com/message/compose?to=%2Fr%2FAutoMobBot&subject=NeedAMod%20Bot&message=) | [Source Code](https://github.com/Matthewmob/needamod-bot)</sup>

In "Offer to Mod" posts (based on the flair):

> Here are 3 questions to help people who want to recruit you know what your like.
>
> 1.**How Active are you?** e.g. Hours per day
> 
> 2.**If you see a highly upvoted post, but it doesn't follow the rules, what would you do?**
> 
> 3.**In your opinion, what the most important quality a mod can have?**
> 
> ---
> <sup>I am a bot. [Feedback](https://www.reddit.com/message/compose?to=%2Fr%2FAutoMobBot&subject=NeedAMod%20Bot&message=) | [Source Code](https://github.com/Matthewmob/needamod-bot)</sup>

## Features
* Automatically reply with subreddit information of a subreddit mentioned in a post.
* Automatically reply with suggestions to "Offer to Mod" posts.
* Will check and reply only to the last **five** posts made in the last **15 minutes** (can be altered).

## Feedback
To send me feedback on the bot, send it through [modmail on /r/AutoMobBot](https://www.reddit.com/message/compose?to=%2Fr%2FAutoMobBot&subject=NeedAMod%20Bot&message=).

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
