import * as crypto from 'crypto';
import * as CardUtil from 'util/card.util';
import {XmlUtil} from "./util/xml.util";

export class KuveytTurkPayment {

    apiVersion = "1.0.0";
    transactionType = "Sale";
    currencyCode = "0949";
    transactionSecurity = 3;
    installmentCount = 0;
    batchId = 0;
    threeDModelPayGate = "https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelPayGate";
    threeDModelProvisionGate = "https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelProvisionGate";
    password;
    okUrl;
    failUrl;
    merchantId;
    customerId;
    userName;
    merchantOrderId;
    cardUtil;
    xmlUtil;

    constructor(config) {
        if (!config.password) {
            throw "Password can not be undefined!"
        }

        if (!config.merchantId) {
            throw "merchantId can not be undefined!"
        }

        if (!config.merchantOrderId) {
            throw "merchantOrderId can not be undefined!"
        }

        if (!config.okUrl) {
            throw "okUrl can not be undefined!"
        }

        if (!config.failUrl) {
            throw "failUrl can not be undefined!"
        }

        if (!config.userName) {
            throw "userName can not be undefined!"
        }

        this.cardUtil = new CardUtil();
        this.xmlUtil = new XmlUtil();
    }

    pay(card, amount) {
        if (!card) {
            throw "card object can not be undefined!"
        }

        if (!card.cardNumber) {
            throw "cardNumber can not be undefined!"
        }

        if (!card.cardExpireDateYear) {
            throw "cardExpireDateYear can not be undefined!"
        }

        if (!card.cardExpireDateMonth) {
            throw "cardExpireDateMonth can not be undefined!"
        }

        if (!card.cardCVV2) {
            throw "cardExpireDateMonth can not be undefined!"
        }

        if (!card.cardHolderName) {
            throw "cardHolderName can not be undefined!"
        }

        return new Promise((resolve) => {
            let hashedPassword = crypto.createHash('sha1').update(this.password).digest('base64');
            let s = this.merchantId + this.merchantOrderId + amount + this.okUrl + this.failUrl + this.userName + hashedPassword;
            let hashData = crypto.createHash('sha1').update(s).digest('base64');

            let body =
                '<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
                + '<APIVersion>' + this.apiVersion + '</APIVersion>'
                + '<OkUrl>' + this.okUrl + '</OkUrl>'
                + '<FailUrl>' + this.failUrl + '</FailUrl>'
                + '<HashData>' + hashData + '</HashData>'
                + '<MerchantId>' + this.merchantId + '</MerchantId>'
                + '<CustomerId>' + this.customerId + '</CustomerId>'
                + '<UserName>' + this.userName + '</UserName>'
                + '<CardNumber>' + card.cardNumber + '</CardNumber>'
                + '<CardExpireDateYear>' + card.cardExpireDateYear + '</CardExpireDateYear>'
                + '<CardExpireDateMonth>' + card.cardExpireDateMonth + '</CardExpireDateMonth>'
                + '<CardCVV2>' + card.cardCVV2 + '</CardCVV2>'
                + '<CardHolderName>' + card.cardHolderName + '</CardHolderName>'
                + '<CardType>' + this.cardUtil.getType(card.cardNumber) + '</CardType>'
                + '<BatchID>' + this.batchId + '</BatchID>'
                + '<TransactionType>' + this.transactionType + '</TransactionType>'
                + '<InstallmentCount>' + this.installmentCount + '</InstallmentCount>'
                + '<Amount>' + amount + '</Amount>'
                + '<DisplayAmount>' + amount + '</DisplayAmount>'
                + '<CurrencyCode>' + this.currencyCode + '</CurrencyCode>'
                + '<MerchantOrderId>' + this.merchantOrderId + '</MerchantOrderId>'
                + '<TransactionSecurity>' + this.transactionSecurity + '</TransactionSecurity>'
                + '</KuveytTurkVPosMessage>';

            this.xmlUtil.sendXmlRequest(this.threeDModelPayGate, body, function (response) {
                resolve(response.body);
            });
        });
    }

    approve(request) {
        let self = this;
        return new Promise((resolve) => {
            self.xmlUtil.xmlToJson(request['AuthenticationResponse'], function (err, result) {
                if (err) {
                    throw err;
                }

                let data = {
                    ResponseCode: result['VPosTransactionResponseContract']['ResponseCode'],
                    ResponseMessage: result['VPosTransactionResponseContract']['ResponseMessage'],
                    OrderId: result['VPosTransactionResponseContract']['OrderId'],
                    MerchantOrderId: result['VPosTransactionResponseContract']['MerchantOrderId'][0],
                    CustomerId: result['VPosTransactionResponseContract']['VPosMessage'][0]['CustomerId'],
                    MD: result['VPosTransactionResponseContract']['MD'][0],
                    Amount: result['VPosTransactionResponseContract']['VPosMessage'][0]['Amount'][0],
                    HashData: result['VPosTransactionResponseContract']['HashData'],
                };

                let hashedPassword = crypto.createHash('sha1').update(self.password).digest('base64');
                let s = self.merchantId + self.merchantOrderId + data.Amount + self.userName + hashedPassword;
                let hashResult = crypto.createHash('sha1').update(s).digest('base64');

                let body =
                    '<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance\' xmlns:xsd=\'http://www.w3.org/2001/XMLSchema">'
                    + '<APIVersion>1.0.0</APIVersion>'
                    + '<HashData>' + hashResult + '</HashData>'
                    + '<MerchantId>' + self.merchantId + '</MerchantId>'
                    + '<CustomerId>' + self.customerId + '</CustomerId>'
                    + '<UserName>' + self.userName + '</UserName>'
                    + '<TransactionType>' + self.transactionType + '</TransactionType>'
                    + '<InstallmentCount>' + self.installmentCount + '</InstallmentCount>'
                    + '<CurrencyCode>' + self.currencyCode + '</CurrencyCode>'
                    + '<Amount>' + data.Amount + '</Amount>'
                    + '<MerchantOrderId>' + data.MerchantOrderId + '</MerchantOrderId>'
                    + '<TransactionSecurity>' + self.transactionSecurity + '</TransactionSecurity>'
                    + '<KuveytTurkVPosAdditionalData>'
                    + '<AdditionalData>'
                    + '<Key>MD</Key>'
                    + '<Data>' + data.MD + '</Data>'
                    + '</AdditionalData>'
                    + '</KuveytTurkVPosAdditionalData>'
                    + '</KuveytTurkVPosMessage>';

                self.xmlUtil.sendXmlRequest(self.threeDModelProvisionGate, body, function (resp) {
                    self.xmlUtil.xmlToJson(resp.body, function (err, response) {
                        if (!err) {
                            resolve(response);
                        }
                    });
                });
            });
        });
    }
}
