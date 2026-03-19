## Development

Run the local server:

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

## SEO config

Set these variables in production:

```bash
SITE_URL=https://your-public-domain
GOOGLE_SITE_VERIFICATION=your-search-console-token
```

`SITE_URL` is used for canonical URLs, `robots.txt`, `sitemap.xml`, and structured data.
`GOOGLE_SITE_VERIFICATION` is optional, but useful if you verify the site in Google Search Console.
