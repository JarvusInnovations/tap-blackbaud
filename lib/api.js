module.exports = ({ subscriptionKey, token }) => require('got').extend({
  headers: {
    Authorization: `Bearer ${token}`,
    'Bb-Api-Subscription-Key': subscriptionKey
  },
  prefixUrl: 'https://api.sky.blackbaud.com/school/v1',
  responseType: 'json',
  resolveBodyOnly: true,
  hooks: {
    beforeRequest: [
      ({ method, url }) => console.error(`${method} ${url}`)
    ]
  }
})
