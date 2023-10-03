import { Profile } from "./constants";
import { getIsUrlHttpOrHttps } from "./getIsUrlHttpOrHttps";
import { removeSubstring } from "./removeSubstring";
import { getProfileUrlScheme } from "./storage";

export async function getProfileUrl(profile: Profile): Promise<string> {
  const scheme = await getProfileUrlScheme();

  if (!scheme) {
    return profile.profileUrl;
  }

  let returnUrl = scheme;
  if (returnUrl.includes("{account}")) {
    returnUrl = profile.account
      ? returnUrl.replaceAll("{account}", `${profile.account}`)
      : profile.profileUrl;
  }
  if (returnUrl.includes("{profileUrl.noProtocol}")) {
    try {
      const profileUrlNoProtocol = removeSubstring(
        profile.profileUrl,
        new URL(profile.profileUrl).protocol,
        0,
      ).value;

      returnUrl = returnUrl.replaceAll(
        "{profileUrl.noProtocol}",
        profileUrlNoProtocol,
      );
    } catch (err) {
      returnUrl = profile.profileUrl;
    }
  }
  /**
   * A url scheme like https://mastodon.social/@tvler@mastodon.social doesn't work.
   * If we detect this pattern, strip the domain from the end
   * https://github.com/mastodon/mastodon/issues/21469
   */
  try {
    if (!profile.account) {
      throw new Error();
    }
    if (!getIsUrlHttpOrHttps(returnUrl)) {
      throw new Error();
    }
    const url = new URL(returnUrl);
    if (url.pathname !== `/@${profile.account}`) {
      throw new Error();
    }
    url.pathname = removeSubstring(url.pathname, `@${url.host}`, -1).value;
    returnUrl = url.toString();
  } catch (err) {
    // Do nothing
  }

  return returnUrl;
}
