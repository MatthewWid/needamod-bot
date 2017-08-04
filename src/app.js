var Snoocore = require("snoocore");
var fs = require("fs");
/*
	Example config_oauth.json:

	{
		type: "script",
		key: "",
		secret: "",
		username: "",
		password: "",
		scope: [
			"read", "submit"
		]
	}
*/
var config_oauth = require("./config_oauth.json");
var config_bot = require("./config_bot.json");
config_bot.get_posts = Math.min(config_bot.get_posts, 25);

// Read file into checked
var checked_raw_init = fs.readFileSync(config_bot.checkedFile);
var checked = JSON.parse(checked_raw_init.toString());

var reddit = new Snoocore({
	userAgent: "NeedAMod Subreddit Info Commenter (Update 28) by /u/MatthewMob",
	oauth: config_oauth
});

// \/?[rR]\/

function decimalsInNum(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function logPost(postId, text) {
	console.log("---\n" + postId + "\n" + text + "\n---\n");
}
function addToChecked(postId) {
	checked.push(postId);
	// Write to file
	fs.writeFile(config_bot.checkedFile, JSON.stringify(checked));
}
String.prototype.capitalise = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

function update() {
	console.log("Checks started\n");
	reddit("/r/" + config_bot.subreddit + "/new").listing().then(function(slice) {
		for (var i = 0; i < config_bot.get_posts; i++) {
			if (checked.indexOf(slice.children[i].data.name) != -1) {
				//logPost(slice.children[i].data.name, "Post already checked: " + slice.children[i].data.name);
				continue;
			}
			(function() {
				var post_id = slice.children[i].data.name;
				var msg = "";
				var report_reason = "AutoMobBot - ";
				var reAll = /\/?[rR]\/[a-zA-Z?_\d]+/g;
				var reRemove = /\/?[rR]\//g;
				var allText = reAll.exec(slice.children[i].data.title);
				if (allText) {
					var subName = allText[0].replace(reRemove, "");
					
					reddit("/r/" + subName + "/about").get().then(function(result) {
						var age = Math.floor(((Date.now() / 1000) - result.data.created) / 60 / 60 / 24);
						var subscribers = result.data.subscribers;
						var currentMods = 0;
						var nsfw = result.data.over18;
						var minimumPosts = false;

						reddit("/r/" + subName + "/new").listing().then(function(slice) {
							if (slice.children.length >= config_bot.minimum_posts) {
								minimumPosts = true;
							}

							return reddit("/r/" + subName + "/about/moderators").get();
						}).then(function(modlist) { // Construct comment message
							currentMods = modlist.data.children.length;

							msg += "Subreddit Info (/r/" + result.data.display_name + "):\n\n";
							msg += "**Age**: " + decimalsInNum(age) + " days\n\n";
							msg += "**Subscribers**: " + decimalsInNum(subscribers) + "\n\n";
							msg += "**Current Mods**: " + decimalsInNum(currentMods) + "\n\n";
							msg += "**At Least 25 Posts**: " + minimumPosts.toString().capitalise() + "\n\n";
							msg += "**Over 18**: " + nsfw.toString().capitalise() + "\n\n---\n\n";
							msg += config_bot.credit;

							return reddit("/r/" + subName + "/new").listing();
						}).then(function() { // Submit
							reddit("/api/comment").post({
								text: msg,
								thing_id: post_id
							}).then(function() {
								console.log(msg);
								logPost(post_id, "Commenting: " + result.data.display_name);
								addToChecked(post_id);
							});
						});
					}, function() {
						logPost(post_id, "/r/" + subName + " is non-accessible.");
						addToChecked(post_id);
						return;
					});
				} else {
					logPost(post_id, "No subreddit in title: " + slice.children[i].data.title);
					addToChecked(post_id);
				}
			})();
		}
	}, function() {
		logPost("", "/r/" + config_bot.subreddit + " is not accessible.");
	});
}
var loop = setInterval(update, config_bot.wait_time * 1000);