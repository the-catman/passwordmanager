# Password manager

# What is this?

This is a nodejs command line password manager. Does not require any additional libraries to work. But you probably want a new version of node.

# How do I use it?

```
node main.js
```

After that, a prompt should show up to guide you through the process.

Note: There is no GUI.

# Are there any things I should know before using this program?

I'm glad you asked! Yes indeed, there are!

* You probably should keep a backup of this file, since anyone can come along and delete it.

* The file is (most likely) safe against attackers trying to get your passwords, since it uses AES-256 CBC.

* If you forget the password, neither you nor me can get your passwords back. They are gone.
    * The 256 in AES-256 means the key is 256 bits long, or 32 bytes. Recovering your passwords means bruteforcing 256 bits, which means trying out 2 ** 256 115792089237316195423570985008687907853269984665640564039457584007913129639936 many combinations. Good luck!
        * Your only hope then would be to wait far into the future, when computers *might* be fast enough to find an AES break. However, this is far unlikely, since it is suggested that at AES-256 can last up to 40-50 years securely.

* If you forget the IV, the first 16 bytes of your message will not be decryptable. The rest, however, will be.

* You probably shouldn't trust this too much.

* After some prompt questions give away the password, the console gets cleared.

* This might not be very secure.

# Issues and pull requests

Pull requests are welcome. Creating issues (github issues - not trying to start a fight huh) are welcome. You may modify this program to suit your needs.

# Just FYI

The default passwords.json.enc has a password `123` and IV `123`. Be sure to try it out! (There's no useful information on there, don't worry!)