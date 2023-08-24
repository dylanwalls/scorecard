const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use port 3000 by default, or use the PORT environment variable if available.
const sql = require('mssql');
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');

const dbConfig = {
    server: 'bitpropscorecard.database.windows.net',
    database: 'scorecard',
    options: {
      encrypt: true,
    },
  };



// Define a route to display your data (replace 'yourTableName' with your table name).
app.get('/', async (req, res) => {
    try {
      // Obtain the Azure AD access token
      const tokenResponse = await msRestNodeAuth.loginWithServicePrincipalSecret(
        '2b3daf27-4502-4aac-a1df-5581a7ab5b81', // Replace with your Azure AD application's client ID.
        'jkK8Q~J2N3t.NfyMMBCS7llo~MPkHaLZCvbd1ayy', // Replace with your Azure AD application's client secret.
        'da21407b-7b53-4d35-ba23-9bbd86d9f76d' // Replace with your Azure AD tenant ID.
      );
  
      const accessToken = tokenResponse.accessToken;
      console.log('Access Token:', accessToken);

  
      // Use the access token for database connection
      const connection = new sql.ConnectionPool({
        ...dbConfig,
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: accessToken,
          },
        },
      });

      await connection.connect();
      const request = new sql.Request(connection);
      const result = await request.query('SELECT * FROM Employee'); // Replace 'Employee' with your table name.
      res.json(result.recordset);
      await connection.close();
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    }
  });
  
  // Start the server.
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });





// const config = {
//     server: 'bitpropscorecard.database.windows.net',
//     database: 'scorecard',
//     authentication: {
//       type: 'azure-active-directory-access-token',
//       options: {
//         token: {
//           getResourceIdentity: 'https://database.windows.net/',
//           // You can use managed identity or provide client ID and client secret.
//           clientId: '2b3daf27-4502-4aac-a1df-5581a7ab5b81', // Replace with your Azure AD application's client ID.
//           clientSecret: 'jkK8Q~J2N3t.NfyMMBCS7llo~MPkHaLZCvbd1ayy', // Replace with your Azure AD application's client secret.
//         },
//       },
//     },
//     options: {
//       encrypt: true,
//     },
//   };
  
//   // Connect to the database using Azure AD authentication.
//   sql.connect(config)
//     .then(() => {
//       console.log('Connected to the database');
//     })
//     .catch((err) => {
//       console.error('Error connecting to the database:', err);
//     });
  