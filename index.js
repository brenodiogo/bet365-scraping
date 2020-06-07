const puppeteer = require('puppeteer');
const constantes = require('./constantes');
const user = require('./user');
const Client = require('@infosimples/node_two_captcha');

async function operarAutomaticamente() {

    const page = await abrirPaginaNoNavegador();
    const loginFinalizado = await fazerlogin(page);

}

operarAutomaticamente();

async function abrirPaginaNoNavegador() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 10
    });

    return browser.newPage();
}

async function fazerlogin(page) {
    await page.goto(constantes.url);

    await page.waitFor(constantes.botaoDeLoginEmCima);

    await page.click(constantes.botaoDeLoginEmCima);

    await page.waitFor(constantes.botaoDeLoginNoCentro);

    let campoDeLogin = await page.$(constantes.digitarLogin);

    await campoDeLogin.type(user.user);

    let campoDeSenha = await page.$(constantes.digitarSenha);

    await campoDeSenha.type(user.pass);

    await page.click(constantes.botaoDeLoginClicavel);

    console.log('waiting for iframe with form to be ready.');
    await page.waitForSelector('.lp-UserNotificationsPopup_Frame ');
    console.log('iframe is ready. Loading iframe content');

    const elementHandle = await page.$(
        'iframe[src="https://members.bet365.com/members/services/notifications/process"]',
    );
    const frame = await elementHandle.contentFrame();

    console.log('filling form in iframe');
    // console.log(frame);
    await frame.waitFor(constantes.campodeEmail);
    await frame.type(constantes.campodeEmail, user.email, { delay: 100 });
    await frame.select(constantes.campoDataNascimento, user.dataNascimento);
    await frame.select(constantes.campomesMesNascimento, user.mesNascimento);
    await frame.select(constantes.campomesAnoNascimento, user.anoNascimento);

    let imagemCaptcha = await frame.$('#CaptchaCode img');

    const base64String = await imagemCaptcha.screenshot({ encoding: "base64" });

    let codigoCaptchaResolvido = await resolvedorDeCaptcha(base64String);

    console.log(codigoCaptchaResolvido.text);

    await frame.type(constantes.campoCaptcha, codigoCaptchaResolvido.text, { delay: 100 });

    return frame.click(constantes.segundoBotaoDeLoginClicavel);

}

async function resolvedorDeCaptcha(base64CaptchaImage) {
    client = new Client(user.captchaAPI, {
        timeout: 90000,
        polling: 5000,
        throwErrors: false
    });

    return client.decode({
        base64: base64CaptchaImage
    });
}