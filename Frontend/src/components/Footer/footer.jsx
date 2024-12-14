import React from "react";

function Footer() {
  return (
    // <footer className="bg-blue-950 py-12 text-white w-full">
    //   <div className="grid grid-cols-12 max-w-screen-xl mx-auto gap-y-4">
    //     <div className="col-start-2 col-span-10 lg:col-start-2 lg:col-span-3">
    //       <p className="signika text-lg md:text-2xl font-bold">ResumeIQ</p>
    //       <p className="text-base mt-1">
    //         ResuParse is an intuitive, AI-driven resume parsing tool designed
    //         for efficient and accurate candidate screening on Windows, macOS,
    //         and Linux. ResuParse is free and open-source software.
    //       </p>
    //     </div>
    //     <div className="col-start-2 col-span-5 row-start-2 md:col-start-2 md:col-span-2 lg:col-start-6 lg:row-start-1">
    //       <p className="footer-list-heading">Links</p>
    //       <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://support.audacityteam.org"
    //             aria-label="External link to Help"
    //           >
    //             Help
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/FAQ"
    //             aria-label="Link to FAQ"
    //           >
    //             FAQ
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/blog"
    //             aria-label="Link to Blog"
    //           >
    //             Blog
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://forum.audacityteam.org/"
    //             aria-label="External link to Forum"
    //             target="_blank"
    //           >
    //             Forum
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://manual.audacityteam.org/"
    //             aria-label="External link to Manual"
    //             target="_blank"
    //           >
    //             Manual
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://audio.com/"
    //             aria-label="External link to Audio.com"
    //             target="_blank"
    //           >
    //             Audio.com
    //           </a>
    //         </li>
    //       </ul>
    //     </div>
    //     <div className="col-start-7 col-span-5 row-start-2 md:col-span-2 md:col-start-4 lg:col-start-8 lg:row-start-1">
    //       <p className="footer-list-heading">Downloads</p>
    //       <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/download/windows"
    //             aria-label="Link to Windows"
    //           >
    //             Windows
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/download/mac"
    //             aria-label="Link to macOS"
    //           >
    //             macOS
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/download/linux"
    //             aria-label="Link to Linux"
    //           >
    //             Linux
    //           </a>
    //         </li>
    //         <li id="beta-link">
    //           <a
    //             className="hover:text-blue-400"
    //             href="/beta"
    //             aria-label="Link to beta page"
    //           >
    //             Beta
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://musehub.com"
    //             aia-label="External link to Muse Hub"
    //           >
    //             Muse Hub
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="/download/openvino"
    //             aria-label="Link to AI plugins"
    //           >
    //             AI plugins
    //           </a>
    //         </li>
    //       </ul>
    //     </div>
    //     <div className="col-start-2 col-span-5 row-start-3 md:row-start-2 md:col-start-6 md:col-span-2 lg:col-start-10 lg:row-start-1">
    //       <p className="footer-list-heading">Social</p>
    //       <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://www.facebook.com/Audacity/"
    //             aria-label="External link to Facebook"
    //             target="_blank"
    //           >
    //             Facebook
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://github.com/audacity"
    //             aria-label="External link to github"
    //             target="_blank"
    //           >
    //             Github
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://discord.gg/audacity"
    //             aria-label="External link to discord"
    //             target="_blank"
    //           >
    //             Discord
    //           </a>
    //         </li>
    //         <li>
    //           <a
    //             className="hover:text-blue-400"
    //             href="https://www.youtube.com/c/audacity"
    //             aria-label="External link to Youtube"
    //             target="_blank"
    //           >
    //             YouTube
    //           </a>
    //         </li>
    //       </ul>
    //     </div>
    //     <div className="col-start-2 col-span-10 mt-4 lg:mt-12 min-w-max">
    //       <div className="border-t-[1px] border-gray-300 pt-4">
    //         <p className="copyright text-center text-sm">
    //           Copyright © <span id="copyright">2024</span> | FYP Group &amp;
    //           contributors. Website content licensed{" "}
    //           <a
    //             href="https://creativecommons.org/licenses/by/4.0/"
    //             className="underline hover:text-blue-700"
    //             rel="license"
    //             target="_blank"
    //             aria-label="CC-by 4.0"
    //           >
    //             CC-by 4.0
    //           </a>
    //           . ResuMatch® software is licensed under the terms of the GNU
    //           General Public License, Version 3. <br /> Further information about the
    //           software license, distribution and acceptable use can be found{" "}
    //           <a
    //             className="underline hover:text-blue-700"
    //             href="https://github.com/audacity/audacity/blob/master/LICENSE.txt"
    //             target="_blank"
    //             aria-label="in the source code"
    //           >
    //             in the source code
    //           </a>
    //           .
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </footer>
    <footer className="bg-blue-950 py-12 text-white w-full">
      <div className="grid grid-cols-12 max-w-screen-xl mx-auto gap-y-4">
        <div className="col-start-2 col-span-10 lg:col-start-2 lg:col-span-3">
          <p className="signika text-lg md:text-2xl font-bold">ResuParse</p>
          <p className="text-base mt-1">
            ResuParse is an intuitive, AI-driven resume parsing tool designed
            for efficient and accurate candidate screening on Windows, macOS,
            and Linux. ResuParse is free and open-source software.
          </p>
        </div>

        {/** Links Section **/}
        <div className="col-start-2 col-span-5 md:col-start-2 md:col-span-2 lg:col-start-6 lg:row-start-1">
          <p className="footer-list-heading text-lg font-semibold">Links</p>
          <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
            {[
              { name: "Help", href: "https://support.audacityteam.org" },
              { name: "FAQ", href: "/FAQ" },
              { name: "Blog", href: "/blog" },
              {
                name: "Forum",
                href: "https://forum.audacityteam.org/",
                target: "_blank",
              },
              {
                name: "Manual",
                href: "https://manual.audacityteam.org/",
                target: "_blank",
              },
              {
                name: "Resume.com",
                href: "https://audio.com/",
                target: "_blank",
              },
            ].map(({ name, href, target }, index) => (
              <li key={index}>
                <a
                  className="hover:text-blue-400"
                  href={href}
                  target={target}
                  aria-label={`Link to ${name}`}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/** Downloads Section **/}
        <div className="col-start-7 col-span-5 md:col-start-4 lg:col-start-8 lg:row-start-1">
          <p className="footer-list-heading text-lg font-semibold">Downloads</p>
          <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
            {[
              { name: "Windows", href: "/download/windows" },
              { name: "macOS", href: "/download/mac" },
              { name: "Linux", href: "/download/linux" },
              { name: "Beta", href: "/beta" },
              {
                name: "Muse Hub",
                href: "https://musehub.com",
                target: "_blank",
              },
              { name: "AI plugins", href: "/download/openvino" },
            ].map(({ name, href, target }, index) => (
              <li key={index}>
                <a
                  className="hover:text-blue-400"
                  href={href}
                  target={target}
                  aria-label={`Link to ${name}`}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/** Social Section **/}
        <div className="col-start-2 col-span-5 md:col-start-6 md:col-span-2 lg:col-start-10 lg:row-start-1">
          <p className="footer-list-heading text-lg font-semibold">Social</p>
          <ul className="mt-2 footer-link-list space-y-2 md:space-y-0">
            {[
              {
                name: "Facebook",
                href: "https://www.facebook.com/Audacity/",
                target: "_blank",
              },
              {
                name: "Github",
                href: "https://github.com/audacity",
                target: "_blank",
              },
              {
                name: "Discord",
                href: "https://discord.gg/audacity",
                target: "_blank",
              },
              {
                name: "YouTube",
                href: "https://www.youtube.com/c/audacity",
                target: "_blank",
              },
            ].map(({ name, href, target }, index) => (
              <li key={index}>
                <a
                  className="hover:text-blue-400"
                  href={href}
                  target={target}
                  aria-label={`External link to ${name}`}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/** Copyright Section **/}
        <div className="col-start-2 col-span-10 mt-4 lg:mt-12 min-w-max">
          <div className="border-t border-gray-300 pt-4">
            <p className="copyright text-center text-sm">
              Copyright © <span id="copyright">2024</span> | FYP Group &amp;
              contributors. Website content licensed{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="underline hover:text-blue-700"
                rel="license"
                target="_blank"
                aria-label="CC-by 4.0"
              >
                CC-by 4.0
              </a>
              . ResuParse® software is licensed under the terms of the GNU
              General Public License, Version 3. <br/> Further information about the
              software license, distribution and acceptable use can be found{" "}
              <a
                className="underline hover:text-blue-700"
                href="https://github.com/audacity/audacity/blob/master/LICENSE.txt"
                target="_blank"
                aria-label="in the source code"
              >
                in the source code
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
