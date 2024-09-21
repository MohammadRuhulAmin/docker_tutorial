require("dotenv").config();
const mysql = require('mysql2/promise');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const exe_table_name = process.env.MYSQL_TABLE;
const getMaxId = require('./maxid');
const express = require('express');
const e_app = express();

e_app.get('/mutation_barisal/is_up',(req,res)=>{
  res.send("mutation_barisal.case_orders image testing process is up and running");
});

// Connection with max attempts
async function connectToDB() {
  let connectionAttempts = 0;
  const maxAttempts = 9;
  let connection;

  while (connectionAttempts < maxAttempts) {
    try {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });
      console.log('Connected to MySQL database');
      return connection;
    } catch (error) {
      console.error('Error connecting to MySQL:', error);
      connectionAttempts++;
      if (connectionAttempts < maxAttempts) {
        console.log(`Retrying connection in 3 seconds... (Attempt ${connectionAttempts} of ${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error('Failed to connect to MySQL after multiple attempts');
      }
    }
  }
}

// Start with file manual id
async function readStartIdFromFile() {
  try {
    const startId = fs.readFileSync('process.txt', 'utf8').trim();
    return parseInt(startId, 10) || 1; // If file is empty or doesn't contain a number, default to 1
  } catch (error) {
    console.error('Error reading start ID from file:', error);
    return 1; // Default to 1 in case of error
  }
}

async function updateProcessFile(maxId) {
  try {
    fs.writeFileSync('process.txt', `${maxId}`);
  } catch (error) {
    console.error('Error updating process.txt:', error);
  }
}

async function fetchImagesWithRetry(connection, startId, retryCount = 5) {
  let attempts = 0;
  let rows = [];

  while (attempts < retryCount) {
    try {
      const query = `SELECT id, image_path FROM ${exe_table_name} WHERE id >= ? ORDER BY id LIMIT 10`;
      [rows] = await connection.query(query, [startId]);
      break; // Break the loop if successful
    } catch (error) {
      attempts++;
      console.error(`Error fetching images (attempt ${attempts} of ${retryCount}):`, error);
      if (attempts < retryCount) {
        console.log('Retrying after 3 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error('Failed to fetch images after multiple attempts');
      }
    }
  }

  return rows;
}

// Update corrupted images in the database
async function updateCorruptedImages(connection, corruptedIds) {
  if (corruptedIds.length === 0) return;
  const query = `UPDATE ${exe_table_name} SET is_corrupted = 1 WHERE id IN (${corruptedIds.join(',')})`;  try {
    const [results] = await connection.query(query);
    console.log('Updated corrupted images:', results.affectedRows);
  } catch (error) {
    console.error('Error updating corrupted images:', error);
  }
}

async function isCorrupted(url, retries = 9, delay = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        try {
          await sharp(response.data).metadata();
          // If no error is thrown, the image is not corrupted
          return false;
        } catch (sharpError) {
          console.error('Sharp processing error:', sharpError.message);
          return true; // Error during image processing, considering it corrupted
        }
      } catch (axiosError) {
        if (axiosError.response) {
          // Server responded with a status code that falls out of the range of 2xx
          console.error('Axios response error:', axiosError.response.status);
        } else if (axiosError.request) {
          // Request was made but no response was received
          console.error('Axios request error:', axiosError.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Axios error:', axiosError.message);
        }
        
        if (attempt < retries - 1) {
          console.log(`Retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
        } else {
          return true; // Network error after all retries, considering it corrupted
        }
      }
    }
  }

async function checkImagesBatch(connection, startId) {
  const results = await fetchImagesWithRetry(connection, startId);
  if (results.length === 0) return false;

  const maxId = Math.max(...results.map((row) => row.id));

  const imageUrls = results.map((row) => ({
    id: row.id,
    imageUrl: `https://office.land.gov.bd${row.image_path}`
  }));

  const corruptedIds = [];

  for (const { id, imageUrl } of imageUrls) {
    if (await isCorrupted(imageUrl)) {
      corruptedIds.push(id);
    }
  }
  await updateCorruptedImages(connection, corruptedIds);

  await updateProcessFile(maxId);
  return true;
}

async function start() {
  let connection;
  try {
    connection = await connectToDB();

    const startIdFromFile = await readStartIdFromFile();
    const endId = await getMaxId(); // Your specified EndID

    // Process images in batches of 10 until the EndID is reached or exceeded
    let currentStartId = startIdFromFile;
    while (currentStartId < endId && await checkImagesBatch(connection, currentStartId)) {
      currentStartId = await readStartIdFromFile();
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

start();