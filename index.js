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
});
console.log(chalk.blue('Script coded by - @balveerxyz || Ping 3Dos'));

// Get Random User Agent
const getRandomUserAgent = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Load Proxies
const loadProxies = () => {
    try {
        const data = fs.readFileSync('proxy.txt', 'utf8').trim();
        return data ? data.split('\n').map(line => line.trim()).filter(Boolean) : [];
    } catch {
        return [];
    }
};

// Get Proxy Agent
const getProxyAgent = (proxy) => {
    if (!proxy) return null;
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

// Get Local Secret Codes
const getLocalSecretCodes = () => {
    try {
        const data = fs.readFileSync('Api3D.txt', 'utf8').trim();
        const secrets = data.split('\n').map(line => line.trim()).filter(Boolean);
        console.log(chalk.green(`✅  Loaded ${secrets.length} accounts.`));
        return secrets;
    } catch {
        console.log(chalk.red('❌  Error: Api3D.txt not found or empty.'));
        process.exit(1);
    }
};

// Send Ping API
const sendPing = async (proxy, secret) => {
    const proxyAgent = getProxyAgent(proxy);
    const url = `https://api.dashboard.3dos.io/api/profile/api/${secret}`;
    try {
        const response = await axios.post(url, null, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': '*/*',
                'Origin': 'chrome-extension://lpindahibbkakkdjifonckbhopdoaooe',
            },
            httpsAgent: proxyAgent,
        });
        if (response.data?.status === 'Success') {
            console.log(chalk.green(`✅  Ping successful for ${secret}: Success`));
        } else {
            console.log(chalk.red(`❌  Ping failed for ${secret}.`)); 
        }
    } catch (error) {
        console.log(chalk.red(`❌  Ping error for ${secret}: ${error.message}`));
    }
};

// Refresh Points
const refreshPoints = async (proxy, secret) => {
    const proxyAgent = getProxyAgent(proxy);
    const url = `https://api.dashboard.3dos.io/api/refresh-points/${secret}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
            },
            httpsAgent: proxyAgent,
        });
        if (response.data?.data?.total_points !== undefined) {
            console.log(chalk.green(`✅  Total Points for ${secret}: ${response.data.data.total_points}`));
        } else {
            console.log(chalk.red(`❌  Failed to retrieve total points for ${secret}.`));
        }
    } catch (error) {
        console.log(chalk.red(`❌  Error refreshing points for ${secret}: ${error.message}`));
    }
};

// Ask Proxy Usage
const askProxyUsage = () => {
    return new Promise((resolve) => {
        readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        }).question('Use proxy? (y/n): ', (answer) => {
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
};

// Main Function
const main = async () => {
    const useProxy = await askProxyUsage();
    const proxies = useProxy ? loadProxies() : [];
    const secrets = getLocalSecretCodes();
    if (useProxy && proxies.length === 0) {
        console.log(chalk.red('❌  No proxies found. Exiting...'));
        process.exit(1);
    }
    
    let index = 0;
    setInterval(async () => {
        const proxy = proxies[index % proxies.length];
        for (const secret of secrets) {
            await refreshPoints(proxy, secret);
        }
        index++;
    }, 60000);
    
    console.log(chalk.blue('🔄  Starting infinite ping loop... Press CTRL + C to stop.'));
    while (true) {
        const proxy = proxies[index % proxies.length];
        const secret = secrets[index % secrets.length];
        await sendPing(proxy, secret);
        index++;
    }
};

main();
