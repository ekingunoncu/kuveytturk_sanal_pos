import * as xml2js from 'xml2js';
import * as request from 'request';

export class XmlUtil {

    constructor() {
    }

    parseString = xml2js.parseString;

    sendXmlRequest(url, data, cb) {
        request.post({
                url: url,
                method: "POST",
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: data
            },
            function (error, response) {
                cb(response);
            });
    }

    xmlToJson(xmlStr, cb) {
        if (typeof xmlStr == 'string') {

            const replaced =
                xmlStr
                    .replace(/\%3c/gi, '<')
                    .replace(/\%3f/gi, '?')
                    .replace(/\%3d/gi, '=')
                    .replace(/\%22/gi, '"')
                    .replace(/\%3e/gi, '>')
                    .replace(/\%2f/gi, '/')
                    .replace(/\%3a/gi, ':')
                    .replace(/\%c4%b1/gi, 'i')
                    .replace(/\%c4%9f/gi, 'g')
                    .replace(/\+/gi, ' ')
                    .replace(/\%2b/gi, '+')

            this.parseString(replaced, (err, result) => {
                cb(err, result);
            });
        }
    }

}
