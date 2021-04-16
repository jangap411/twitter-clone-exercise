const { Router } = require("express");
const User = require("../models/User");
const Tweet = require("../models/Tweet");
const router = Router();

let data = {
  message: "",
};

let newsFeedData = {
  tweetData: "",
  userid: "",
  name: "",
  password: "",
};

//#region get routes

//index
router.get("/", (req, res) => {
  console.info("\n......GET:/index.......\n");
  res.statusCode = 200;
  res.message = "";
  res.render("index", data);
});

//get create account page
router.get("/signup", (req, res) => {
  console.info("\n......GET:/signup.......\n");
  res.statusCode = 200;
  res.render("pages/signup");
});

//home page
router.get("/home", (req, res) => {
  console.info("\n......GET:/home.......\n");
  res.statusCode = 200;
  res.render("pages/home");
});

//#endregion

//#region Post routes

//create new user --> signup

router.post("/createUser", async (req, res, err) => {
  console.info("\n......POST:/createUser.......\n");
  let { username, password } = req.body;
  let user = await User.create({
    username: username,
    password: password,
  });

  if (user) {
    console.log(user.toJSON());

    res.statusCode = 201;
    data.message = "Account Create Please login";
    res.redirect("/");
  } else {
    console.error(err);
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    console.info("\n......POST:/login.......&& load newsfeeds\n");
    let { username, password } = req.body;
    let whereUser = {
      username: username,
      password: password,
    };

    console.log("login req.body", req.body);

    let user = await User.findOne({
      where: whereUser,
    });

    //if user exist
    if (user) {
      console.log("\nuser ----->", user, "\n");
      console.log("\nuser id ----->", user.dataValues.id, "\n");

      data.message = "";
      res.statusCode = 202;
      let tweets = await Tweet.findAll({
        include: User,
        order: [["id", "DESC"]],
      });
      let tweetData = { tweets };

      // const newsFeedData = {
      //   tweetData,
      //   userid: user.dataValues.id,
      // };

      newsFeedData.tweetData = tweetData;
      newsFeedData.userid = user.dataValues.id;
      newsFeedData.name = username;
      newsFeedData.password = password;
      console.log("\n---->tweetdata raw form", newsFeedData, ".....\n");
      console.log("\n---->tweetdata", JSON.stringify(newsFeedData), "\n");

      if (newsFeedData) {
        res.statusCode = 200;
        console.log("\newsFeedData:====>", newsFeedData);
        // res.render("pages/home", tweetData);
        // res.send("all the tweets");
        res.render("pages/home", newsFeedData);
      } else {
        data.message = "somethings not right";
        res.statusCode = 500;
        res.send(data.message);
      }
    } else {
      res.statusCode = 500;
      // res.send("invalid username or password");
      data.message = "Invalid Username or Password";
      res.redirect("/");
    }
  } catch (error) {
    res.statusCode = 500;
    console.error("\n\ncatch error: ", error, "\n\n");
  }
});

//create tweets

async function getNewsFeeds(req, res) {
  try {
    console.info("\n......POST:/createTweet.......\n");
    let { username, password, content } = req.body;
    console.info("\nreq.body---", req.body);

    let user = await User.findOne({
      where: { username, password },
    });

    console.info("\ncreateTweet user:---", user.toJSON());

    if (user) {
      newsFeedData.userid = user.dataValues.id;
      newsFeedData.name = username;
      newsFeedData.password = password;
      let tweet = await Tweet.create({
        content,
        timeCreated: new Date(),
        UserId: user.id,
      });

      if (tweet) {
        res.statusCode = 202;
        let tweets = await Tweet.findAll({
          include: User,
          order: [["id", "DESC"]],
        });
        let tweetData = { tweets };

        newsFeedData.tweetData = tweetData;
        res.statusCode = 201;
        res.render("pages/home", newsFeedData);
      }
    }
  } catch (error) {
    res.statusCode = 500;
    console.error("\n catch error", error, "\n\r");
  }
}

router.post("/createTweet", async (req, res) => {
  await getNewsFeeds(req, res);
});

router.post("/makeTweets", async (req, res) => {
  console.info("\n............. POST:/makeTweets ..................\n");

  try {
    let tweet = await Tweet.create({
      content: req.body.content,
      timeCreated: new Date(),
      UserId: req.body.UserId,
    });

    console.info("\nnewsData on global:---->", newsFeedData, "\n");

    if (tweet) {
      // res.statusCode = 201;
      res.redirect("pages/home", newsFeedData);
      // res.render("pages/home", newsFeedData);
    } else {
      res.statusCode = 404;
      res.render("pages/home", newsFeedData);
    }
  } catch (error) {
    res.statusCode = 500;
    console.error("\nCatch error POST:/makeTweets:", error, "\n");
  }
});

//#endregion EOF post routes

//#region tests routes

//----- testing the create tweets functions ----
router.get("/maketweets", (req, res) => {
  console.info("\n......GET:/maketweets.......\n");
  res.statusCode = 200;
  res.render("pages/createTweet");
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

//get all tweets
router.get("/tweets", async (req, res) => {
  await getAllTweets(res);
});

async function getAllTweets(res) {
  try {
    console.info("\n......GET:/home/tweets.......\n");
    let tweets = await Tweet.findAll({ include: User });
    let tweetData = { tweets };
    console.log("\n---->tweetdata raw form", tweetData, ".....\n");
    console.log("\n---->tweetdata", JSON.stringify(tweetData), "\n");
    let newsFeeds = JSON.stringify(tweetData); //JSON.parse(tweetData); //;

    if (newsFeeds) {
      res.statusCode = 200;
      console.log("\newsFeed:====>", newsFeeds);
      // res.render("pages/home", tweetData);
      // res.send("all the tweets");
      res.render("pages/tweets", tweetData);
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

//#endregion end of test routes

module.exports = router;
