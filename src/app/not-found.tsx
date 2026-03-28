import {
  NotFoundIeBackButton,
  NotFoundIeDetectButton,
  NotFoundIeRefreshButton,
} from "@/components/not-found-ie-actions";

const bodyTextClass = "text-[11px] leading-[15px] text-black";

export default function NotFound() {
  return (
    <section className="w-full bg-white px-4 py-6 text-black md:px-0">
      <table className="w-[400px] max-w-full border-separate border-spacing-[5px]">
        <tbody>
          <tr>
            <td className="w-[31px] align-top text-left">
              <svg
                width="31"
                height="40"
                viewBox="0 0 31 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="crispEdges"
                role="img"
                aria-label="Error document icon"
              >
                <title>Error document icon</title>
                <rect x="1" y="8" width="29" height="37" fill="black" />
                <rect x="0" y="0" width="29" height="38" fill="white" />
                <path d="M0 0H21L29 8V38H0V0Z" fill="white" />
                <path
                  d="M0 0V38H29V8H21V0H0ZM1 1H20V9H28V37H1V1Z"
                  fill="#808080"
                />
                <path d="M21 0V8H29" fill="white" />
                <path d="M21 0L29 8" stroke="#808080" strokeWidth="1" />
                <rect x="12" y="11" width="5" height="5" fill="#0000FF" />
                <rect x="12" y="19" width="5" height="12" fill="#0000FF" />
                <rect x="10" y="19" width="2" height="2" fill="#0000FF" />
                <rect x="9" y="31" width="11" height="2" fill="#0000FF" />
              </svg>
            </td>
            <td className="w-[360px] align-middle text-left">
              <h1 className="text-[17px] leading-[20px] text-black">
                The page cannot be displayed
              </h1>
            </td>
          </tr>

          <tr>
            <td colSpan={2} className={bodyTextClass}>
              The page you are looking for is currently unavailable. The Web
              site might be experiencing technical difficulties, or you may need
              to adjust your browser settings.
            </td>
          </tr>

          <tr>
            <td colSpan={2} className={bodyTextClass}>
              <div className="h-px bg-[#C0C0C0]" />
              <p className="mt-3">Please try the following:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  Click the <NotFoundIeRefreshButton /> button, or try again
                  later.
                </li>
                <li>
                  If you typed the page address in the Address bar, make sure
                  that it is spelled correctly.
                </li>
                <li>
                  To check your connection settings, click the <b>Tools</b>{" "}
                  menu, and then click <b>Internet Options</b>. On the{" "}
                  <b>Connections</b> tab, click <b>Settings</b>. The settings
                  should match those provided by your local area network (LAN)
                  administrator or Internet service provider (ISP).
                </li>
                <li>
                  If your Network Administrator has enabled it, Microsoft
                  Windows can examine your network and automatically discover
                  network connection settings.
                  <br />
                  If you would like Windows to try and discover them,
                  <br />
                  click <NotFoundIeDetectButton />
                </li>
                <li>
                  Some sites require 128-bit connection security. Click the{" "}
                  <b>Help</b> menu and then click <b>About Internet Explorer</b>{" "}
                  to determine what strength security you have installed.
                </li>
                <li>
                  If you are trying to reach a secure site, make sure your
                  Security settings can support it. Click the <b>Tools</b> menu,
                  and then click <b>Internet Options</b>. On the <b>Advanced</b>{" "}
                  tab, scroll to the Security section and check settings for SSL
                  2.0, SSL 3.0, TLS 1.0, PCT 1.0.
                </li>
                <li>
                  Click the ⬅️ <NotFoundIeBackButton /> button to try another
                  link.
                </li>
              </ul>

              <h2 className="mt-6 text-[11px] leading-[15px] text-black">
                Cannot find page or DNS Error
                <br />
                Internet Explorer
              </h2>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
