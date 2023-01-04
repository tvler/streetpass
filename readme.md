<img width="550" alt="Screenshot 2023-01-03 at 9 53 28 PM" src="https://user-images.githubusercontent.com/4934193/210492726-c8f29135-256a-4c1a-a1b7-9b3d0f64dbc8.png">

_Coming soon to chrome web store._

# StreetPass for Mastodon

StreetPass is a user discovery tool for Mastodon, generated from the websites you visit and built on open web identity standards.

StreetPass works by parsing the websites you visit and looking for any `rel="me"` links that link to a Mastodon account. If it finds one, it saves that profile to your StreetPass list. No special recommendation algorithms!

StreetPass is built off of the concept of [link verification](https://docs.joinmastodon.org/user/profile/#verification) on Mastodon. This feature allows profile links to get a "verified" checkmark, but only if the page has a link _back_ to that Mastodon profile using the [`rel="me"`](https://microformats.org/wiki/rel-me) identity verification web standard. This means that a large amount of high-quality users will have this tag on their site, ready for StreetPass to discover for you.
