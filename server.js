const express = require("express");
const url_model = require("./models/shorturl.js"); // Ensure this path and filename are correct
const mongoose = require("mongoose");
const app = express();
const dotenv = require('dotenv').config()
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(`${process.env.MONGO_URL}`
   ,{ useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.error('DB connection error:', err.message);
  });

// Routes
app.get("/", async (req, res) => {
    try {
        const urlLists = await url_model.find();
      res.render("index", { shorturls: urlLists });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.post("/shorturls", async (req, res) => {
  try {
    await url_model.create({ full: req.body.fullUrl });
    res.redirect("/");
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get("/:shorturl", async (req, res) => {
  try {
    const shorturl = await url_model.findOne({ short: req.params.shorturl });
    if (!shorturl) return res.sendStatus(404);

    shorturl.clicks++;
    await shorturl.save();

    res.redirect(shorturl.full);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.post("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteAction = await url_model.findOneAndDelete({ _id: id });
    if (!deleteAction) return res.sendStatus(404);

    res.redirect("/");
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.listen(`${process.env.PORT}`, () => {
  console.log(`Server is running on PORT ${process.env.PORT}`);
});
