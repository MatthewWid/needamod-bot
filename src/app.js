var Snoocore = require("snoocore");
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

var reddit = new Snoocore({
	userAgent: "NeedAMod Subreddit Info Commenter (Update 27) by /u/MatthewMob",
	oauth: config_oauth
});

// \/?[rR]\/

function decimalsInNum(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

reddit("/r/" + config_bot.subreddit + "/new").listing().then(function(slice) {
	for (var i = 0; i < config_bot.get_posts; i++) {
		(function() {
			var post_id = slice.children[i].data.name;
			var msg = "";
			var reAll = /\/?[rR]\/[a-zA-Z?_\d]+/g;
			var reRemove = /\/?[rR]\//g;
			var allText = reAll.exec(slice.children[i].data.title);
			if (allText) {
				var subName = allText[0].replace(reRemove, "");
				console.log(subName);
				
				reddit("/r/" + subName + "/about").get().then(function(result) {
					var age = Math.floor(((Date.now() / 1000) - result.data.created) / 60 / 60 / 24);
					var subscribers = result.data.subscribers;
					var currentMods = 0;
					var nsfw = result.data.over18;

					reddit("/r/" + subName + "/about/moderators").get().then(function(modlist) {
						currentMods = modlist.data.children.length;

						msg += "Subreddit Info (/r/" + result.data.display_name + "):\n\n";
						msg += "**Age**: " + decimalsInNum(age) + " days\n\n";
						msg += "**Subscribers**: " + decimalsInNum(subscribers) + "\n\n";
						msg += "**Current Mods**: " + decimalsInNum(currentMods) + "\n\n";
						msg += "**Over 18**: " + nsfw + "\n\n---\n\n";
						msg += config_bot.credit;
					}).then(function() {
						reddit("/api/comment").post({
							text: msg,
							thing_id: post_id
						}).then(function() {
							console.log("Commented");
						});
					});
				}, function() {
					console.error("/r/" + subName + " is non-accessible.");
					return;
				});
			}
		})();
	}
});