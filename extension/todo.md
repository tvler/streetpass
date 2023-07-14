- good ones to check
- https://gnu.tiflolinux.org/avefenix
- https://themarkup.org/people/dan-phiffer
- https://tylerdeitz.com/
- https://www.washingtonpost.com/people/pranshu-verma/
- https://robb.is/
- https://mastodon.social/@DLX
- https://www.presscheck.org/journalists

activitypub

- https://blog.joinmastodon.org/2018/06/how-to-implement-a-basic-activitypub-server/
- https://docs.joinmastodon.org/spec/security/
- https://docs.joinmastodon.org/spec/activitypub/#publicKey
- https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/
- https://github.com/michaelcpuckett/activitypub-core/blob/1cca3bb1355fffd56a67f6672712a2b133d8d79e/packages/activitypub-core-crypto-node/src/getHttpSignature.ts#L27
- https://github.com/michaelcpuckett/activitypub-core/blob/1cca3bb1355fffd56a67f6672712a2b133d8d79e/packages/activitypub-core-db-d1/src/fetchEntityById.ts#L48

get-profiles to test

- https://streetpass.social/api/get-profile?url=https://mastodon.social/@tvler
- https://streetpass.social/api/get-profile?url=https://social.chriswb.dev/@chrisw_b
- https://streetpass.social/api/get-profile?url=https://mastodon.social/@Gargron
- https://streetpass.social/api/get-profile?url=https://calckey.social/@panos
- https://streetpass.social/api/get-profile?url=https://social.panic.com/@panic
- pixelfed https://streetpass.social/api/get-profile?url=https://pixtagram.social/jcrabapple
- https://streetpass.social/api/get-profile?url=https://google.com

cross browser

- https://akoskm.com/building-a-cross-browser-extension#heading-bundlers
- https://akoskm.com/how-to-build-cross-browser-extensions-react-typescript-tailwindcss-vite

safari

- https://developer.apple.com/videos/play/wwdc2020/10665/
- https://developer.apple.com/videos/play/wwdc2022/10099/
- https://developer.apple.com/safari/extensions/
- https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- privacy policy https://overcast.fm/privacy
- privacy policy https://underpassapp.com/homecoming/privacy.html

good screenshot sites

- http://www.herethat.com/
- https://www.newrafael.com/websites/

todo

- bug https://mastodon.social/@danjones000@microwords.goodevilgenius.org/109814359998688174
- goto social support https://mastodon.social/@emil@helo.fuse.pl/109836215334237802
- check if if (details.reason === "install") { works
- react

yarn build:safari && xcrun /Applications/Xcode.app/Contents/Developer/usr/bin/safari-web-extension-converter \
--swift \
--macos-only \
--no-open \
--project-location ./dist-safari \
./dist-safari

xcodebuild -list -project dist-safari/StreetPass\ for\ Mastodon/StreetPass\ for\ Mastodon.xcodeproj

xcodebuild -project dist-safari/StreetPass\ for\ Mastodon/StreetPass\ for\ Mastodon.xcodeproj

xcodebuild -project dist-safari/StreetPass\ for\ Mastodon/StreetPass\ for\ Mastodon.xcodeproj -allowProvisioningUpdates -quiet

xcodebuild -project dist-safari/StreetPass\ for\ Mastodon/StreetPass\ for\ Mastodon.xcodeproj -allowProvisioningUpdates DEVELOPMENT_TEAM=WLTVAXDPZT -quiet

https://en.wikipedia.org/wiki/Axonometric_projection#Three_types

# How to create xcode build

- run yarn build:safari
- open generated xcode project
- go to targets -> streetpass for mastodon
- set version to correct version
- set App category to social networking
- Go to Product -> Archive
- In archives window, press Distribute App -> App store connect -> Upload -> Dev Team: Tyler Deitz
- Go to app store connect -> testflight. make sure it works
