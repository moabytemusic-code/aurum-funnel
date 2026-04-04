AURUM Funnel HTML

Files:
- index.html = AURUM-aligned capture page
- crypto-beginners.html = Crypto beginners angle landing page
- rotator-crypto-beginners.html = Rotator system for crypto beginners (cycles through pages)
- thankyou.html = AURUM bridge page
- offer.html = AURUM presentation page
- aurum-email-notes.txt = email angle notes

Customize:
1. Replace the form action in index.html with your autoresponder form handler.
2. Replace placeholder video blocks in thankyou.html and offer.html with your embed code.
3. Replace the CTA in offer.html with your affiliate link, replicated page, or webinar link.
4. Add your logo / branding if needed.

Current flow:
index.html -> thankyou.html -> offer.html
crypto-beginners.html -> offer.html (direct beginner funnel)
rotator-crypto-beginners.html -> rotates between crypto-beginners.html, index.html, welcome.html

Rotator System:
- Automatically cycles through multiple landing pages
- Preserves URL parameters (ref, tracking IDs, etc.)
- Uses sessionStorage to track rotation state
- 3-second countdown with manual fallback link
