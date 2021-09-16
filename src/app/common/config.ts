
export const API = [
  "https://service.lisk.com/api",
  "https://testnet-service.lisk.com/api"
];

export const EXPLORER = [
  [
    "https://lisk.observer",
    "https://testnet.lisk.observer",
  ],
  [
    "https://liskscan.com",
    "https://testnet.liskscan.com/",
  ]
];

export const SHEMAS = [
  {
    "moduleAssetId": "2:0",
    "moduleAssetName": "token:transfer",
    "schema": {
      "$id": "lisk/transfer-asset",
      "title": "Transfer transaction asset",
      "type": "object",
      "required": [
        "amount",
        "recipientAddress",
        "data"
      ],
      "properties": {
        "amount": {
          "dataType": "uint64",
          "fieldNumber": 1
        },
        "recipientAddress": {
          "dataType": "bytes",
          "fieldNumber": 2,
          "minLength": 20,
          "maxLength": 20
        },
        "data": {
          "dataType": "string",
          "fieldNumber": 3,
          "minLength": 0,
          "maxLength": 64
        }
      }
    }
  }
]