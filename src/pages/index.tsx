import type { GetServerSidePropsContext } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../utils/api";
import format from "date-fns/format";
import { Dock } from "../components/Dock";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Image from "next/image";

const Home: NextPage = () => {
  const featuredDocks = api.docks.getFeatured.useQuery();

  return (
    <>
      <Head>
        <title>Dockhunt</title>
        <meta name="description" content="Visualize people's Mac docks" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col gap-12 pt-24">
        {featuredDocks.data
          ? featuredDocks.data.map((dock) => (
            <div key={dock.id} className={"flex flex-col"}>
              <p className="text-sm text-gray-600 mb-2">
                {format(dock.createdAt, "MMM d, y")}
              </p>
              <div
                className="flex gap-12 rounded-xl border border-solid border-gray-700 pt-32 pb-6 justify-center px-12 relative">
                <Link
                  href={`/users/${dock.user.username}`}
                  className="text-gray-600 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
                >
                  {/* TODO: Use placeholder image for null values */}
                  {/* TODO: On hover show tooltip of name */}
                  <Image src={dock.user.avatarUrl ?? ""} alt={`${dock.user.name}'s avatar`} width={80} height={80}
                         className={"rounded-full"} />
                </Link>
                <Dock
                  apps={dock.dockItems.map((dockItem) => dockItem.app)}
                />
              </div>
            </div>
          ))
          : "Loading..."}
      </div>
    </>
  );
};

export default Home;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  // Hack to convert undefined values to null for user.image
  // TODO: Fix why user.image is undefined. Probably need to map it to "avatarUrl" in DB
  if (session && session.user) {
    session.user.image = session.user.image ?? null;
  }
  return {
    props: {
      session
    }
  };
}
