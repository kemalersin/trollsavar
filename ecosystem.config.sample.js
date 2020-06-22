module.exports = {
  apps: [
    {
      name: "trollsavar",
      script: "./server/app.js",
      watch: true,
      env_production: {
        "PORT": 8080,
        "NODE_ENV": "production",
        "DOMAIN": "http://localhost",
        "SESSION_SECRET": "",
        "TWITTER_ID": "",
        "TWITTER_SECRET": "",
        "TWITTER_MASTER": "",
        "TWITTER_ACCESS_TOKEN": "",
        "TWITTER_TOKEN_SECRET": "",
        "BLOCK_ROUTE": "",
        "BLOCK_LIMIT_PER_APP": 900000,
        "BLOCK_LIMIT_PER_USER": 900,
        "REDIRECT_URL": "https://twitter.com/isimsizhareket",
        "MONGODB_URI": "mongodb://admin:admin@localhost/trollsavar?authSource=admin"
      }
    }
  ]
}
