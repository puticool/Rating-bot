const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const readline = require('readline');
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
            process.stdout.write(`===== Waiting ${i} seconds to continue the loop =====`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.log('', 'info');
    }

    async authenticate(auth) {
        const url = `https://api.ratingtma.com/auth/auth.tma?${auth}`;
        try {
            const response = await axios.post(url, {}, { headers: this.headers });
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
            const response = await axios.get(url, { headers });
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
            const response = await axios.post(url, {}, { headers });
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
            const response = await axios.post(url, payload, { headers });
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
            const response = await axios.post(url, payload, { headers });
            if (response.status === 200 && response.data.response) {
                return { success: true, data: response.data.response };
            } else {
                return { success: false, error: 'Invalid response format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
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

    async processAppTask(token, task, group) {
        try {
            await axios.post('https://api.ratingtma.com/task/task.app',
                { group, task: task.id, action: 'app' },
                { headers: { ...this.headers, Authorization: token } }
            );
            await axios.post('https://api.ratingtma.com/task/task.data',
                { task: task.id },
                { headers: { ...this.headers, Authorization: token } }
            );
            const response = await this.getTaskListByGroup(token, group);
            if (response.success) {
                const updatedTask = response.data[group].tasks.flat().find(t => t.id === task.id);
                
                if (updatedTask && updatedTask.order) {
                    const executeResult = await this.executeTaskByOrder(token, group, updatedTask.order);
                    if (executeResult.success && executeResult.data.result) {
                        const reward = task.item[0]?.count || 'unknown';
                        this.log(`Successfully completed APP task ${task.title} | reward ${reward}`, 'success');
                    } else {
                        this.log(`Unable to complete APP task ${task.title}`, 'error');
                    }
                }
            }
        } catch (error) {
            this.log(`Error processing APP task ${task.id}: ${error.message}`, 'error');
        }
    }

    async processLinkTask(token, task, group) {
        try {
            await axios.post('https://api.ratingtma.com/task/task.link', 
                { group, task: task.id, action: 'link' },
                { headers: { ...this.headers, Authorization: token } }
            );

            await axios.post('https://api.ratingtma.com/task/task.data', 
                { task: task.id },
                { headers: { ...this.headers, Authorization: token } }
            );

            const response = await this.getTaskListByGroup(token, group);

            if (response.success) {
                const updatedTask = response.data[group].tasks.flat().find(t => t.id === task.id);
                
                if (updatedTask && updatedTask.order) {
                    const executeResult = await this.executeTaskByOrder(token, group, updatedTask.order);

                    if (executeResult.success && executeResult.data.result) {
                        const reward = task.item[0]?.count || 'unknown';
                        this.log(`Completed task ${task.title} | reward: ${reward}`, 'success');
                    } else {
                        this.log(`Unable to complete task ${task.title}`, 'error');
                    }
                }
            }
        } catch (error) {
            this.log(`Error processing task ${task.id}: ${error.message}`, 'error');
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
            const response = await axios.get(url, { headers });
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
            const response = await axios.post(url, { changes }, { headers });
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
        const data = fs.readFileSync(dataFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        printLogo();
        const comboInput = await this.promptCombo();

        this.rl.close();
    
        while (true) {
            for (let i = 0; i < data.length; i++) {
                const auth = data[i];
                const userId = JSON.parse(decodeURIComponent(auth.split('user=')[1].split('&')[0])).id;

                console.log(`🔹 ========== Account ${i + 1} | ID: ${userId} ==========`);
                
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
                                this.log(`Combo input successful..score: ${comboResult.score}`, 'success');
                            } else {
                                this.log(`Combo input failed: ${comboResult.error}`, 'error');
                            }
                        } else if (minigameListResult.hasLock) {
                            this.log('Combo Day has already been used today', 'warning');
                    }
                }

                const taskListResult = await this.getTaskListByGroup(token, 'calendar');
                if (taskListResult.success) {
                    const readyTask = taskListResult.data.calendar.tasks[0].find(task => task.status === 'READ');
                    if (readyTask) {
                        this.log(`Found ready Daily Rewards Calendar task. Order: ${readyTask.order}`, 'info');
                        const executeResult = await this.executeTaskByOrder(token, 'calendar', readyTask.order);
                        if (executeResult.success && executeResult.data.result) {
                            this.log('Daily Rewards Calendar completed', 'success');
                        } else {
                            this.log('Unable to complete Daily Rewards Calendar', 'error');
                        }
                    } else {
                        this.log('No Daily Rewards Calendar task ready', 'warning');
                    }
                } else {
                    this.log(`Unable to get task list: ${taskListResult.error}`, 'error');
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
                        this.log(`After spin - Energy: ${energy}, Ticket: ${ticket}`, 'custom');
                    }

                    await this.processAllTaskLists(token);
                } else {
                    this.log(`Unable to get user info: ${userInfoResult.error}`, 'error');
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await this.countdown(86400);
        }
    }
}

const client = new Rating();
client.main().catch(err => {
    client.log(err.message, 'error');
    process.exit(1);
});
