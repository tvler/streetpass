# StreetPass for Mastodon

StreetPass is a user discovery tool for Mastodon, generated from the websites you visit and built on open web identity standards.

StreetPass is built off of the concept of [link verification](https://docs.joinmastodon.org/user/profile/#verification) on Mastodon. This feature allows profile links to get a "verified" checkmark, but only if the page has a link back to that Mastodon profile using the [`rel="me"`](https://docs.joinmastodon.org/user/profile/#verification) identity-consolidation web standard.

StreetPass works by parsing the websites you visit and looking for any `rel="me"` links that link to a Mastodon account. If it finds one, it saves that profile to your StreetPass list. No special recommendation algorithms!
