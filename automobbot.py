#! python3
# Reply with subreddit info from subreddit in text body

import praw, bs4, re, os, time, math, datetime
from pprint import pprint

if os.path.isfile("checked.txt") == False:
    checked = []
else:
    file = open("checked.txt", "r")
    checked = file.read()
    checked = checked.split("\n")
    checked = list(set(checked))
    file.close()

# Bot login details
USERNAME = "<Bot Username>"
PASSWORD = "<Bot Password>"

# Subreddit to scan
SUBREDDIT = "/r/needamod"

# Delay between checks (in seconds)
LOOP_DELAY = 900

UA = "/r/NeedAMod Subreddit Info + Offer To Mod Helper (Update 12) by /u/MatthewMob"
r = praw.Reddit(UA)
r.login(USERNAME, PASSWORD, disable_warning=True)

def commentSub(sub, post):
    m = r.get_subreddit(sub, fetch=True)
    d1 = datetime.datetime.utcfromtimestamp(m.created_utc)
    com = "Subreddit Info (/r/" + m.display_name + "):\n\n**Age**: " + str((datetime.datetime.now() - d1).days) + " days\n\n**Subscribers**: " + str(m.subscribers) + "\n\n**Current Mods**: " + str(len(m.get_moderators())) + "\n\n**Over 18**: " + str(m.over18) + "\n\n---\n\n^I ^am ^a ^bot, [^contact ^my ^owner ^here](https://www.reddit.com/message/compose?to=MatthewMob&subject=MobAutoBot&message=)^."
    
    print("\nCommenting Sub Info")
    print("Commenting on: " + post.id)
    print("Comment: " + com + "\n")

    post.add_comment(com)

def commentOffer(post):
    com = "Here are 3 questions to help people who want to recruit you know what your like.\n\n1.**How Active are you?** e.g. Hours per day\n\n2.**If you see a highly upvoted post, but it doesn't follow the rules, what would you do?**\n\n3.**In your opinion, what the most important quality a mod can have?**\n\n---\n\n^I ^am ^a ^bot, [^contact ^my ^owner ^here](https://www.reddit.com/message/compose?to=MatthewMob&subject=MobAutoBot&message=)^."

    print("\nCommenting Offer to Mod Help")
    print("Commenting on: " + post.id)
    print("Comment: " + com + "\n")

    post.add_comment(com)

def findSub(string):
    return re.findall("\/r\/(.*?)\/", string, re.DOTALL)

while True:
    print("Checks started\n");
    submissions = r.get_subreddit(SUBREDDIT).get_new(limit=5)
    for submission in submissions:
        print("Checking " + submission.id + "\n")
        if submission.id not in checked:
            if submission.link_flair_text != "offer to mod":
                if submission.is_self == True:
                    soup = bs4.BeautifulSoup(submission.selftext_html, "lxml")
                    a = soup.find_all("a", href=True)
                    if a and len(a) > 0:
                        href = a[0]["href"] + "/"
                        getsub = findSub(href)
                        if getsub != None:
                            commentSub(getsub[0], submission)
                    else:
                        getsub = re.findall("\/r\/[a-zA-Z]+", submission.title, re.DOTALL)
                        if getsub != None:
                            href = getsub[0] + "/";
                            getsub = findSub(href)
                            commentSub(getsub[0], submission)
                else:
                    href = submission.url + "/"
                    getsub = re.findall("\/r\/(.*?)\/", href, re.DOTALL)
                    if getsub != None:
                        commentSub(getsub[0], submission)
            elif submission.link_flair_text == "offer to mod":
                commentOffer(submission)

        if submission.id not in checked:
            checked.append(submission.id)

    file = open("checked.txt", "w")
    for post_id in checked:
        file.write(post_id + "\n")
    file.close()
    print("Checks finished\n")

    time.sleep(LOOP_DELAY)

print("Done...")
input()