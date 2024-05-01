'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const WebSocket = require('ws');
    const mysql = require('mysql2/promise');
    const { v4: uuidv4 } = require('uuid');
    const wss = new WebSocket.Server({ port:8080 });
    const uId = uuidv4();
    wss.on('connection', function connection(ws) {
      console.log('A new client connected.');

      ws.on('message', async function incoming(message) {
        console.log('received: %s', message);
        
        const connect = strapi.db.config.connection.connection;
        const pool = await mysql.createPool(connect);
        try {
          const conn = await pool.getConnection();
          const [result] = await conn.execute(
            'INSERT INTO message_histories  (uid, message, date) VALUES (?, ?, ?)',
            [uId, message, new Date()]
          );

          console.log('Message stored in message_history:', result);
        } catch (error) {
          console.error(error);
        }

        ws.send("Hi, this is your message: " + message);
      });

      ws.on('close', function close() {
        console.log('The client has disconnected.');
      });
    });

  },
};
