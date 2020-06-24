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
    	  "MAIL_HOST": "smtp.zoho.eu",
    	  "MAIL_PORT": 465,
    	  "MAIL_USER": "",
    	  "MAIL_PASS": "",
    	  "MAIL_FROM": "",        
        "BLOCK_ROUTE": "",
        "BLOCK_LIMIT_PER_APP": 900000,
        "BLOCK_LIMIT_PER_USER": 900,
        "RANDOM_COUNT": 10,
        "REDIRECT_URL": "https://twitter.com/isimsizhareket",
        "MONGODB_URI": "mongodb://admin:admin@localhost/trollsavar?authSource=admin"
      }
    }
  ]
}
