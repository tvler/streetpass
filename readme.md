<img width="560" alt="" src="https://raw.githubusercontent.com/tvler/streetpass/main/api/public/screen3.png">

[Download for Chrome](https://chrome.google.com/webstore/detail/streetpass-for-mastodon/fphjfedjhinpnjblomfebcjjpdpakhhn)

[Download for Safari](https://apps.apple.com/us/app/streetpass-for-mastodon/id6446224821)

[Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/streetpass-for-mastodon/)

# StreetPass for Mastodon

StreetPass is a browser extension that helps you find your people on Mastodon. Here's how it works:

1. Mastodon users verify themselves by adding a [custom link](https://docs.joinmastodon.org/user/profile/#verification) to their personal site.
2. StreetPass lets you know when you've found one of these links, and adds them to your StreetPass list.
3. Browse the web as usual. StreetPass will build a list of Mastodon users made up of the websites you go to.

❤️ StreetPass is made possible by open web [identity verification standards](http://microformats.org/wiki/rel-me).

# How to build locally

- Install `yarn`
- `cd` into the extension directory
- Run `yarn`
- Build command
  - Chrome: `yarn build:chrome` -> Out dir: `dist-chrome`
  - Firefox: `yarn build:firefox` -> Out dir: `dist-firefox`
  - Safari: `yarn build:safari` -> Out dir: `dist-safari`
  - All: `yarn build`
