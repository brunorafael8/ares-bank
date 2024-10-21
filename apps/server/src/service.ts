import { parseStringPromise } from "xml2js";
import fetch from "node-fetch";
import * as retry from "retry";

const retryOptions = {
  retries: 7,
  factor: 2,
  minTimeout: 50000,
  maxTimeout: 50000,
  statusCode: [429, 500, 502, 503, 504],
};

const retryOperation = retry.operation(retryOptions);

const endpoint = `https://test.netstorming.net/kalima/call.php`;

export const fetchNetstorming = async (
  type: string,
  params?: Record<string, Record<string, string>>[],
  queryParams?: string
) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
  let paramsXML = "";

  if (params && params.length > 0 && Object.keys(params[0]).length > 0) {
    paramsXML = params
      .map((param) => {
        const key = Object.keys(param)[0];
        if (typeof param[key] === "object") {
          const valueKey = Object.keys(param[key])[0];
          const value = param[key][valueKey];
          return `<${key} ${valueKey}="${value}" />`;
        }
        return `<${key}>${param[key]}</${key}>`;
      })
      .join(" ");
  }

  const requestXML = `
    <?xml version="1.0" encoding="UTF-8"?>
    <envelope>
      <header>
        <actor>travels</actor>
        <user>xmluser</user>
        <password>travelsxml</password>
        <version>1.6.3</version>
        <timestamp>${timestamp}</timestamp>
      </header>
      <query type="${type}" product="hotel">
        ${paramsXML && paramsXML}
        ${queryParams}
      </query>
    </envelope>
  `;
  console.log(requestXML, 'requestXML dwd');
  
  return new Promise((resolve, reject) => {
    retryOperation.attempt(async function (currentAttempt) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: requestXML,
        });

        const result = await response.text();
        console.log(result, 'result');
        const data = await parseStringPromise(result);

        const responseData = data.envelope?.response[0];
        if (responseData?.hotels && type !== "availability") {
          resolve(responseData.hotels[0].hotel);
        }

        resolve(responseData);
      } catch (error) {
        if (retryOperation.retry(error)) {
          console.log(`Retry attempt: ${currentAttempt}`);
          reject(error);
          return;
        }
        console.error(`Maximum number of retries reached. Error: ${error}`);
        reject(error);
      }
    });
  });
};
