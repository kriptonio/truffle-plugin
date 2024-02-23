# truffle-plugin

[Kriptonio](https://kriptonio.com/) plugin for [Truffle](https://trufflesuite.com/)

This plugin allows you to upload compiled hardhat smart contract artifacts to Kriptonio. On kriptonio side new smart contract will be created with attached artifacts, which you can afterward deploy and manage via kriptonio.

## Installation

```bash
npm install @kriptonio/truffle-plugin
```

## Setup

Add `@kriptonio/truffle-plugin` to plugins in your `truffle-config.js` file.

```js
plugins: [
  '@kriptonio/truffle-plugin',
],
```

Next, add truffle-plugin config to your `truffle-config.js` file.

### Configuration Options

| option                 | Description                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accessToken (required) | Kriptonio organization level access token. You can find it in your settings page.                                       |
| chainId (required)  | ID of the chain where you want to deploy your smart contract. List of supported blockchain networks with their chain IDs you can find [here](https://docs.kriptonio.com/sdk/introduction/supported-networks).                                      |
| contract (required)    | Smart contract name which you want to upload to kriptonio                                                                                                                   |
| title (optional)        | Title of kriptonio smart contract project to be created. Defaults to contract name.                                                                                          |

Example configuration:

```js
kriptonio: {
  title: 'My Token on Kriptonio',
  contract: 'MyERC20',
  accessToken: '<kriptonio-access-token>',
  chainId: 137,
},
```

## Run

Before running truffle-plugin plugin, run compile.

```bash
truffle compile
```

Now you are ready to upload your smart contract to kriptonio.

```bash
truffle run kriptonio-upload
```
