const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db");

class Tweet extends Model {}

Tweet.init(
  {
    content: {
      type: DataTypes.STRING,
    },
    timeCreated: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
  },
  {
    sequelize,
    // modelName: "tweet",
  }
);

(async () => {
  await sequelize.sync();
  console.info("Tweet: database connected...\n");
})();

console.log("\noutside sync...\n");

module.exports = Tweet;
