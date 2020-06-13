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
    await fazerPrimeiraParteDoLogin(page);
    await fazerSegundaParteDoLogin(page);
}

async function fazerPrimeiraParteDoLogin(page) {
    await page.goto(constantes.url);
    await page.waitFor(constantes.botaoDeLoginEmCima);
    await page.click(constantes.botaoDeLoginEmCima);
    await page.waitFor(constantes.botaoDeLoginNoCentro);
    let campoDeLogin = await page.$(constantes.digitarLogin);
    await campoDeLogin.type(user.user);
    let campoDeSenha = await page.$(constantes.digitarSenha);
    await campoDeSenha.type(user.pass);
    return page.click(constantes.botaoDeLoginClicavel);
}

async function fazerSegundaParteDoLogin(page) {
    await page.waitForSelector(constantes.iframeSelector);
    const elementHandle = await page.$(constantes.iframeURL);
    const frame = await elementHandle.contentFrame();
    await frame.waitFor(constantes.campodeEmail);
    await frame.type(constantes.campodeEmail, user.email, { delay: 100 });
    await frame.select(constantes.campoDataNascimento, user.dataNascimento);
    await frame.select(constantes.campomesMesNascimento, user.mesNascimento);
    await frame.select(constantes.campomesAnoNascimento, user.anoNascimento);
    let imagemCaptcha = await frame.$(constantes.imagemCaptcha);
    const base64String = await imagemCaptcha.screenshot({ encoding: "base64" });
    let codigoCaptchaResolvido = await resolvedorDeCaptcha(base64String);
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