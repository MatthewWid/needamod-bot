var snoowrap = require("snoowrap");
var fs = require("fs");
var mongo = require("mongodb").MongoClient;

/*
	Template for config_ouath.js:
		userAgent: String,
		clientId: String,
		clientSecret: String,
		username: String,
		password: String

	Template for config_db.js:
		url: String,
		col: String
*/

const config_oauth = JSON.parse(fs.readFileSync(__dirname + "/config_oauth.json"));
const config_bot = JSON.parse(fs.readFileSync(__dirname + "/config_bot.json"));
const config_db = JSON.parse(fs.readFileSync(__dirname + "/config_db.json"));
config_bot.get_posts = Math.min(config_bot.get_posts, 25);
config_bot.user_flairs.exp.max = Infinity;

const r = new snoowrap(config_oauth);

var allPosts = [];

// Check if there is an error. If so, print it and exit program
function checkErrorBlank(err) {
	if (err !== null) {
		console.log(err);
		process.exit();
	}
}

// Format and then log a given message
function log(msg) {
	console.log("\n", msg);
}

// Connect to MongoDB, collect all previously checked posts, and run the main function
mongo.connect(config_db.url, function(err, datab) {
	checkErrorBlank(err);
	log("Successfully connected to MongoDB server.");

	var col = datab.db("needamod-subreddits").collection(config_db.col);
	col.find({}).toArray(function(err, docs) {
		checkErrorBlank(err);

		allPosts = docs;
		main(datab);
	});
});

