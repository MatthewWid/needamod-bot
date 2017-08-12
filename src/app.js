var Snoocore = require("snoocore");
var fs = require("fs");
var path = require("path");
var mongo = require("mongodb").MongoClient;
// MongoDB database should have a collection called "posts"
var assert = require("assert");
/*
	Example config_oauth.json:

	{
		type: "script",
		key: "",
		secret: "",
		username: "",
		password: "",
		scope: [
			"read", "submit", "report"
		]
	}
*/
/*
	Example config_db.json:

	{
		url: "<MongoDB URL>"
	}
*/

var config_oauth = JSON.parse(fs.readFileSync(__dirname + "/config_oauth.json"));
var config_bot = JSON.parse(fs.readFileSync(__dirname + "/config_bot.json"));
var config_db = JSON.parse(fs.readFileSync(__dirname + "/config_db.json"));
config_bot.get_posts = Math.min(config_bot.get_posts, 25);

/*
	MongoDB Entry template:

	{
		post_id: String
		author: String,
		type: String,
		time_checked: Integer (UTC DateTime)
		subreddit: {
			subName: String,
			age: Integer (UTC DateTime),
			currentMods: Integer,
			minimumPosts: Boolean,
			nsfw: Boolean,
			isMod: Boolean
		},
		user: {}
	}
*/
var posts = [];

mongo.connect(config_db.url, function(err, datab) {
	assert.equal(err, null);
	console.log("Successfully connected to MongoDB server.");

	var col = datab.collection(config_db.col);

	col.find({}).toArray(function(err, docs) {
		assert.equal(err, null);

		posts = docs;
		main(datab);
	});
});


