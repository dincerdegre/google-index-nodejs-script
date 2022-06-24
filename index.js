const fs = require("fs");
const { google } = require("googleapis");
const fetch = require("node-fetch");
const key = require("./service_account.json");
const filePath = "links.txt";
const firstMessage = "Toplam Satır Sayısı: ";
const qoutaMessage = "Günlük 200 Kotaya Ulaşıldı";
const qouta = 200;
const timerCycle = 1000;

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/indexing"],
  null
);

jwtClient.authorize(function (error, tokens) {
  if (error) {
    console.log(error);
    return;
  }
  fs.readFile(filePath, async function (error, data) {
    if (error) {
      console.log(error);
      return;
    }

    const dataArray = data.toString().split("\n");
    const arrayLength = dataArray.length;
    let i = 0;
    console.log(firstMessage + arrayLength);

    let id = setInterval( async function () {
      if (i >= qouta) {
        console.log(qoutaMessage);
        clearInterval(id);
      } else {
        if (i >= arrayLength) {
          clearInterval(id);
        } else {
          number = i + 1;
          
          const body = {
            url: dataArray[i],
            type: "URL_UPDATED",
          };

          try {
            const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
                method: 'POST',
                body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer '+tokens.access_token, }});
            const data = await response.json();
            const finalData = {url:dataArray[i],...data}
            console.log(finalData);
          } catch (error) {
            const finalData = {url:dataArray[i],...error}
            console.log(finalData);
          }
          i++;
        }
      }
    }, timerCycle);
  });
});
