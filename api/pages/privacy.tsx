import Link from "next/link";

export default function Page() {
  return (
    <div className="flex max-w-prose flex-col gap-y-1 p-3">
      <h1 className="text-lg font-semibold">StreetPass privacy policy</h1>

      <p>
        StreetPass does not have any analytics. StreetPass does share your
        personal data. All data is stored locally in your web browser and never
        stored on a server.
      </p>

      <p>
        If you email the developer for support, your email address and other
        information will be kept private and never be shared with anyone.
      </p>

      <p>
        <Link
          className="text-purple underline"
          href="https://github.com/tvler/streetpass/issues"
        >
          Support page
        </Link>
      </p>

      <p>
        <Link className="text-purple underline" href="/">
          Home
        </Link>
      </p>
    </div>
  );
}