function main(db) {
	var reddit = new Snoocore({
		userAgent: "NeedAMod Subreddit Info Commenter (Update 31) by /u/MatthewMob",
		oauth: config_oauth
	});

	// \/?[rR]\/

	function decimalsInNum(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	function logPost(postId, text) {
		console.log("---\n" + postId + "\n" + text + "\n---\n");
	}
	function addToChecked(data) {
		if (config_bot.checking) {
			posts.push(data);
			// Write to MongoDB
			db.collection(config_db.col).insertOne(data, function(err, result) {
				assert.equal(err, null);

				console.log("Successfully written to MongoDB.");
			});
		}
	}
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	function update() {
		console.log("Checks started\n");
		reddit("/r/" + config_bot.subreddit + "/new").listing({limit: config_bot.get_posts}).then(function(slice_overall) {
			for (var i = 0; i < config_bot.get_posts; i++) {
				if (posts.find(function(e) {return e.post_id == slice_overall.children[i].data.name})) { // Check if post has already been checked
					/*
						BUG:
						When bot starts all posts that are checked are skipped, but then the next three posts after them are also checked (Not intended)
					*/
					//logPost(slice_overall.children[i].data.name, "Post already checked: " + slice_overall.children[i].data.name);
					continue;
				}
				var timeDif = (Math.floor((Date.now() / 1000) - slice_overall.children[i].data.created_utc)) / 60;
				if (timeDif < config_bot.wait_time) { // Check if post is old enough to evaluate
					logPost(slice_overall.children[i].data.name, "Post too new to evaluate.")
					continue;
				}
				if (slice_overall.children[i].data.link_flair_text == config_bot.flair_names.mod) { // Check if post is a mod post
					logPost(slice_overall.children[i].data.name, "Skipping mod post");
					continue;
				}
				(function() {
					var post = slice_overall.children[i];
					var post_id = post.data.name;
					var msg = "";
					var reAll_sub = /\/?[rR]\/[a-zA-Z?_\d]+/g;
					var allText_sub = reAll_sub.exec(post.data.title);
					var canReport = false;
					var reportReason = config_bot.reports.prefix;

					if (allText_sub) { // If it is a subreddit
						if (post.data.link_flair_text == config_bot.flair_names.css) {
							msg += config_bot.cssmods_text;
						}
						var subName = allText_sub[0].replace(/\/?[rR]\//g, "");
						
						reddit("/r/" + subName + "/about").get().then(function(result) {
							var age = Math.floor(((Date.now() / 1000) - result.data.created) / 60 / 60 / 24);
							var subscribers = result.data.subscribers;
							var currentMods = 0;
							var minimumPosts = false;
							var nsfw = result.data.over18;
							var isMod = false;

							reddit("/r/" + subName + "/new").listing({limit: config_bot.minimum_posts + 2}).then(function(slice_new) {
								if (slice_new.children.length >= config_bot.minimum_posts) {
									minimumPosts = true;
								}

								/*
									BUG:
									Bot only checks the first 25 moderators, if the author is not in that it will mark them as not being mod.
								*/
								return reddit("/r/" + subName + "/about/moderators").get({limit: 100});
							}).then(function(modlist) { // Construct comment message
								currentMods = modlist.data.children.length;
								//console.log(modlist.data.children);
								//console.log(post.data.author);
								if ((modlist.data.children.findIndex(function(e) {return e.name == post.data.author;})) != -1) {
									isMod = true;
								}

								msg += "Subreddit Info (/r/" + result.data.display_name + "):\n\n";
								msg += "**Age**: " + decimalsInNum(age) + " days\n\n";
								msg += "**Subscribers**: " + decimalsInNum(subscribers) + "\n\n";
								msg += "**Current Mods**: " + decimalsInNum(currentMods) + "\n\n";
								msg += "**At Least 25 Posts**: " + minimumPosts.toString().capitalise() + "\n\n";
								msg += "**Over 18**: " + nsfw.toString().capitalise();
								msg += config_bot.credit;
							}).then(function() { // Submit
								if (config_bot.interact) {
									reddit("/api/comment").post({
										text: msg,
										thing_id: post_id
									});
								}
								// Report here
								if (config_bot.reports.should_report) {
									if (subscribers < config_bot.minimum_subs) {
										reportReason += config_bot.reports.reason_subs;
										canReport = true;
									}
									if (!minimumPosts) {
										reportReason += config_bot.reports.reason_posts;
										canReport = true;
									}
									if (!isMod) {
										reportReason += config_bot.reports.reason_mod;
										canReport = true;
									}

									if (canReport) {
										if (config_bot.interact) {
											reddit("/api/report").post({
												reason: reportReason,
												thing_id: post_id
											}).then(function() {
												logPost(post_id, "Reporting for: " + reportReason);
											});
										} else {
											logPost(post_id, "Reporting for: " + reportReason);
										}
									}
								}

								logPost(post_id, "Commenting: " + result.data.display_name);
								addToChecked({
									post_id: post_id,
									author: post.data.author,
									type: "subreddit",
									time_checked: Date.now() / 1000,
									didReport: canReport,
									subreddit: {
										subName: subName,
										age: age,
										subscribers: subscribers,
										currentMods: currentMods,
										minimumPosts: minimumPosts,
										nsfw: nsfw,
										isMod: isMod
									},
									user: {}
								});
							});
						}, function() {
							logPost(post_id, "/r/" + subName + " is non-accessible.");
							addToChecked({
								post_id: post_id,
								author: post.data.author,
								type: "noaccess",
								time_checked: Date.now() / 1000,
								didReport: canReport,
								subreddit: {
									subName: subName
								},
								user: {}
							});
							return;
						});
					} else { // If it is a user
						var reAll_user = /\/?[uU]\/[a-zA-Z?_\d]+/g;
						var allText_user = reAll_user.exec(post.data.title);
						var userName = allText_user[0].replace(/\/?[uU]\//g, "");
						if (allText_user) {
							msg += config_bot.offermod_text;
							msg += config_bot.credit;
							if (config_bot.interact) {
								reddit("/api/comment").post({
									text: msg,
									thing_id: post_id
								});
							}
							logPost(post_id, "Commenting: " + allText_user[0]);
							addToChecked({
								post_id: post_id,
								author: post.data.author,
								type: "user",
								time_checked: Date.now() / 1000,
								didReport: canReport,
								subreddit: {},
								user: {}
							});
						}
					}
				})();
			}
		}, function() {
			logPost("", "/r/" + config_bot.subreddit + " is not accessible.");
			clearInterval(loop);
		});
	}
	update();
	var loop = setInterval(update, config_bot.loop_delay * 1000 * 60);
}