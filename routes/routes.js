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

router.post("/signup", async (req, res, err) => {
  try {
    console.info("\n......POST:/createUser.......\n");
    let { username, password } = req.body;
    let user = await User.create({
      username: username,
      password: password,
    });

    if (user) {
      console.log("\nUser created", user);

      res.statusCode = 201;
      data.message = "Account Create Please login";
      res.redirect("/");
    } else {
      res.statusCode = 500;
      res.send(err);
      console.error(err);
    }
  } catch (error) {
    res.statusCode = 500;
    res.send(errors);
    console.error(error);
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

    let user = await User.findOne({
      where: whereUser,
    });

    //if user exist
    if (user) {
      data.message = "";
      res.statusCode = 202;
      let tweets = await Tweet.findAll({
        include: User,
        order: [["id", "DESC"]],
      });
      let tweetData = { tweets };

      newsFeedData.tweetData = tweetData;
      newsFeedData.userid = user.dataValues.id;
      newsFeedData.name = username;
      newsFeedData.password = password;

      if (newsFeedData) {
        res.statusCode = 200;
        res.render("pages/home", newsFeedData);
      } else {
        data.message = "somethings not right";
        res.statusCode = 500;
        res.send(data.message);
      }
    } else {
      res.statusCode = 500;
      data.message = "Invalid Username or Password";
      res.redirect("/");
    }
  } catch (error) {
    res.statusCode = 500;
    console.error("\n\ncatch error: ", error, "\n\n");
  }
});

//create tweets
router.post("/createTweet", async (req, res) => {
  await getNewsFeeds(req, res);
});

async function getNewsFeeds(req, res) {
  try {
    console.info("\n......POST:/createTweet.......\n");
    let { username, password, content } = req.body;
    console.info("\nreq.body---", req.body);

    let user = await User.findOne({
      where: { username, password },
    });

    console.info("\ncreateTweet user:---", user, "\n");

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
    } else {
      res.statusCode = 404;
      res.send("please login to tweet");
    }
  } catch (error) {
    res.statusCode = 500;
    console.error("\n catch error", error, "\n\r");
  }
}

//#endregion EOF post routes

module.exports = router;
