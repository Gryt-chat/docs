import { readFileSync } from 'fs';
import { join } from 'path';

// Bumped whenever the OG card's design changes, so cached embeds (Discord
// keys its cache by URL) fetch the new image instead of the old one.
export const OG_IMAGE_VERSION = '2';

// The current mark, matching packages/site/public/logo.svg. Never the
// retired periwinkle-circle owl that used to live in public/favicon.svg.
const EAR = '#2B303D';
const BODY = '#1A1D24';
const EYE = '#CBCBCE';
const DISC = '#968FF8';

/** The mark on its disc, sized for the header next to the wordmark. */
export function OwlMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <rect width="512" height="512" rx="256" fill={DISC} />
      <ellipse cx="144.56" cy="321.963" rx="74.5603" ry="125.871" fill={EAR} />
      <ellipse cx="368.56" cy="321.963" rx="74.5603" ry="125.871" fill={EAR} />
      <ellipse cx="254.397" cy="368.463" rx="157.138" ry="186.802" fill={BODY} />
      <path
        d="M167.009 115.118C140.552 133.557 110.621 186.471 104.474 216.135C104.474 216.135 146.164 282.678 256 282.678C365.836 282.678 409 221.266 409 216.135C409 209.721 393.897 140.773 365.836 121.532C337.776 102.29 311.319 91.8677 259.207 91.066C207.095 90.2643 193.465 96.6781 167.009 115.118Z"
        fill={BODY}
      />
      <path
        d="M258.736 232.014C258.214 234.003 255.389 234.003 254.867 232.014L247.045 202.207C246.712 200.939 247.669 199.7 248.98 199.7L264.624 199.7C265.935 199.7 266.891 200.939 266.558 202.207L258.736 232.014Z"
        fill={EYE}
      />
      <path
        d="M203.08 162C216.959 162 221.986 169.702 222.773 173.951C223.299 177.67 223.246 186.062 218.835 189.887C213.321 194.667 195.473 200.325 190.476 185.106C186.814 173.951 188.375 169.171 188.113 169.171C190.476 163.631 195.256 162 203.08 162Z"
        fill={EYE}
      />
      <path
        d="M308.124 160.851C294.151 160.851 289.09 168.637 288.297 172.932C287.768 176.691 287.821 185.174 292.262 189.04C297.814 193.873 315.782 199.592 320.813 184.208C324.5 172.932 322.928 168.1 323.192 168.1C320.813 162.5 316 160.851 308.124 160.851Z"
        fill={EYE}
      />
    </svg>
  );
}

// The mark without its disc, so it reads as tone rather than a second logo.
// Matches generate-og-image.mjs's OWL_GLYPH watermark treatment.
export function OwlGlyph({
  size,
  ear,
  body,
  eye,
}: {
  size: number;
  ear: string;
  body: string;
  eye: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <ellipse cx="144.56" cy="321.963" rx="74.5603" ry="125.871" fill={ear} />
      <ellipse cx="368.56" cy="321.963" rx="74.5603" ry="125.871" fill={ear} />
      <ellipse cx="254.397" cy="368.463" rx="157.138" ry="186.802" fill={body} />
      <path
        d="M167.009 115.118C140.552 133.557 110.621 186.471 104.474 216.135C104.474 216.135 146.164 282.678 256 282.678C365.836 282.678 409 221.266 409 216.135C409 209.721 393.897 140.773 365.836 121.532C337.776 102.29 311.319 91.8677 259.207 91.066C207.095 90.2643 193.465 96.6781 167.009 115.118Z"
        fill={body}
      />
      <path
        d="M258.736 232.014C258.214 234.003 255.389 234.003 254.867 232.014L247.045 202.207C246.712 200.939 247.669 199.7 248.98 199.7L264.624 199.7C265.935 199.7 266.891 200.939 266.558 202.207L258.736 232.014Z"
        fill={eye}
      />
      <path
        d="M203.08 162C216.959 162 221.986 169.702 222.773 173.951C223.299 177.67 223.246 186.062 218.835 189.887C213.321 194.667 195.473 200.325 190.476 185.106C186.814 173.951 188.375 169.171 188.113 169.171C190.476 163.631 195.256 162 203.08 162Z"
        fill={eye}
      />
      <path
        d="M308.124 160.851C294.151 160.851 289.09 168.637 288.297 172.932C287.768 176.691 287.821 185.174 292.262 189.04C297.814 193.873 315.782 199.592 320.813 184.208C324.5 172.932 322.928 168.1 323.192 168.1C320.813 162.5 316 160.851 308.124 160.851Z"
        fill={eye}
      />
    </svg>
  );
}

export const OG_FONT_FAMILY = 'Atkinson Hyperlegible Next';

// Static instances of the variable font used elsewhere in the docs: next/og's
// ImageResponse only accepts ttf/otf/woff, not woff2 or variable fonts.
export function loadOgFonts() {
  const regular = readFileSync(
    join(process.cwd(), 'src', 'fonts', 'AtkinsonHyperlegibleNext-og-regular.ttf'),
  );
  const bold = readFileSync(
    join(process.cwd(), 'src', 'fonts', 'AtkinsonHyperlegibleNext-og-bold.ttf'),
  );
  return [
    { name: OG_FONT_FAMILY, data: regular, weight: 400 as const, style: 'normal' as const },
    { name: OG_FONT_FAMILY, data: bold, weight: 800 as const, style: 'normal' as const },
  ];
}
