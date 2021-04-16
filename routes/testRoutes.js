const { Router } = require("express");
const User = require("../models/User");
const Tweet = require("../models/Tweet");
const router = Router();

//----- testing the create tweets functions ----
router.get("/maketweets", (req, res) => {
  console.info("\n......GET:/maketweets.......\n");
  res.statusCode = 200;
  res.render("pages/createTweet");
});

//get all tweets
router.get("/tweets", async (req, res) => {
  await getAllTweets(res);
});

//see the db contents
router.get("/users", async (req, res, err) => {
  try {
    const users = await User.findAll();
    console.log(users);
    res.statusCode = 200;
    res.send(users);
  } catch (error) {
    res.statusCode = 500;
    console.error(err, error);
  }
});

router.get("/dbtweets", async (req, res, err) => {
  try {
    const users = await Tweet.findAll();
    console.log(users);
    res.statusCode = 200;
    res.send(users);
  } catch (error) {
    res.statusCode = 500;
    console.error(err, error);
  }
});

async function getAllTweets(res) {
  try {
    console.info("\n......GET:/home/tweets.......\n");
    let tweets = await Tweet.findAll({ include: User });
    let tweetData = { tweets };
    console.log("\n---->tweetdata raw form", tweetData, ".....\n");
    console.log("\n---->tweetdata", JSON.stringify(tweetData), "\n");

    if (tweetData) {
      res.statusCode = 200;
      // res.render("pages/home", tweetData);
      // res.send("all the tweets");
      res.send(tweetData);
    } else {
      data.message = "somethings not right";
      res.statusCode = 500;
      res.send(data.message);
    }
  } catch (err) {
    res.statusCode = 500;
    console.error("\nCatch error:", err, "\n");
    res.send(err);
  }
}
