const cfonts = require('cfonts');
const chalk = require('chalk'); // Pastikan menggunakan chalk@4.x
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs');
const readline = require('readline');

// Banner
cfonts.say('Airdrop 888', {
    font: 'block',
    align: 'center',
    colors: ['green', 'white'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
});

console.log(chalk.blue('Script coded by - @balveerxyz || Ping 3Dos'));

// Function to get random user agent
const getRandomUserAgent = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Function to read proxies from file
const getProxies = () => {
    try {
        const proxyFile = fs.readFileSync('proxy.txt', 'utf8').trim();
        if (proxyFile) {
            return proxyFile.split('\n').map(line => line.trim()).filter(line => line);
        }
    } catch (err) {
        console.log(chalk.yellow('⚠️  No proxy file found. Continuing without proxy.'));
    }
    return [];
};

// Function to get a random proxy agent
const getRandomProxyAgent = (proxies) => {
    if (proxies.length > 0) {
        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
        if (randomProxy.startsWith('http://')) {
            console.log(chalk.yellow(`ℹ️  Using HTTP proxy: ${randomProxy}`));
            return new HttpsProxyAgent(randomProxy);
        } else if (randomProxy.startsWith('socks5://')) {
            console.log(chalk.yellow(`ℹ️  Using SOCKS5 proxy: ${randomProxy}`));
            return new SocksProxyAgent(randomProxy);
        } else {
            console.log(chalk.yellow('⚠️  Unsupported proxy format. Continuing without proxy.'));
        }
    }
    return null;
};

// Function to read Local Secret Code from Api3D.txt
const getLocalSecretCode = () => {
    try {
        const secretCode = fs.readFileSync('Api3D.txt', 'utf8').trim();
        if (!secretCode) {
            throw new Error('Local Secret Code is empty in Api3D.txt');
        }
        return secretCode;
    } catch (err) {
        console.log(chalk.red(`❌  Error reading Api3D.txt: ${err.message}`));
        process.exit(1);
    }
};

// Function to ping the API
const pingAPI = async (proxyAgent) => {
    const localSecretCode = getLocalSecretCode();
    const url = `https://api.dashboard.3dos.io/api/refresh-points/${localSecretCode}`;
    const userAgent = getRandomUserAgent();

    const config = {
        headers: {
            'Connection': 'keep-alive',
            'Host': 'api.dashboard.3dos.io',
            'User-Agent': userAgent,
        },
        httpsAgent: proxyAgent,
    };

    try {
        const response = await axios.get(url, config);
        const { status, data } = response.data;
        const totalPoints = data.total_points;
        console.log(chalk.green(`✅  Response: total_points: "${totalPoints}", status: "${status}"`));
    } catch (error) {
        console.log(chalk.red(`❌  Error: ${error.message}`));
    }
};

// Function to ask user if they want to use a proxy
const askProxyUsage = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('Mau menggunakan proxy? (y/n): ', (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
};

// Main function
const main = async () => {
    const useProxy = await askProxyUsage();
    const proxies = useProxy ? getProxies() : [];

    while (true) {
        const proxyAgent = getRandomProxyAgent(proxies); // Ambil proxy baru setiap ping
        await pingAPI(proxyAgent);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik
    }
};

main();
