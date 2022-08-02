export const timeout = (ms = 0) => (
  new Promise((resolve) => { setTimeout(resolve, ms) })
)

export const baselineBalances = () => ([
  {
    balance: '0',
    currency: {
      decimalPlaces: 18,
      image: 'https://sd-global-assets.s3.amazonaws.com/currency/ETH.png',
      isoCode: 'ETH',
      name: 'Ethereum',
      symbol: 'Ξ',
    },
  },
  {
    balance: '0',
    currency: {
      decimalPlaces: 6,
      image: 'https://sd-global-assets.s3.amazonaws.com/currency/USDC.png',
      isoCode: 'USDC',
      name: 'USD Coin',
      symbol: '$',
    },
  },
  {
    balance: '0',
    currency: {
      decimalPlaces: 18,
      image: 'https://sd-global-assets.s3.amazonaws.com/currency/GOG.png',
      isoCode: 'GOG',
      name: 'Guild of Guardians',
      symbol: null,
    },
  },
])