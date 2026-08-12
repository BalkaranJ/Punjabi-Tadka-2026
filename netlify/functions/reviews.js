// Server-side proxy for Google Places API (New) so the API key never
// reaches the client. Returns the rating summary and reviews exactly as
// Google's API returns them, no filtering by rating, per Google's
// Places API content policy (unfavorable reviews may not be omitted).

exports.handler = async function () {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Reviews are not configured yet.' }),
    };
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Could not reach Google Places API.' }),
      };
    }

    const data = await res.json();

    const reviews = (data.reviews || []).map((r) => ({
      author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
      photo: (r.authorAttribution && r.authorAttribution.photoUri) || null,
      rating: r.rating,
      text: (r.text && r.text.text) || '',
      relativeTime: r.relativePublishTimeDescription || '',
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Reviews don't change minute to minute; cache at the edge to
        // stay well within Places API quota/cost.
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
      body: JSON.stringify({
        rating: data.rating,
        userRatingCount: data.userRatingCount,
        mapsUrl: data.googleMapsUri,
        reviews,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Fetch to Google Places API failed.' }),
    };
  }
};
