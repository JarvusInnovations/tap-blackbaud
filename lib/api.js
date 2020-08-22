const querystring = require('querystring')

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
  },
  pagination: {
    stackAllItems: false,
    transform: response => response.body.value,
    paginate: (response, allItems, currentItems) => {
      const { next_link: nextLink } = response.body

      if (!nextLink) {
        return false
      }

      return {
        searchParams: querystring.parse(nextLink.substr(nextLink.indexOf('?') + 1))
      }
    }
  }
})
