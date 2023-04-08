import { GetServerSideProps } from "next";

export default function Page() {
  return null;
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  if (context.query.resource !== "acct:streetpass@streetpass.social") {
    return {
      notFound: true,
    };
  }

  const webfinger = {
    subject: "acct:streetpass@streetpass.social",
    aliases: ["https://mastodon.social/users/streetpass"],
    links: [
      {
        rel: "self",
        type: "application/activity+json",
        href: "https://mastodon.social/users/streetpass",
      },
    ],
  };

  context.res.setHeader("Content-Type", "application/json");
  context.res.write(JSON.stringify(webfinger));
  context.res.end();
  return { props: {} };
};
