import { Wallet } from "ethers";
import chalk from 'chalk';
import { HttpsProxyAgent } from 'https-proxy-agent'; 
import fs from 'fs/promises'

const refCode = "yT8O2XkDA";
async function login(address, walletSignature, refCode, agent = null) {
	try {
		const request = await fetch("https://bytenova.ai/api/wallet_login", {
			"headers": {
			  "accept": "application/json, text/plain, */*",
			  "accept-language": "en-US,en;q=0.5",
			  "content-type": "application/x-www-form-urlencoded",
			  "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Herond\";v=\"120\"",
			  "sec-ch-ua-mobile": "?0",
			  "sec-ch-ua-platform": "\"Windows\"",
			  "sec-fetch-dest": "empty",
			  "sec-fetch-mode": "cors",
			  "sec-fetch-site": "same-origin",
			  "sec-gpc": "1",
			  "Referer": "https://bytenova.ai/rewards?invite_code=TFMvLsXpM",
			  "Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": `wallet_signature=${walletSignature}&wallet=${address}&invite_code=${refCode}&full_message=&public_key=&chain_type=BNB`,
			"method": "POST",
			agent
		  });
		const set_cookie = request.headers.get('set-cookie');
		const cookie = set_cookie.split('; ').find(c => c.startsWith('user='))		
		  
		const response = await request.json()
		return { token: response?.data?.access_token, cookie }
	} catch (error) {
		logger(`Lỗi đăng ký tài khoản, ${error.message}`, 'error')
		return { token: null, cookie: null };
	}
}

async function getSignature(privateKey) {
	const wallet = new Wallet(privateKey)
	const message = "You hereby confirm that you are the owner of this connected wallet. This is a safe and gasless transaction to verify your ownership. Signing this message will not give ByteNova permission to make transactions with your wallet."
	const signMessage = await wallet.signMessage(message);
	return signMessage
}

function logger(message, level = 'info') {
	const now = new Date().toISOString();
	const colors = {
			info: chalk.blue,
			warn: chalk.yellow,
			error: chalk.red,
			success: chalk.green,
			debug: chalk.magenta,
	};
	const color = colors[level] || chalk.white;
	console.log(color(`[${now}] [${level.toUpperCase()}]: ${message}`));
}

async function doTaskX(address, cookie, token, agent = null) {
	const idTasks = [8, 9, 10, 11, 12, 14, 15, 16, 17]
	await Promise.all(idTasks.map(async (id) => {
		try {
			await fetch("https://bytenova.ai/api/tweet_refresh", {
				"headers": {
				  "accept": "application/json, text/plain, */*",
				  "accept-language": "en-US,en;q=0.5",
				  "authorization": token,
				  "content-type": "application/x-www-form-urlencoded",
				  "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Herond\";v=\"120\"",
				  "sec-ch-ua-mobile": "?0",
				  "sec-ch-ua-platform": "\"Windows\"",
				  "sec-fetch-dest": "empty",
				  "sec-fetch-mode": "cors",
				  "sec-fetch-site": "same-origin",
				  "sec-gpc": "1",
				  "cookie": cookie,
				  "Referer": "https://bytenova.ai/rewards",
				  "Referrer-Policy": "strict-origin-when-cross-origin"
				},
				"body": `task_id=${id}&wallet=${address}`,
				"method": "POST",
				agent
			})
			logger(`Đã hoàn thành xong task ở ví ${address} với taskId là ${id}`, 'success')
		} catch (error) {
			logger(`Lỗi ở ví ${address}`, 'error')
		}
	}))
}	


async function main() {
	logger("TOOL ĐƯỢC PHÁT TRIỂN BỞI: THIEN THO TRAN", 'warn');
	logger(
	  "Tham gia group facebook để nhận tool mới: https://www.facebook.com/groups/2072702003172443/", 'warn'
	);
	logger("------------------------------------------------------------", 'warn');
	logger("ĐỂ TOOL CHẠY CÓ THỂ ĐƯỢC, YÊU CẦU TÀI KHOẢN ĐÃ CONNECT TỚI X", 'warn');
	await new Promise(resolve => setTimeout(resolve, 5000))
	const walletData = await fs.readFile('wallets.txt', 'utf-8');
	const wallets = walletData.trim().split('\n').map(a => a.trim());
	const proxyData = await fs.readFile('proxies.txt', 'utf-8');
	const proxies = proxyData.trim().split('\n').map(a => a.trim());

	while(true) {
		await Promise.all(wallets.map(async (wallet, i) => {
			const agent = proxies[i] ? new HttpsProxyAgent(proxies[i]) : null;
			const [address, privateKey] = wallet.split(',').map(a => a.trim())
			logger(`Đang thực hiện ví ${address}`, 'warn')
			const signature = await getSignature(privateKey)
			const { token, cookie } = await login(address, signature, refCode, agent)
			if (token) {
				await doTaskX(address, cookie, token, agent)
			} else {
				logger(`Lỗi không đăng nhập được ở ví ${address}`, 'error');
				return;
			}
		}))

		logger(`Chờ 1 ngày để tiếp tục`, 'error');
		await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000))
	}
}

main()
