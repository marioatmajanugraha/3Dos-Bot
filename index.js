const cfonts = require('cfonts');
const chalk = require('chalk');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
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
            const proxies = proxyFile.split('\n').map(line => line.trim()).filter(line => line);
            if (proxies.length > 0) return proxies;
            console.log(chalk.yellow('⚠️  Proxy file is empty. Continuing without proxy.'));
        }
    } catch (err) {
        console.log(chalk.red('❌  No proxy file found. Please provide a valid proxy.txt.'));
        process.exit(1);
    }
    return [];
};

// Function to get the next proxy in the list (round-robin method)
let proxyIndex = 0;
const getNextProxy = (proxies) => {
    if (proxies.length === 0) return null;
    const proxy = proxies[proxyIndex % proxies.length];
    proxyIndex++;
    return proxy;
};

// Function to create a proxy agent
const getProxyAgent = (proxy) => {
    if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
        console.log(chalk.yellow(`ℹ️  Using HTTP proxy: ${proxy}`));
        return new HttpsProxyAgent(proxy);
    } else if (proxy.startsWith('socks5://')) {
        console.log(chalk.yellow(`ℹ️  Using SOCKS5 proxy: ${proxy}`));
        return new SocksProxyAgent(proxy);
    } else {
        console.log(chalk.red(`❌  Invalid proxy format: ${proxy}`));
        return null;
    }
};

// Function to read Local Secret Code from Api3D.txt
const getLocalSecretCode = () => {
    try {
        const secretCode = fs.readFileSync('Api3D.txt', 'utf8').trim();
        if (!secretCode) throw new Error('Local Secret Code is empty in Api3D.txt');
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
        
        // Pastikan mengambil data dengan benar
        if (response.data && response.data.data && response.data.data.total_points !== undefined) {
            const totalPoints = response.data.data.total_points;
            const status = response.data.status;
            console.log(chalk.green(`✅  Response: total_points: "${totalPoints}", status: "${status}"`));
        } else {
            console.log(chalk.red('❌  Error: Response format changed or total_points is undefined.'));
        }
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log(chalk.red(`❌  Error: Request failed with status code 429`));
        } else {
            console.log(chalk.red(`❌  Error: ${error.message}`));
        }
        throw error;
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
    let proxies = useProxy ? getProxies() : [];

    if (useProxy && proxies.length === 0) {
        console.log(chalk.red('❌  No proxies available. Exiting...'));
        process.exit(1);
    }

    while (true) {
        try {
            const proxy = getNextProxy(proxies);
            const proxyAgent = getProxyAgent(proxy);
            if (proxyAgent) {
                await pingAPI(proxyAgent);
            }
        } catch (error) {
            // Jika ada error 429, ganti proxy
            if (error.response && error.response.status === 429) {
                console.log(chalk.yellow('🔄  Switching proxy...'));
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay 3 detik untuk menghindari error 429
    }
};

main();
