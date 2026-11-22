# Northstar storefront

A responsive, portfolio-ready React storefront for the e-commerce microservices project. It currently uses local mock data and makes no backend requests.

## Run locally

```bash
npm install
npm run dev
```

Create an optimized build with `npm run build`.

## Backend integration later

The data boundary lives in `src/services/storefrontService.js`. Replace that mock implementation with gateway calls when the backend is ready to connect; the UI components do not need to know where the data comes from.