function main(db) {
	// Take an integer and return a string that is formatted with decimals. Eg, 3985721 turns into "3,985,721"
	function formatNum(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	// Take an integer and return a string that is the formatted UTC time to a human readable time.
	function formatAge(age) {
		// age = seconds
		var msg = "";

		var years = (age / 60 / 60 / 24 / 365); // Total years
		var months = (12 * (years % 1));
		var days = (30 * (months % 1));
		years = Math.floor(years);
		months = Math.floor(months);
		days = Math.floor(days);

		if (years > 0) {
			msg += years + (years > 1 ? " years" : " year");
		}
		if (months > 0) {
			msg += (years > 0 ? ", " : "") + months + (months > 1 ? " months" : " month");
		}
		if (days > 0) {
			msg += (months > 0 ? ", " : "") + days + (days > 1 ? " days" : " day")
		}
		if (msg == "") {
			msg = "Less than a day";
		}

		return msg;
	}
	// Add a post to the checked list and write it to the MongoDB
	function addToChecked(data) {
		if (config_bot.checking) {
			allPosts.push(data);
			db.db("needamod-subreddits").collection(config_db.col).insertOne(data, function(err, result) {
				checkErrorBlank(err);
			});
		}
	}
	// Capitalise the string
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};

	// Main function of the bot that is called each loop
	function update() {
		var timeNow = new Date();
		log("Checks started (" + timeNow.toLocaleTimeString("en-US") + ")");

		var mainPromises = [];

		mainPromises.push(
			r.getSubreddit(config_bot.subreddit).getNew({limit: config_bot.get_posts}).then((posts) => {
				// Quickly filter and remove posts that cannot be checked, then return a list of posts ready to check
				var validPosts = [];
				var timeNow = Math.floor(Date.now() / 1000);
				for (var i = 0; i < posts.length; i++) {
					// If the post has already been checked do not check it
					if (allPosts.find((e) => e.post_id == posts[i].id)) {
						log(posts[i].id + " | Skipping | Already checked.");
						continue;
					}

					// If the post is too young to be checked do not check it
					if ((timeNow - posts[i].created_utc) / 60 < config_bot.wait_time) {
						log(posts[i].id + " | Skipping | Too young.")
						continue;
					}

					// If the post has a "Mod Post" flair do not check it
					if (posts[i].link_flair_text == config_bot.post_flair_names.mod) {
						log(posts[i].id + " | Skipping | Mod post.");
						continue;
					}

					validPosts.push(posts[i]);
				}
				return validPosts;
			}).then((posts) => {
				// Push all promises to subreddit into an array, wait for all promises to be processed in that array
				var promises = [];
				for (var l = 0; l < posts.length; l++) {
					(function() {
						const i = l;
						var allText_sub = /\/?[rR]\/[a-zA-Z?_\d]+/g.exec(posts[i].title);
						var allText_user = /\/?[uU]\/[a-zA-Z?_\d]+/g.exec(posts[i].title);
						var msg = "";
						var isMod = false;
						var canReport = false;
						var reportReason = config_bot.reports.prefix;

						if (allText_sub) { // If the title has a subreddit
							// If the post has a "css mods needed" flair, prepend the comment with the CSS questions
							if (posts[i].link_flair_text == config_bot.post_flair_names.css) {
								msg += config_bot.cssmods_text;
							}

							var subName = allText_sub[0].replace(/\/?[rR]\//g, "");
							var subInfo;
							promises.push(
								r.getSubreddit(subName).fetch().then((sub) => {
									subInfo = {
										name: sub.display_name,
										ageDays: Math.floor((Date.now() / 1000 - sub.created_utc) / 60 / 60 / 24),
										realAge: Math.floor((Date.now() / 1000 - sub.created_utc)),
										subscribers: sub.subscribers,
										nsfw: sub.over18,
										sub: sub
									};

									msg += "Subreddit Info (/r/" + subInfo.name + "):\n\n";
									// TODO:
									// Convert the age to Years, Months, Days in the comment.
									msg += "**Age**: " + formatAge(subInfo.realAge) + "\n\n";
									msg += "**Subscribers**: " + formatNum(subInfo.subscribers) + "\n\n";

									return sub.getModerators();
								}).then((mods) => {
									subInfo.currentMods = mods.length;

									isMod = mods.find((mod) => {
										return mod.name == posts[i].author.name;
									}) ? true : false;

									msg += "**Current Mods**: " + subInfo.currentMods + "\n\n";

									return subInfo.sub.getNew({limit: config_bot.minimum_posts});
								}).then((subPosts) => {
									subInfo.minimumPosts = subPosts.length >= config_bot.minimum_posts;

									msg += "**At Least 25 Posts**: " + (subPosts.length >= config_bot.minimum_posts ? "Yes" : "No") + "\n\n";
									msg += "**NSFW**: " + (subInfo.nsfw ? "Yes" : "No") + "\n\n";
									msg += config_bot.credit;

									if (config_bot.interact) {
										return posts[i].reply(msg);
									} else {
										return;
									}
								}).then(() => {
									if (config_bot.reports.should_report) {
										if (subInfo.subscribers < config_bot.minimum_subs) {
											reportReason += config_bot.reports.reason_subs;
											canReport = true;
										}
										if (!subInfo.minimumPosts) {
											reportReason += config_bot.reports.reason_posts;
											canReport = true;
										}
										if (!isMod) {
											reportReason += config_bot.reports.reason_mod;
											canReport = true;
										}

										if (canReport) {
											if (config_bot.interact) {
												return posts[i].report(
													{
														reason: reportReason
													}
												)
											}
										}
									}

									return false;
								}).then(() => {
									if (config_bot.interact) {
										log(posts[i].id + " | Commenting | Subreddit");
									}
									addToChecked({
									 	post_id: posts[i].id,
									 	author: posts[i].author.name,
									 	type: "subreddit",
									 	timeChecked: Date.now() / 1000,
									 	didReport: canReport,
									 	subreddit: {
									 		subName: subInfo.name,
									 		age: subInfo.age,
									 		realAge: subInfo.realAge,
									 		subscribers: subInfo.subscribers,
									 		currentMods: subInfo.currentMods,
									 		minimumPosts: subInfo.minimumPosts,
									 		nsfw: subInfo.nsfw,
									 		isMod: isMod
									 	},
									 	user: {}
									});
								})
							);
						} else if (allText_user) { // If the title has a user
							var userName = allText_user[0].replace(/\/?[uU]\//g, "");
							var userInfo;

							promises.push(
								r.getUser(posts[i].author.name).fetch().then((user) => {
									userInfo = {
										name: posts[i].author.name,
										totalKarma: user.link_karma + user.comment_karma,
										ageDays: Math.floor((Date.now() / 1000 - user.created_utc) / 60 / 60 / 24),
										realAge: Math.floor((Date.now() / 1000 - user.created_utc))
									};
									msg += "User Info (/u/" + userInfo.name + "):\n\n";
									msg += "**Total Karma**: " + formatNum(userInfo.totalKarma) + "\n\n";
									msg += "**Account Age**: " + formatAge(userInfo.realAge) + "\n\n";
									msg += "---\n\n";
									msg += config_bot.offermod_text;
									msg += config_bot.credit;

									return posts[i].reply(msg);
								}).then(() => {
									if (config_bot.reports.should_report) {
										if (userInfo.totalKarma < 500) {
											reportReason += config_bot.reports.reason_karma;
											canReport = true;
										}
										if (userInfo.age < 90) {
											reportReason += config_bot.reports.reason_age;
											canReport = true;
										}

										if (canReport) {
											if (config_bot.interact) {
												return posts[i].report(
													{
														reason: reportReason
													}
												)
											}
										}
									}

									return;
								}).then(() => {
									if (config_bot.interact) {
										log(posts[i].id + " | Commenting | User");
									}
									addToChecked({
									 	post_id: posts[i].id,
									 	author: posts[i].author.name,
									 	type: "user",
									 	timeChecked: Date.now() / 1000,
									 	didReport: canReport,
									 	subreddit: {},
									 	user: {
									 		totalKarma: userInfo.totalKarma,
									 		age: userInfo.age
									 	}
									});
								})
							);
						}
					})();
				}
				// Wait for all subreddits to be processed, then end program
				return Promise.all(promises);
			})
		);

		mainPromises.push(
			// TODO:
			// If config_bot.interact is set to false, do not do anything in this section.
			r.getUnreadMessages({filter: "messages"}).then((messages) => {
				var promiseArr = [];

				for (var l = 0; l < messages.length; l++) {
					(function() {
						const i = l;

						if (messages[i].subject.toLowerCase().indexOf("flair") != -1) {
							var subreddits = messages[i].body.split(" ");
							// var info = {
							// 	author: messages[i].author.name,
							// 	totalSubs: 0
							// };
							var subs = [];
							var subNames = [];

							
							// TODO:
							// Have a limited amount of subreddits that a user can supply (So they can't give 1000 subreddits and keep the bot waiting for an extended period of time).
							for (var j = 0; j < subreddits.length; j++) { // Get each subreddit in the message
								(function() {
									var sub = subreddits[j].replace(/\/?[rR]\//g, "");

									subs.push( // Push each promise to the subs array
										r.getSubreddit(sub).getModerators().then((mods) => { // Get the mod list
											if (mods.find((e) => e.name == messages[i].author.name)) { // If they are a moderator of the subreddit
												return r.getSubreddit(sub).fetch(); // Return the subreddit info to the next promise
											} else { // If they are not a moderator
												return false; // Return nothing
											}
										}).then((subInfo) => {
											if (subInfo) { // If they do mod the subreddit
												for (var x = 0; x < subNames.length; x++) { // Check that it's not a subreddit already given
													if (subInfo.name == subNames[x]) {
														return 0;
													}
												}
												subNames.push(subInfo.name); // Add the subreddit name to the list of given subreddits
												return subInfo.subscribers; // Return the subreddit subscribers
											} else {
												return 0;
											}
										})
									);
								})();
							}

							promiseArr.push( // Wait for all promises in the subs array to finish
								Promise.all(subs).then((values) => { // Take the subscribers of each subreddit in the array
									var totalSubs = 0;
									values.forEach((e) => { // Add all the subscribers together
										totalSubs += e;
									});

									return { // Return the author and the total amount of subscribers they have in their subreddits
										msg: messages[i],
										author: messages[i].author,
										totalSubs: totalSubs
									};
								})
							);
						}
					})();
				}

				return Promise.all(promiseArr);
			}).then((allReturns) => {
				// Now go through each item in the array of returned results and assign flairs based on their total subscribers
				var promiseArr = [];

				function giveFlair(req, text, flair) {
					if (text != undefined && flair != undefined) { // Give them a flair
						return req.author.assignFlair({
							subredditName: config_bot.subreddit,
							text: text,
							cssClass: flair.css
						}).then(() => {
							return req.msg.reply("**You have been given the " + flair.name + " flair** (" + formatNum(req.totalSubs) + " subscribers total).\n\n" + config_bot.mistake_credit + config_bot.credit);
						});
					} else { // If text and CSS have not been supplied, remove their flair
						return req.author.assignFlair({
							subredditName: config_bot.subreddit
						}).then(() => {
							return req.msg.reply("**Your flair has been removed**.\n\n" + config_bot.mistake_credit + config_bot.credit);
						});
					}
				}
				function fitsCriteria(totalSubs, flair_rules) { // Check if the total amount of subscribers fit between the given criteria
					return (totalSubs >= flair_rules.min && totalSubs <= flair_rules.max);
				}

				for (var i = 0; i < allReturns.length; i++) {
					const flairReq = allReturns[i];
					const flairs = config_bot.user_flairs;

					// TODO:
					// Optimise this mess.
					
					if (fitsCriteria(flairReq.totalSubs, flairs.lrn)) { // Check and assign the "Learning" flair
						promiseArr.push(
							giveFlair(flairReq, "", flairs.lrn)
						);
						continue;
					}
					if (fitsCriteria(flairReq.totalSubs, flairs.nov)) { // Check and assign the "Novice" flair
						promiseArr.push(
							giveFlair(flairReq, "", flairs.nov)
						);
						continue;
					}
					if (fitsCriteria(flairReq.totalSubs, flairs.int)) { // Check and assign the "Intermediate" flair
						promiseArr.push(
							giveFlair(flairReq, "", flairs.int)
						);
						continue;
					}
					if (fitsCriteria(flairReq.totalSubs, flairs.adv)) { // Check and assign the "Advanced" flair
						promiseArr.push(
							giveFlair(flairReq, "", flairs.adv)
						);
						continue;
					}
					if (fitsCriteria(flairReq.totalSubs, flairs.exp)) { // Check and assign the "Expert" flair
						promiseArr.push(
							giveFlair(flairReq, "", flairs.exp)
						);
						continue;
					}
					promiseArr.push( // If they don't fit the criteria for any flair, remove their current flair
						giveFlair(flairReq)
					);
				}

				return Promise.all(promiseArr).then(() => {
					return;
				});
			})
		);

		Promise.all(mainPromises).then((output) => {
			db.close();
			log("Checks finished");
			process.exit();
		});
	}
	update();
}