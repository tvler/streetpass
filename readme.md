# StreetPass for Mastodon

StreetPass is a discovery tool for Mastodon that helps connect users to the authors of websites they visit.

StreetPass is built off of the concept of [link verification](https://docs.joinmastodon.org/user/profile/#verification) on Mastodon, which allows profile links to get "verified" with a checkmark, but only if the page has a link back to that Mastodon profile using the [`rel="me"`](https://docs.joinmastodon.org/user/profile/#verification) identity-consolidation standard.

Streetpass parses the websites you visit looking for any `rel="me"` links that take you to a Mastodon account. If it finds one, it saves it in the extension's popup and notifies the user.
