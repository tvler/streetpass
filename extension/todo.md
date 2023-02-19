- good ones to check
- https://gnu.tiflolinux.org/avefenix
- https://themarkup.org/people/dan-phiffer
- https://tylerdeitz.com/
- https://www.washingtonpost.com/people/pranshu-verma/
- https://robb.is/
- https://mastodon.social/@DLX
- https://www.presscheck.org/journalists

cross browser

- https://akoskm.com/building-a-cross-browser-extension#heading-bundlers
- https://akoskm.com/how-to-build-cross-browser-extensions-react-typescript-tailwindcss-vite

safari

- https://developer.apple.com/videos/play/wwdc2020/10665/
- https://developer.apple.com/videos/play/wwdc2022/10099/
- https://developer.apple.com/safari/extensions/

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
