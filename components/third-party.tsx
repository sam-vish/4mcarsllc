import Script from "next/script";

/* ---------------------------------------------------------------------------
   Google Tag Manager and the GoHighLevel chat widget.

   Both are opt-in: with the environment variable unset, nothing is rendered
   and nothing third-party is requested. That is the correct state for local
   development and for a preview deploy — it is not an error.

   Do not add GA/gtag alongside GTM; tags belong inside the container.
--------------------------------------------------------------------------- */
export default function ThirdParty() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const widgetId = process.env.NEXT_PUBLIC_GHL_WIDGET_ID;

  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {widgetId ? (
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          strategy="lazyOnload"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id={widgetId}
        />
      ) : null}
    </>
  );
}
