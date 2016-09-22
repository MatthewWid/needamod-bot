#! python3
# Reply with subreddit info from subreddit in text body and give suggestions to people looking to mod

import praw, bs4, re, os, time, math, datetime

if os.path.isfile("checked.txt") == False:
    checked = []
else:
    file = open("checked.txt", "r")
    checked = file.read()
    checked = checked.split("\n")
    checked = list(set(checked))
    file.close()

# Bot login details
USERNAME = "<Username>"
PASSWORD = "<Password>"

# Subreddit to scan
SUBREDDIT = "<Subreddit>"

# Credit left at the end of every bot message
CREDIT = "\n\n---\n\n^I ^am ^a ^bot. [^Feedback](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2Fneedamod%20bot%20feedback&message=) ^| [^Source ^Code](https://github.com/Matthewmob/needamod-bot)"

# Delay between checks (in seconds)
LOOP_DELAY = 900

# Amount of posts to get from /new
GET_POSTS = 5

# How old a post must be for it to be able to be checked (in minutes)
WAIT_TIME = 5

UA = "/r/NeedAMod Automate Commenter (Update 20) by /u/MatthewMob"
r = praw.Reddit(UA)
r.login(USERNAME, PASSWORD, disable_warning=True)

def commentSub(sub, post):
    try:
        m = r.get_subreddit(sub, fetch=True)

        d1 = datetime.datetime.utcfromtimestamp(m.created_utc)
        com = "Subreddit Info (/r/" + m.display_name + "):\n\n**Age**: " + str((datetime.datetime.now() - d1).days) + " days\n\n**Subscribers**: " + str(m.subscribers) + "\n\n**Current Mods**: " + str(len(m.get_moderators())) + "\n\n**Over 18**: " + str(m.over18) + CREDIT
        
        print("\nCommenting Sub Info")
        print("Commenting on: " + post.id)
        print("Comment: " + com + "\n")

        post.add_comment(com)
    except:
        print("Non-existent subreddit: " + sub)

def commentOffer(post):
    com = "Here are three questions to help people who want to recruit you know what you're like:\n\n1. **How Active are you (Eg, hours per day) and what timezone are you in?**\n\n2. **If you see a highly upvoted post, but it doesn't follow the rules, what would you do?**\n\n3. **In your opinion, what is the most important quality a mod can have?**" + CREDIT

    print("\nCommenting Offer to Mod Help")
    print("Commenting on: " + post.id)
    print("Comment: " + com + "\n")

    post.add_comment(com)

def findSub(string):
    return re.findall("\/r\/(.*?)\/", string, re.DOTALL)

def minDif(post):
    d1 = time.mktime((datetime.datetime.utcfromtimestamp(post.created_utc)).timetuple())
    d2 = time.mktime((datetime.datetime.utcnow()).timetuple())

    dif = int(d2-d1)/60
    
    if dif > WAIT_TIME:
        return True
    else:
        print("Submission too new\n")
        return False

def postTitle(post):
    getsub = re.findall("\/?r\/[a-zA-Z?_\d]+", post.title, re.DOTALL)
    if getsub != None and len(getsub) > 0:
        href = getsub[0] + "/"
        getsub = findSub(href)
        commentSub(getsub[0], post)
        return True
    else:
        return False

while True:
    print("Checks started\n")
    try:
        submissions = r.get_subreddit(SUBREDDIT).get_new(limit=GET_POSTS)
    except:
        print("Subreddit no found: " + SUBREDDIT)
        break
    for submission in submissions:
        print("Checking " + submission.id + "\n")
        if submission.id not in checked and minDif(submission):
            if submission.link_flair_text != "offer to mod":
                if submission.is_self:
                    if postTitle(submission) == False and submission.selftext:
                        soup = bs4.BeautifulSoup(submission.selftext_html, "lxml")
                        a = soup.find_all("a", href=True)
                        if a and len(a) > 0:
                            href = a[0]["href"] + "/"
                            getsub = findSub(href)
                            if getsub != None and len(getsub) > 0:
                                commentSub(getsub[0], submission)
                elif not submission.is_self:
                    href = submission.url + "/"
                    getsub = findSub(href)
                    if getsub != None and len(getsub) > 0:
                        commentSub(getsub[0], submission)
                    else:
                        postTitle(submission)
            else:
                commentOffer(submission)

            checked.append(submission.id)

    file = open("checked.txt", "w")
    for post_id in checked:
        file.write(post_id + "\n")
    file.close()
    print("Checks finished\n")

    time.sleep(LOOP_DELAY)

print("Done...")
input()
