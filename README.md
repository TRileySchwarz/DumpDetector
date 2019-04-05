# DumpDetector

When the price of a crypto currency tanks as a result of someone dumps a significant amount of tokens can
result in devastating losses. If only there was a way to know a dump was coming beforehand...

Using a combination of the Etherscan API and a database of Internal Binance Wallets we are able to monitor token 
transfers before they are available for trade on Binance. Thereby giving us the chance the liquidate assets before 
the price drops. ie front-running

![alt text](/captures/TelegramChannelCapture.png?raw=true)

## Heuristic 
Most significant holders are likely to hold their tokens off of exchange in a cold wallet. 
Before they are able to sell said funds on an exchange like Binance, they must transfer them to their internal wallet.
Whereby after 36 confirmations(new blocks) they are available for trade. This means that there is theoretically a 36 block
window, roughly 5 minutes depending on the network congestion, where it is public knowledge how many tokens have been sent to exchange. 
It is in the traders best interest to reduce the amount of time between sending to exchange and selling off the tokens
as to avoid any potential front-running. 

There are a few things that we need to resolve before we can figure this out.

- Firstly, we need a database of internal Binance Wallets. 

- Secondly, we need a tool that monitors ERC20 transfers and provides notifications when there is incoming transactions to 
said internal Binance Wallets.

## Solution
The following project demonstrates my approach to solving this problem.

This tool consists of 2 main funtionalities. First up is the 'DatabaseBuilder.js'. We must parse through every block since 
Binance's inception to determine all of the internal wallets. This is at the time of writing roughly 3 million blocks.
We know that there is two types of transfers into the Binance Internal Hot wallets. Either it's an internal Binance 
generated wallet, or someone who accidentally sent their funds directly to Binance. The latter results in a loss of your 
funds. We will therefore assume that every address sending tokens to the Binance Wallets, is therefore an internal wallet.

By parsing all blocks and looking at every ERC20 token transfer event, we can single out the transactions where the 
'to' address is one of Binance's Hot Wallets. This process takes approximately 2 days to build up the database while 
running 4 clients doing 500k intervals of blocks each, simultaneously. 

** The Etherscan API has a max return size of 1000 values. This means that there are certain blocks that contain over 
1000 transactions, which will result in a non-significant amount of wallets being missed. The level of accuracy is still
very high as there are only a handful of blocks which exceed the transaction limit. 

The second tool in the project is the actual transaction parser. This tool is responsible for monitoring all ERC20 
transfer transactions. If one of the events is a transfer to an internal Binanace wallet, we record the transaction 
into a rolling 36 window and broadcast the notification to a dedicated Telegram Channel and a the console where the
program is running. 

** While parsing internal wallet addresses, we also store token transfer information so we are able to pull this data to 
later run statistical analysis on how accurate these signals can be. When developing a specific method for using this data, you can
back test it to prove your strategy. 

## Requirements
I am running following versions of NPM and Node:
   - npm 6.4.1
   - node 10.13.0 

As well as installing MongoDB and running a local DB on default port 20717
 
You will need the channel code and the API code for your personal TelegramChannel '../scripts/TelegramBot.js' line 13

Also need to set the corresponding Telegram API key found in '../src/configs'
 
## Configurations

'../db/TokenDatabase.js' file this is where you define the token transfers you wish to keep track of

'../src/configs.js' contains the configurations for the etherscanApi functionality

'../src/constants.js' contains the constants used inside the tools. such as: Binance hot wallet addresses, event hashes, 
and locators for DB Schema


## Running the Database Builder

First step in running this project is building out the internal wallet database by setting a starting point '../db/lastBlockParsed'
This stores a value that corresponds to the last block parsed. Set this to the block number you wish to start building
the database from. 

This value will be updated as the program runs so that you are able to build out the database in batches, and does not 
require one continuous session.

 ** ensure Mongod is running in its own terminal
 
    $ sh RunDatabaseBuilder.sh
    
    
![DatbaseBuilder](/captures/DatabaseBuilderCapture.gif)



## Running the Transfer Bot


Once you have built up a significant amount of internal Binance Wallets, you can start running this bot. It does not have
a minimum amount of wallets to run. Theoretically you can have it running simultaneously to operating the Database Builder.

If this comes accross new Binance addresses that are not stored as it is parsing transactions, it will add them to the DB.

The Telegram API and Chat ID need to be set for this to push notifications properly to the corresponding Telegram channel.

You will also need your own .env file that contains the following variable...

  TELEGRAM_BOT_API_KEY="Insert your API key here"

 ** ensure Mongod is running in its own terminal
 
    $ sh RunDumpDetector.sh
    
    
 ![alt text](/captures/DumpDetectorCapture.png?raw=true)





## TODO
- Add way to easily turn on and off Telegram bot

- Upload better Gif of DumpDetector Running

- Figure out delay between querying etherscan for blocks

- clean up console vs telegram msgs

- Abstract methods out of DumpDetector

- Add way to get blocks of code using logarithms ie for 100 blocks, then if too many, go 100/2, if too many 100/2/2 etc...
