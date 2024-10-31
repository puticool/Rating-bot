const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');
const printLogo = require("./src/logo");

class Rating {
    constructor() {
        this.headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "text/plain",
            "Origin": "https://static.ratingtma.com",
            "Referer": "https://static.ratingtma.com/",
            "Sec-Ch-Ua": '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129", "Microsoft Edge WebView2";v="129"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0"
        };
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.proxyAgent = null;
        this.SPECIAL_TASK_IDS = [];
    }

    log(msg, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        switch(type) {
            case 'success':
                console.log(`[${timestamp}] [*] ${msg}`.green);
                break;
            case 'custom':
                console.log(`[${timestamp}] [*] ${msg}`.magenta);
                break;        
            case 'error':
                console.log(`[${timestamp}] [!] ${msg}`.red);
                break;
            case 'warning':
                console.log(`[${timestamp}] [*] ${msg}`.yellow);
                break;
            default:
                console.log(`[${timestamp}] [*] ${msg}`.blue);
        }
    }

    async countdown(seconds) {
        for (let i = seconds; i >= 0; i--) {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`===== Waiting ${i} seconds to continue loop =====`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.log('', 'info');
    }

    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', { httpsAgent: proxyAgent, timeout: 5000 });
            if (response.status === 200 && response.data && response.data.ip) {
                return response.data.ip;
            } else {
                throw new Error(`Unable to check proxy IP. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error checking proxy IP: ${error.message}`);
        }
    }

    setProxy(proxy) {
        this.proxyAgent = new HttpsProxyAgent(proxy);
    }

    async authenticate(auth) {
        const url = `https://api.ratingtma.com/auth/auth.tma?${auth}`;
        try {
            const response = await axios.post(url, {}, { headers: this.headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response && response.data.response.token) {
                return { success: true, token: response.data.response.token };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getUserInfo(token) {
        const url = "https://api.ratingtma.com/game/user.get";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        try {
            const response = await axios.get(url, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                return { success: true, data: response.data.response };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async spinRoulette(token) {
        const url = "https://api.ratingtma.com/game/minigame.roulette";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        try {
            const response = await axios.post(url, {}, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                return { success: true, data: response.data.response };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTaskListByGroup(token, group, lang = 'vi') {
        const url = "https://api.ratingtma.com/task/task.list";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        const payload = { "group": group, "lang": lang };
        try {
            const response = await axios.post(url, payload, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                return { success: true, data: response.data.response };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async executeTaskByOrder(token, group, order) {
        const url = "https://api.ratingtma.com/task/task.execute";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        const payload = { "group": group, "order": order };
        try {
            const response = await axios.post(url, payload, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                return { success: true, data: response.data.response };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async executeIntegrationTask(token, taskId) {
        const url = "https://api.ratingtma.com/task/task.integration";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        const payload = { "task": taskId };
        try {
            const response = await axios.post(url, payload, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response && response.data.response.result === true) {
                this.log(`Successfully called task.integration for task ID: ${taskId}`, 'success');
                return true;
            } else {
                this.log(`Failed to call task.integration for task ID: ${taskId}: ${JSON.stringify(response.data)}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error integrating task ${taskId}: ${error.message}`, 'error');
            return false;
        }
    }

    async processAppTask(token, task, group) {
        try {
            this.log(`Starting to process APP task: ${task.title} (ID: ${task.id})`, 'info');
            const isSpecialTask = this.SPECIAL_TASK_IDS.includes(task.id);
            if (isSpecialTask) {
                this.log(`Special task: ${task.title} (ID: ${task.id})`, 'info');
                const dataResponse = await axios.post('https://api.ratingtma.com/task/task.data', 
                    { task: task.id },
                    { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
                );
                if (dataResponse.status === 200) {
                    this.log(`Successfully called task.data for special task ${task.title}`, 'success');
                } else {
                    this.log(`Failed to call task.data for special task ${task.title}: ${JSON.stringify(dataResponse.data)}`, 'error');
                    return;
                }
            } else {
                const appResponse = await axios.post('https://api.ratingtma.com/task/task.app', 
                    { group, task: task.id, action: 'app' },
                    { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
                );
                if (appResponse.status === 200 && appResponse.data.success) {
                    this.log(`Successfully called task.app for task ${task.title}`, 'success');
                } else {
                    this.log(`Task failed`, 'error');
                    return;
                }
                const dataResponse = await axios.post('https://api.ratingtma.com/task/task.data', 
                    { task: task.id },
                    { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
                );
                if (dataResponse.status === 200 && dataResponse.data.success) {
                    this.log(`Successfully called task.data for task ${task.title}`, 'success');
                } else {
                    this.log(`Failed to call task.data: ${JSON.stringify(dataResponse.data)}`, 'error');
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            const response = await this.getTaskListByGroup(token, group);
            if (response.success) {
                const updatedTask = response.data[group].tasks.flat().find(t => t.id === task.id);
                if (updatedTask && updatedTask.order) {
                    this.log(`Executing executeTaskByOrder for task ${task.title} with order: ${updatedTask.order}`, 'info');
                    const executeResult = await this.executeTaskByOrder(token, group, updatedTask.order);
                    if (executeResult.success && executeResult.data.result) {
                        const reward = task.item[0]?.count || 'unknown';
                        this.log(`APP task ${task.title} completed successfully | reward ${reward}`, 'success');
                    } else {
                        this.log(`Could not complete task ${task.title}`, 'error');
                    }
                } else {
                    this.log(`Task ${task.title} has no order or updated task not found`, 'warning');
                    const integrationTaskId = 46;
                    const integrationSuccess = await this.executeIntegrationTask(token, integrationTaskId);
                    if (integrationSuccess) {
                        this.log(`Called task.integration for task ID: ${integrationTaskId}. Checking order for task ${task.title}`, 'info');
                        const retryResponse = await this.getTaskListByGroup(token, group);
                        if (retryResponse.success) {
                            const retriedTask = retryResponse.data[group].tasks.flat().find(t => t.id === task.id);
                            if (retriedTask && retriedTask.order) {
                                this.log(`Executing executeTaskByOrder for task ${task.title} with order: ${retriedTask.order}`, 'info');
                                const executeResult = await this.executeTaskByOrder(token, group, retriedTask.order);
                                if (executeResult.success && executeResult.data.result) {
                                    const reward = task.item[0]?.count || 'unknown';
                                    this.log(`APP task ${task.title} completed successfully | reward ${reward}`, 'success');
                                } else {
                                    this.log(`Could not complete task ${task.title} after integration | Error: ${executeResult.error || 'Unknown'}`, 'error');
                                }
                            } else {
                                this.log(`Task ${task.title} still has no order or updated task not found after integration`, 'warning');
                            }
                        } else {
                            this.log(`Could not retrieve task list after integration: ${retryResponse.error}`, 'error');
                        }
                    } else {
                        this.log(`Failed to call task.integration for task ID: ${integrationTaskId}`, 'error');
                    }
                }
            } else {
                this.log(`Could not retrieve task list after processing: ${response.error}`, 'error');
            }
        } catch (error) {
            this.log(`Error processing APP task ${task.id}: ${error.message}`, 'error');
        }
    }

    async processLinkTask(token, task, group) {
        try {
            await axios.post('https://api.ratingtma.com/task/task.link', 
                { group, task: task.id, action: 'link' },
                { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
            );
            await axios.post('https://api.ratingtma.com/task/task.data', 
                { task: task.id },
                { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
            );
            const response = await this.getTaskListByGroup(token, group);
            if (response.success) {
                const updatedTask = response.data[group].tasks.flat().find(t => t.id === task.id);
                if (updatedTask && updatedTask.order) {
                    const executeResult = await this.executeTaskByOrder(token, group, updatedTask.order);
                    if (executeResult.success && executeResult.data.result) {
                        const reward = task.item[0]?.count || 'unknown';
                        this.log(`Successfully completed task ${task.title} | reward ${reward}`, 'success');
                    } else {
                        this.log(`Could not complete task ${task.title}`, 'error');
                    }
                }
            }
        } catch (error) {
            this.log(`Error processing task ${task.id}: ${error.message}`, 'error');
        }
    }
    async executeIntegrationTask(token, taskId) {
        try {
            this.log(`Gọi task.integration cho nhiệm vụ ID: ${taskId}`, 'info');
            const integrationResponse = await axios.post('https://api.ratingtma.com/task/task.integration',
                { task: taskId },
                { headers: { ...this.headers, Authorization: token }, httpsAgent: this.proxyAgent, timeout: 10000 }
            );
            // Kiểm tra response.response.result thay vì response.success
            if (integrationResponse.status === 200 && integrationResponse.data.response && integrationResponse.data.response.result === true) {
                this.log(`Gọi task.integration thành công cho nhiệm vụ ID: ${taskId}`, 'success');
                return true;
            } else {
                this.log(`Gọi task.integration không thành công cho nhiệm vụ ID: ${taskId}: ${JSON.stringify(integrationResponse.data)}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error integrating task ${taskId}: ${error.message}`, 'error');
            return false;
        }
    }
    async processAllTaskLists(token) {
        const groups = ['daily', 'partners', 'monthly', 'main'];
        const lang = 'vi';
        for (const group of groups) {
            try {
                const response = await this.getTaskListByGroup(token, group, lang);
                if (response.success) {
                    const tasks = response.data[group]?.tasks.flat() || [];
                    const openTasks = tasks.filter(task => task.status === 'OPEN');
                    this.log(`Open tasks for ${group}:`, 'info');
                    openTasks.forEach(task => this.log(`- ${task.title} (ID: ${task.id}) [Type: ${task.type}]`, 'custom'));
                    for (const task of openTasks) {
                        if (task.type && task.type.startsWith('app_')) {
                            await this.processAppTask(token, task, group);
                        } else if (task.action === 'link') {
                            await this.processLinkTask(token, task, group);
                        }
                    }
                } else {
                    this.log(`Failed to get tasks for ${group}: ${response.error}`, 'error');
                }
            } catch (error) {
                this.log(`Error processing ${group} tasks: ${error.message}`, 'error');
            }
        }
    }

    async checkMinigameList(token) {
        const url = "https://api.ratingtma.com/game/minigame.list?force_execut=true";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        try {
            const response = await axios.get(url, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                const comboDay = response.data.response.find(game => game.key === 'combo_day');
                return { success: true, hasLock: comboDay?.lock !== undefined };
            }
            return { success: false, error: 'Invalid response format' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async submitCombo(token, combo) {
        const url = "https://api.ratingtma.com/game/minigame.combo";
        const headers = { 
            ...this.headers, 
            "Authorization": token,
            "Content-Hello": Math.random().toString(),
            "Content-Id": Math.random().toString()
        };
        const changes = combo.split(',').map(item => item.trim());
        try {
            const response = await axios.post(url, { changes }, { headers, httpsAgent: this.proxyAgent, timeout: 10000 });
            if (response.status === 200 && response.data.response) {
                return { success: true, score: response.data.response.score };
            }
            return { success: false, error: 'Invalid response format' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async promptCombo() {
        return new Promise((resolve) => {
            this.rl.question('Enter today\'s combo code (e.g., strawberry,orange,watermelon): ', (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async main() {
        const dataFile = path.join(__dirname, 'data.txt');
        const proxyFile = path.join(__dirname, 'proxy.txt');
        const data = fs.readFileSync(dataFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        const proxyData = fs.readFileSync(proxyFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        printLogo();
        if (data.length !== proxyData.length) {
            this.log(`Number of proxies (${proxyData.length}) does not match number of accounts (${data.length})`, 'error');
            process.exit(1);
        }
        const comboInput = await this.promptCombo();
        this.rl.close();

        while (true) {
            for (let i = 0; i < data.length; i++) {
                const auth = data[i];
                const proxy = proxyData[i];
                let userId;
                try {
                    userId = JSON.parse(decodeURIComponent(auth.split('user=')[1].split('&')[0])).id;
                } catch (error) {
                    this.log(`Error parsing user ID from line ${i + 1}: ${error.message}`, 'error');
                    continue;
                }
                let proxyIP;
                try {
                    proxyIP = await this.checkProxyIP(proxy);
                } catch (error) {
                    this.log(`Proxy for account ${i + 1} | ID: ${userId} error: ${error.message}`, 'error');
                    continue;
                }
                this.setProxy(proxy);
                this.log(`🔹 ========== Account ${i + 1} | ID: ${userId} | Proxy IP: ${proxyIP} ==========`, 'info');
                this.log(`Authenticating account ${userId}...`, 'info');
                const authResult = await this.authenticate(auth);
                if (!authResult.success) {
                    this.log(`Authentication failed! ${authResult.error}`, 'error');
                    continue;
                }
                const token = authResult.token;
                this.log('Authentication successful!', 'success');
                if (comboInput) {
                    const minigameListResult = await this.checkMinigameList(token);
                    if (minigameListResult.success && !minigameListResult.hasLock) {
                        const comboResult = await this.submitCombo(token, comboInput);
                        if (comboResult.success) {
                            this.log(`Combo submitted successfully...score: ${comboResult.score}`, 'success');
                        } else {
                            this.log(`Combo submission failed: ${comboResult.error}`, 'error');
                        }
                    } else if (minigameListResult.hasLock) {
                        this.log('Combo Day has already been used today', 'warning');
                    }
                }
                const taskListResult = await this.getTaskListByGroup(token, 'calendar');
                if (taskListResult.success) {
                    const readyTask = taskListResult.data.calendar.tasks[0].find(task => task.status === 'READ');
                    if (readyTask) {
                        this.log(`Found Daily Rewards Calendar task ready. Order: ${readyTask.order}`, 'info');
                        const executeResult = await this.executeTaskByOrder(token, 'calendar', readyTask.order);
                        if (executeResult.success && executeResult.data.result) {
                            this.log('Daily Rewards Calendar completed', 'success');
                        } else {
                            this.log('Could not complete Daily Rewards Calendar', 'error');
                        }
                    } else {
                        this.log('No Daily Rewards Calendar tasks ready', 'warning');
                    }
                } else {
                    this.log(`Could not retrieve task list: ${taskListResult.error}`, 'error');
                }
                let userInfoResult = await this.getUserInfo(token);
                if (userInfoResult.success) {
                    let energy = userInfoResult.data.balances.find(b => b.key === 'energy').count;
                    let ticket = userInfoResult.data.balances.find(b => b.key === 'ticket').count;
                    this.log(`Energy: ${energy}, Ticket: ${ticket}`, 'custom');
                    while (ticket > 0) {
                        const spinResult = await this.spinRoulette(token);
                        if (spinResult.success) {
                            this.log(`Spin successful, received ${spinResult.data.score} score`, 'success');
                            ticket--;
                        } else {
                            this.log(`Spin failed: ${spinResult.error}`, 'error');
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    userInfoResult = await this.getUserInfo(token);
                    if (userInfoResult.success) {
                        energy = userInfoResult.data.balances.find(b => b.key === 'energy').count;
                        ticket = userInfoResult.data.balances.find(b => b.key === 'ticket').count;
                        this.log(`After spinning - Energy: ${energy}, Ticket: ${ticket}`, 'custom');
                    }
                    await this.processAllTaskLists(token);
                } else {
                    this.log(`Could not retrieve user info: ${userInfoResult.error}`, 'error');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.log('Loop completed. Waiting 24 hours before next run...', 'info');
            await this.countdown(86400); 
        }
    }
}

const client = new Rating();
client.main().catch(err => {
    client.log(err.message, 'error');
    process.exit(1);
});
