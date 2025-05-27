import readline from "readline/promises";

export function cli({ clientTokens, currentToken, login, logout, rl }) {
    rl.prompt();

    rl.on('line', (line) => {
        if (line === 'exit') rl.close();
        else {
            switch (line) {
                case 'login':
                    login();
                    rl.prompt();
                    break;
                case 'logout':
                    logout();
                    rl.prompt();
                    break;
                case 'tokens':
                    console.log(clientTokens.get());
                    rl.prompt();
                    break;
            }
        }
    });
}