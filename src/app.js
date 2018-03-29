var snoowrap = require("snoowrap");
var fs = require("fs");
var mongo = require("mongodb").MongoClient;

const config_oauth = JSON.parse(fs.readFileSync(__dirname + "/config_oauth.json"));
const config_bot = JSON.parse(fs.readFileSync(__dirname + "/config_bot.json"));
const config_db = JSON.parse(fs.readFileSync(__dirname + "/config_db.json"));
config_bot.get_posts = Math.min(config_bot.get_posts, 25);

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
	// Add a post to the checked list and write it to the MongoDB
	function addToChecked(data) {
		if (config_bot.checking) {
			allPosts.push(data);
			db.collection(config_db.col).insertOne(data, function(err, result) {
				checkErrorBlank(err);
				log("Successfully written to database.");
			})
		}
	}
	// Capitalise the string
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};

	// Main function of the bot that is called each loop
	function update() {
		log("Checks started");

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
				if (posts[i].link_flair_text == config_bot.flair_names.mod) {
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
					var canReport = false;
					var reportReason = config_bot.reports.prefix;

					if (allText_sub) { // If the title has a subreddit
						// If the post has a "css mods needed" flair, prepend the comment with the CSS questions
						if (posts[i].link_flair_text == config_bot.flair_names.css) {
							msg += config_bot.cssmods_text;
						}

						var subName = allText_sub[0].replace(/\/?[rR]\//g, "");
						promises.push(
							r.getSubreddit(subName).fetch().then((sub) => {
								var sub_name = sub.display_name;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
								msg += "Subreddit Info (/r/" + sub.display_name + "):\n\n";
								msg += "**Age**: " + formatNum()
							})
						);
					} else if (allText_user) { // If the title has a user
						// Code...
					}
				})();
			}
			// Wait for all subreddits to be processed, then end program
			Promise.all(promises).then(function(values) {
				db.close();
				log("Checks finished");
				process.exit();
			});
		});
	}
	update();
}