# Password manager

A simple password manager, written in pure nodejs.

# What is this?

This is a nodejs command line password manager.

It does not require any additional libraries to work, however you probably want a new version of node.

# How do I use it?

```bash
node main.js
```

After that, a prompt should show up to guide you through the process.

Note: There is no GUI.

# Are there any things I should know before using this program?

Yes indeed!

* You probably should keep a backup of this file, since anyone can come along and delete it.

* The file is (most likely) safe against attackers trying to get your passwords, since it uses AES-256 CBC.

* If you forget the password, neither you nor me can get your passwords back. They are gone.
    * The 256 in AES-256 means the key is 256 bits long, or 32 bytes. Recovering your passwords means bruteforcing 256 bits, which means trying out 2 ** 256 = 115792089237316195423570985008687907853269984665640564039457584007913129639936 many combinations. Good luck!
        * Your only hope then would be to wait far into the future, when computers *might* be fast enough to find an AES break. However, this is unlikely, since it is suggested that at AES-256 can last up to 40-50 years securely.

* If you forget the IV, the first 16 bytes of your message will not be decryptable. The rest, however, will be - provided that you know the password.
    * This is why it doesn't make a difference if you publicize the IV or not. Then again, best to keep it secret, because if an attacker does manage to breach your password, at least the first 16 bytes of the file are safe :).

* After some prompt questions, the console gets cleared.

* This might not be very secure.

# Issues and pull requests

Pull requests are welcome. Creating issues (github issues - not trying to start a fight huh) are welcome. You may modify this program to suit your needs.

# Just FYI

The default passwords.json.enc has a password `123` and IV `123`. Be sure to try it out! (There's no useful information on there, don't worry!)