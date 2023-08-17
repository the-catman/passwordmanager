const { scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { readFileSync, writeFileSync, existsSync } = require('fs');

const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

const defaultFileName = "passwords.json.enc";

const algorithm = 'aes-256-cbc';

async function decrypt(data, a, k, i)
{
    return new Promise((resolve) => {
        let decrypted = '';
        const cipher = createDecipheriv(a, k, i);
        cipher.on('readable', () => {
            let chunk;
            while (null !== (chunk = cipher.read()))
            {
                decrypted += chunk.toString('utf8');
            }
          });
        cipher.on('end', () => {
            resolve(decrypted);
        });
        cipher.write(data, 'hex');
        cipher.end();
    });
}

async function encrypt(data, a, k, i)
{
    return new Promise((resolve) => {
        let encrypted = '';
        const cipher = createCipheriv(a, k, i);
        cipher.setEncoding('hex');
        cipher.on('data', (chunk) => encrypted += chunk);
        cipher.on('end', () => {
            resolve(encrypted);
        });
        cipher.write(data);
        cipher.end();
    });
}

async function writeToFile(decryptedFileData, key, iv)
{
    writeFileSync(values.fileName, (await encrypt(JSON.stringify(decryptedFileData), algorithm, key, iv)));
}

async function promptYes(data)
{
    return ((await prompt(data + " (write yes)\n")).toLowerCase() === "yes");
}

let values = {};

(async () => {
    let modes = ['get', 'set', 'delete', 'getAll', 'changeEncryptionKeyAndIV'];
    console.log(`TERMINOLOGY:
"key": Used to encrypt/decrypt the database.
"IV": Abbreviation for Initialization Vector. Used in the encryption process of CBC (Cipher-Block-Chaining) mode of AES (the Advanced Encryption Standard).
"password": A password used to log into a website or something.
"field" or "password name": The unique name of a password. For example, logging into your bank account, you'd set the name to be "my bank account" or something similar.
"mode of operation": Not to be confused with the mode of operation of AES. It is what you want your program to do (like set a key, or get a key, etc). This is divided into ${modes.length} modes:
    \`get\`: Gets a value - by field - from the database. Returns field:password.
    \`set\`: Sets (creates or updates) a value - by field - to the database.
    \`delete\`: Deletes a value - by field - from the database.
    \`getAll\`: Gets all values from the database. For each line, returns field:password.
    \`changeEncryptionKeyAndIV\`: As the name suggests, changes both the key and the IV to the new values.
    `);
    while(true)
    {
        values = {};
        if(await promptYes("Get started? Warning, this will clear the console."))
        {
            console.clear();
            values.password = await prompt("Enter the key: ");
            console.clear();
            values.iv = await prompt("Enter the IV: ");
            console.clear();
            let modeofoperation;
            while(true)
            {
                modeofoperation = await prompt(`Enter the mode of operation (${JSON.stringify(modes).replaceAll('[', '').replaceAll('"', '').replaceAll(']', '').replaceAll(",", ", ")}): `);
                if(modes.includes(modeofoperation))
                {
                    break;
                }
                else
                {
                    console.log("Incorrect mode of operation!");
                }
            }
            values[modeofoperation] = true;
            switch(modeofoperation)
            {
                case 'changeEncryptionKeyAndIV':
                    {
                        values.newKey = await prompt("Enter the new key: ");
                        values.newIV = await prompt("Enter the new IV: ");
                        break;
                    }
                case 'set':
                    {
                        values.newPass = await prompt("Enter the new password: ");
                        console.clear();
                    }
                case 'delete':
                case 'get':
                    {
                        values.field = await prompt("Enter the field/password name: ");
                        break;
                    }
            }
            if(await promptYes("Would you like to change the default file?"))
            {
                values.fileName = await prompt("Enter the new file name: ");
            }
            else
            {
                values.fileName = defaultFileName;
            }
        }
        else
        {
            console.log("Ok.");
            process.exit();
        }

        const password = values.password;
        const ivText = values.iv;
        // First, we'll generate the key. The key length is dependent on the algorithm.
        // In this case for aes256, it is 32 bytes (256 bits).
        let key = scryptSync(password, 'salt', 32);
        let iv = scryptSync(ivText, 'salt', 16);

        let encryptedFileData;
        if(existsSync(values.fileName))
        {
            encryptedFileData = readFileSync(values.fileName, { encoding: "utf-8" });
        }
        else
        {
            console.log("File not found, creating...");
            encryptedFileData = await encrypt(JSON.stringify({}), algorithm, key, iv);
            writeFileSync(values.fileName, encryptedFileData);
            console.log("Created file.");
        }

        let decryptedFileData = await decrypt(encryptedFileData, algorithm, key, iv)
        try
        {
            decryptedFileData = JSON.parse(decryptedFileData);  
        }
        catch (err)
        {
            throw `\`JSON.parse\` failed. Maybe your key or IV was incorrect?\nDecrypted file data: ${decryptedFileData}`;
        }

        if(values.get)
        {
            console.log(`Getting entry ${values.field}...`);
            if(decryptedFileData[values.field])
            {
                console.log(`Found password! ${values.field + ":" + decryptedFileData[values.field]}`);
            }
            else
            {
                console.log(`No value found for entry ${values.field}`);
            }
        }

        if(values.set)
        {
            if(decryptedFileData[values.field])
            {
                if(await promptYes(`Warning! Found an existing entry for ${values.field}! Would you like to overwrite it?`))
                {
                    console.log(`Modifying entry ${values.field}`);
                    decryptedFileData[values.field] = values.newPass;
                    await writeToFile(decryptedFileData, key, iv);
                    console.log(`Successfully modified entry ${values.field}`);
                }
                else
                {
                    console.log(`Cancelled overwriting`);
                }
            }
            else
            {
                console.log(`Adding new entry ${values.field}`);
                decryptedFileData[values.field] = values.newPass;
                await writeToFile(decryptedFileData, key, iv);
                console.log(`Successfully wrote a new entry ${values.field}`);
            }
        }

        if(values.delete)
        {
            if(decryptedFileData[values.field])
            {
                if(await promptYes(`Are you ABSOLUTELY sure you want to delete ${values.field}?`))
                {
                    console.log(`Deleting entry ${values.field}`);
                    delete decryptedFileData[values.field];
                    await writeToFile(decryptedFileData, key, iv);
                    console.log(`Successfully deleted entry ${values.field}`);
                }
                else
                {
                    console.log(`Cancelled deletion`);
                }
            }
            else
            {
                console.log(`No entry found for ${values.field}`);
            }
        }

        if(values.getAll)
        {
            if(await promptYes(`Are you ABSOLUTELY sure you want to get the entire database?`))
            {
                Object.entries(decryptedFileData).forEach((entry) => {
                    console.log(entry.join(":"))
                })
            }
        }

        if(values.changeEncryptionKeyAndIV)
        {
            if(await promptYes(`WARNING: THIS WILL CHANGE THE FILE'S ENCRYPTION KEY. BE SURE TO HAVE A BACKUP INCASE THINGS GO WRONG.\nARE YOU ABSOLUTELY SURE YOU WANT TO PROCEED?`))
            {
                if(await promptYes(`No, seriously, are you ABSOLUTELY sure?`))
                {
                    console.log("Changing file's encryption key and IV.");
                    let newkey = scryptSync(values.newKey, 'salt', 32);
                    let newiv = scryptSync(values.newIV, 'salt', 16);
                    writeFileSync(values.fileName, await encrypt(decryptedFileData, algorithm, newkey, newiv));
                    console.log("Changed file's encryption key and IV");
                }
            }
        }
    }
})();