## What is this?
This is a bot that will automate the job of moderators on /r/needamod by automatically commenting on posts with subreddit information and user information as well as reporting rule breaking posts. The bot will also automatically give users flairs by request in private message to the bot.

The bot has two comment templates.

For regular posts (where people are looking for mods):

> Subreddit Info (/r/\<Subreddit\>):
>
> **Age**: \<Age\>
>
> **Subscribers**: \<Number\>
>
> **Current Mods**: \<Number\>
>
> ---
>
> <sup>I am a bot. [Feedback/Questions](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2FNeedAMod%20Bot%20Feedback%2FQuestion&message=) | [Source Code](https://github.com/MatthewWid/needamod-bot) | [Get your flair](https://www.reddit.com/message/compose?to=needamod-bot&subject=Flair%20Request&message=%5BReplace%20this%20text%20with%20a%20list%20of%20skills%20you%20have.%20Anything%20from%20%22css%22%2C%20%22automod%22%2C%20%22bot%22%20or%20%22wiki%22.%20Or%20leave%20this%20text%20box%20as%20is%20or%20empty%20if%20you%20do%20not%20need%20any%20relevant%20skills%20next%20to%20your%20flair.%5D)</sup>

In "Offer to Mod" posts (based on the flair):

> User Info (/u/\<Username\>):
>
> **Total Karma**: \<Number\>
>
> **Account Age**: \<Age\>
>
> Here are five questions to help people who want to recruit you know what you're like:
>
> 1. **What are your interests/what type of subreddit would you prefer to moderate?**
>
> 2. **Are you willing to moderate an NSFW subreddit?**
>
> 3. **How active are you (Eg, hours per day) and what timezone are you in?**
>
> 4. **If you see a highly upvoted post but it doesn't follow the rules what would you do?**
>
> 5. **In your opinion, what is the most important quality a moderator can have?**
>
> You do not have to answer these questions if you are offering services *only* as a CSS, wiki or bot moderator.
> 
> ---
> <sup>I am a bot. [Feedback/Questions](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2FNeedAMod%20Bot%20Feedback%2FQuestion&message=) | [Source Code](https://github.com/MatthewWid/needamod-bot) | [Get your flair](https://www.reddit.com/message/compose?to=needamod-bot&subject=Flair%20Request&message=%5BReplace%20this%20text%20with%20a%20list%20of%20skills%20you%20have.%20Anything%20from%20%22css%22%2C%20%22automod%22%2C%20%22bot%22%20or%20%22wiki%22.%20Or%20leave%20this%20text%20box%20as%20is%20or%20empty%20if%20you%20do%20not%20need%20any%20relevant%20skills%20next%20to%20your%20flair.%5D)</sup>

The bot will also give user flairs based on the total amount of subscribers of the subreddits that a user moderates. The reply message template is:

> **You have been given the \<Flair Level\> flair** (\<Number\> subscribers total).
>
> Your flair will now read:
>
> \<Flair Level\> | \<List of Templates\>
>
> If you believe this is a mistake, contact the moderators here. Do not reply to this message.
>
> ---
>
> <sup>I am a bot. [Feedback/Questions](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2FNeedAMod%20Bot%20Feedback%2FQuestion&message=) | [Source Code](https://github.com/MatthewWid/needamod-bot) | [Get your flair](https://www.reddit.com/message/compose?to=needamod-bot&subject=Flair%20Request&message=%5BReplace%20this%20text%20with%20a%20list%20of%20skills%20you%20have.%20Anything%20from%20%22css%22%2C%20%22automod%22%2C%20%22bot%22%20or%20%22wiki%22.%20Or%20leave%20this%20text%20box%20as%20is%20or%20empty%20if%20you%20do%20not%20need%20any%20relevant%20skills%20next%20to%20your%20flair.%5D) | Ref.:\<Reference Number\></sup>

## Features
* Automatically reply with subreddit information of a subreddit mentioned in a post.
* Automatically reply with suggested questions on "Offer to Mod" posts.
* Automatically report posts that don't fit within the criteria of the subreddit rules.
* Automatically give user flairs by request if private messaged.
* Fully customizable via a JSON configuration (config_bot.json).

## Feedback
Please use the "Issues" section on this repository to give technical issues, feedback and bug reports on the bot.

## NPM Dependancies
* snoowrap (>1.15.2)
* mongodb (>3.0.5)
* request (>2.87.0)
* request-promise (>4.2.2)
