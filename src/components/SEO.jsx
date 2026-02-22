
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title = 'Aditya Raj - Portfolio',
    description = 'Full Stack Developer making useful things for the web and mobile.',
    image,
    url = window.location.href,
    type = 'website'
}) => {

    const siteTitle = title.includes('Aditya Raj') ? title : `${title} | Aditya Raj`;
    const metaImage = image || 'https://firebasestorage.googleapis.com/v0/b/portfolio-v2-dev.appspot.com/o/default-og.png?alt=media'; // Fallback needed

    return (
        <Helmet>
            {/* Standard Mesh */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
