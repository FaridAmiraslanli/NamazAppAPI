require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1); // Exit the application if the connection fails
    });

const prayerTimesSchema = new mongoose.Schema({
  cityId: Number,
  prayerTimes: [
    {
      gregorianDateShort: String,
      fajr: String,
      sunrise: String,
      dhuhr: String,
      asr: String,
      maghrib: String,
      isha: String,
      shapeMoonUrl: String,
      astronomicalSunset: String,
      astronomicalSunrise: String,
      hijriDateShort: String,
      hijriDateShortIso8601: String,
      hijriDateLong: String,
      hijriDateLongIso8601: String,
      qiblaTime: String,
      gregorianDateShortIso8601: String,
      gregorianDateLong: String,
      gregorianDateLongIso8601: String,
      greenwichMeanTimeZone: Number,
    },
  ],
});

const citiesSchema = new mongoose.Schema({
  id: Number,
  code: String,
  name: String,
  country: String,
});

const PrayerTimes = mongoose.model('PrayerTimes', prayerTimesSchema, 'prayerTimes');
const City = mongoose.model('City', citiesSchema, 'cities');

app.get('/prayer-times', async (req, res) => {
    const { date, cityId } = req.query;
  
    if (!date || !cityId) {
      return res.status(400).json({ error: 'Date and cityId are required' });
    }
  
    try {
      const prayerData = await PrayerTimes.findOne(
        { cityId: parseInt(cityId) },
        { prayerTimes: { $elemMatch: { gregorianDateShort: date } } } 
      );

      console.log('prayerData', prayerData);
  
      if (!prayerData || !prayerData.prayerTimes || prayerData.prayerTimes.length === 0) {
        return res.status(404).json({ error: 'Prayer times not found for the given date' });
      }
  
      res.json(prayerData.prayerTimes[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/cities", async (req, res) => {

    const { countryName } = req.query;

    console.log('countryName', countryName);
    try {
      const citiesByCountry = await City.find(
          { country: countryName }
      );

      res.json(citiesByCountry);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});