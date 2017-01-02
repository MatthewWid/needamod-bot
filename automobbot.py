#! python3
# Reply with subreddit info from subreddit in text body and give suggestions to people looking to mod

import praw, bs4, re, os, time, datetime

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
CREDIT = "^I ^am ^a ^bot. [^Feedback/Questions](https://www.reddit.com/message/compose?to=MatthewMob&subject=%2Fr%2FNeedAMod%20Bot%20Feedback%2FQuestion&message=) ^| [^Source ^Code](https://github.com/Matthewmob/needamod-bot) ^| ^/r/AutoMobBot"

# Delay between checks (in seconds)
LOOP_DELAY = 600

# Amount of posts to get from /new per loop
GET_POSTS = 3

# How old a post must be for it to be checked (Allows time for flairing the post)
WAIT_TIME = 5

UA = "NeedAMod Subreddit Info and Comment Template Commenter (Update 25) by /u/MatthewMob"
r = praw.Reddit(UA)
r.login(USERNAME, PASSWORD, disable_warning=True)

def commentSubs(subList, post):
    msg = ""
    print(post.link_flair_text)
    if post.link_flair_text == "css mods needed":
        msg += "Here are a few questions to inform people who are interested in helping you know what you need:\n\n1. **Are you requesting a specific \"theme\" (entire sub designed around a color, modern look, dark look, etc)?**\n\n2. **Do you need just a few simple things like user flair/link flair, header image, etc?**\n\n3. **Do you need more advanced CSS work done? (For example, drop-down menus, `lang()`, animations, etc.)**\n\n4. **Are you looking for a mod who can create custom art as well as implement it via CSS?**\n\n---\n\n"
    for sub in subList:
        try:
            m = r.get_subreddit(sub, fetch=True)

            d1 = datetime.datetime.utcfromtimestamp(m.created_utc)
            msg += "Subreddit Info (/r/" + m.display_name + "):\n\n**Age**: " + str("{:,}".format((datetime.datetime.now() - d1).days)) + " days\n\n**Subscribers**: " + str("{:,}".format(m.subscribers)) + "\n\n**Current Mods**: " + str("{:,}".format(len(m.get_moderators()))) + "\n\n**Over 18**: " + str(m.over18) + "\n\n---\n\n"

            time.sleep(2.1);
        except:
            None
    if msg != "":
        msg += CREDIT
        post.add_comment(msg)

def commentOffer(post):
    msg = "Here are three questions to help people who want to recruit you know what you're like:\n\n1. **How active are you (Eg, hours per day) and what timezone are you in?**\n\n2. **If you see a highly upvoted post, but it doesn't follow the rules, what would you do?**\n\n3. **In your opinion, what is the most important quality a mod can have?**\n\nThere is no requirement to answer these questions if you are offering services *only* as a CSS mod.\n\n---\n\n" + CREDIT

    post.add_comment(msg)

def findSub(string):
    return re.findall("\/?[rR]\/[a-zA-Z?_\d]+", string, re.DOTALL)

def minDif(post):
    d1 = time.mktime((datetime.datetime.utcfromtimestamp(post.created_utc)).timetuple())
    d2 = time.mktime((datetime.datetime.utcnow()).timetuple())

    dif = int(d2-d1)/60

    if dif > 1:
        return True
    else:
        print("Submission (" + submission.id + ") too new\n")
        return False

def postTitle(post):
    getsub = re.findall("\/?[rR]\/[a-zA-Z?_\d]+", post.title, re.DOTALL)
    if addSubFound(getsub) == True:
        return True
    else:
        return False

def addSubFound(subList):
    if subList != None and len(subList) > 0:
        for i in subList:
            i = (re.sub("\/?[rR]\/", "", findSub(i + "/")[0])).lower()
            if i not in subsFound:
                subsFound.append(i)

subsFound = []

while True:
    print("Checks started")
    try:
        submissions = r.get_subreddit(SUBREDDIT).get_new(limit=GET_POSTS)
    except:
        print("Subreddit not found: " + SUBREDDIT)
        break
    try:
        for submission in submissions:
            if submission.id not in checked and minDif(submission):
                print("\nChecking " + submission.id)
                if submission.link_flair_text != "offer to mod":
                    subsFound = []
                    if submission.is_self: # Self text
                        postTitle(submission)
                        if submission.selftext: # If the submission has text content
                            soup = bs4.BeautifulSoup(submission.selftext_html, "lxml")
                            a = soup.find_all("a", href=True)
                            if a and len(a) > 0: # If the content has links
                                for i in a:
                                    addSubFound(findSub(a[0]["href"] + "/"))
                    elif not submission.is_self: # Link post
                        postTitle(submission)
                        addSubFound(findSub(submission.url + "/"))
                    try:
                        commentSubs(subsFound, submission)
                    except:
                        print("Bad response from server");
                    print(subsFound)
                else: # If it's an "offer to mod" post
                    commentOffer(submission)
                    print("offer to mod")
                checked.append(submission.id)
    except:
        print("Bad response from server 2");

    file = open("checked.txt", "w")
    for post_id in checked:
        file.write(post_id + "\n")
    file.close()
    print("\nChecks finished\n")

    time.sleep(LOOP_DELAY)

print("Done...")
input()
