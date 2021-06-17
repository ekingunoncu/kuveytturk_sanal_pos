export class CardUtil {

    constructor() {
    }

    getType(cardNumber) {
        let amex = new RegExp('^3[47][0-9]{13}$');
        let visa = new RegExp('^4[0-9]{12}(?:[0-9]{3})?$');
        let cup1 = new RegExp('^62[0-9]{14}[0-9]*$');
        let cup2 = new RegExp('^81[0-9]{14}[0-9]*$');

        let mastercard = new RegExp('^5[1-5][0-9]{14}$');
        let mastercard2 = new RegExp('^2[2-7][0-9]{14}$');

        let disco1 = new RegExp('^6011[0-9]{12}[0-9]*$');
        let disco2 = new RegExp('^62[24568][0-9]{13}[0-9]*$');
        let disco3 = new RegExp('^6[45][0-9]{14}[0-9]*$');

        let diners = new RegExp('^3[0689][0-9]{12}[0-9]*$');
        let jcb = new RegExp('^35[0-9]{14}[0-9]*$');
        let troy = new RegExp('^(?:9792|65\\d{2}|36|2205)\\d{12}$');

        if (troy.test(cardNumber)) {
            return 'Troy';
        }

        if (visa.test(cardNumber)) {
            return 'Visa';
        }

        if (amex.test(cardNumber)) {
            return 'AMEX';
        }

        if (mastercard.test(cardNumber) || mastercard2.test(cardNumber)) {
            return 'MasterCard';
        }

        if (disco1.test(cardNumber) || disco2.test(cardNumber) || disco3.test(cardNumber)) {
            return 'DISCOVER';
        }

        if (diners.test(cardNumber)) {
            return 'DINERS';
        }

        if (jcb.test(cardNumber)) {
            return 'JCB';
        }

        if (cup1.test(cardNumber) || cup2.test(cardNumber)) {
            return 'CHINA_UNION_PAY';
        }

        return 'MasterCard';
    }

}
