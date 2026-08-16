<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Responsible for transforming simple app descriptions into
 * detailed, structured "Master Prompts" via the Gemini API.
 */
final class PromptEnhancer
{
    private const string API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const int TIMEOUT_SECONDS = 60;

    /**
     * Enhance a basic app request into a detailed master prompt.
     *
     * For landing pages, returns a pre-built template prompt.
     * For Node.js apps, uses Gemini to generate a comprehensive master prompt.
     */
    public function enhance(string $appName, string $appDescription, string $appType = 'nodejs'): string
    {
        $type = AppType::tryFrom($appType) ?? AppType::NodeJs;

        if ($type === AppType::Landing) {
            return $this->enhanceLandingViaGemini($appName, $appDescription);
        }

        return $this->enhanceViaGemini($appName, $appDescription);
    }

    /**
     * Build a static prompt for landing page generation.
     */
    private function buildLandingPrompt(string $appName, string $appDescription): string
    {
        return <<<PROMPT
# MASTER PROMPT FOR SINGLE-FILE SAAS LANDING PAGE: {$appName}

Generate a 100% COMPLETE, PRODUCTION-READY, HIGH-CONVERTING, LUXURY-GRADE single-file HTML landing page (`index.html`) for "{$appName}".
App Description & Value Proposition: "{$appDescription}".

The output must be a self-contained masterpiece with ZERO placeholder code, ZERO truncated sections, and ZERO external server dependencies. It must render instantly and flawlessly directly in any modern browser.

═══════════════════════════════════════════════════════════
1. ARCHITECTURAL & FILE SPECIFICATIONS
═══════════════════════════════════════════════════════════
• Deliver ONLY a single, self-contained `index.html` file.
• NO Node.js, Express, backend servers, or package.json.
• ALL styles must use Tailwind CSS v4 CDN and inlined `<style>` tag helpers. FORBIDDEN to create separate CSS files (`style.css`), and FORBIDDEN to use CSS `@import` or link non-Tailwind stylesheets.
• ALL client-side JavaScript (mobile menu, FAQ accordion, tab switching, pricing toggle, toast alerts, smooth scroll) must be inside `<script>` tags at the bottom of `index.html`.

═══════════════════════════════════════════════════════════
2. MANDATORY LIBRARIES (INCLUDE IN <head>)
═══════════════════════════════════════════════════════════
• Tailwind CSS v4:
  `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`
• Remix Icon (MANDATORY — NEVER use FontAwesome, Heroicons, or Lucide):
  `<link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">`
• Google Fonts Inter:
  `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">`
• STRICT STYLE RESTRICTIONS: No external CSS files, no `@import` statements, no Bootstrap/Bulma/FontAwesome.

═══════════════════════════════════════════════════════════
3. LUXURY DESIGN SYSTEM & VISUAL IDENTITY
═══════════════════════════════════════════════════════════
• Color Architecture (Sophisticated Dark Aesthetic):
  - Primary Background: Deep Slate `#0F172A`
  - Elevated Cards / Surfaces: `#1E293B`
  - Floating / Hover Surfaces: `#334155`
  - Primary Typography: `#F8FAFC`
  - Secondary Typography: `#CBD5E1`
  - Muted Text / Captions: `#94A3B8`
  - Subtle Borders: `rgba(148, 163, 184, 0.12)`
  - Hover Borders: `rgba(148, 163, 184, 0.28)`
  - Accent Color (Pick ONE fitting the app's industry):
    * Royal Sapphire: `#3B82F6` (glow: `rgba(59, 130, 246, 0.2)`)
    * Radiant Emerald: `#10B981` (glow: `rgba(16, 185, 129, 0.2)`)
    * Amber Gold: `#F59E0B` (glow: `rgba(245, 158, 11, 0.2)`)

• Typography & Hierarchy:
  - Font Family: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  - Hero Headline: `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight` with gradient highlight
  - Section Headings: `text-3xl sm:text-4xl font-bold tracking-tight`
  - Card Titles: `text-lg sm:text-xl font-semibold`
  - Body Text: `text-sm sm:text-base leading-relaxed text-[#94A3B8]`

• Micro-Interactions & Styling:
  - All interactive elements: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
  - Button Hover: `transform: translateY(-1px)` with elevated box-shadow
  - Card Hover: `transform: translateY(-3px)` with luminous border glow
  - Subtle glassmorphism: `backdrop-filter: blur(16px); background: rgba(30, 41, 59, 0.75)`

═══════════════════════════════════════════════════════════
4. COMPLETE LANDING PAGE SECTIONS (ALL MUST BE RENDERED IN FULL)
═══════════════════════════════════════════════════════════

1. STICKY GLASSMORPHIC NAVBAR:
   - Logo with glowing Remix Icon & bold brand name "{$appName}"
   - Navigation Links: Features, How It Works, Pricing, Testimonials, FAQ
   - Right Actions: "Sign In" button & "Get Started Free" primary CTA with `<i class="ri-arrow-right-line"></i>`
   - Mobile Hamburger Menu button (`<i class="ri-menu-line"></i>`)

2. HERO SECTION:
   - Announcement Pill Badge with pulse dot: e.g. `<i class="ri-sparkling-fill text-amber-400"></i> Next-Gen Platform v3.0 Live`
   - High-Impact Headline (e.g., "The Modern OS for {$appName}") with gradient text highlight
   - Compelling value-proposition subtitle explaining how it solves the customer's core problem
   - Dual Call-to-Action buttons (Primary: "Start Free Trial" + Secondary: "Watch 2-min Demo" with `<i class="ri-play-circle-line"></i>`)
   - Trust Badges: "No credit card required • 14-day free trial • Cancel anytime" with `<i class="ri-shield-check-line text-emerald-400"></i>`
   - Interactive Visual Demo Container / Dashboard Preview Mockup with realistic stat widgets, tabs, and simulated live metrics

3. SOCIAL PROOF / TRUSTED BY LOGO CLOUD:
   - Subtle "TRUSTED BY 2,000+ FAST-GROWING COMPANIES WORLDWIDE" label
   - 5-6 clean company logo placeholders with Remix Icons & modern typography

4. VALUE PILLARS / BENTO GRID FEATURES (6+ Feature Cards):
   - Each card features:
     * Rounded icon box in colored gradient background (e.g., `<i class="ri-flashlight-line"></i>`, `<i class="ri-shield-keyhole-line"></i>`, `<i class="ri-line-chart-line"></i>`, `<i class="ri-magic-line"></i>`, `<i class="ri-repeat-2-line"></i>`, `<i class="ri-lock-password-line"></i>`)
     * Bold feature title
     * Descriptive benefit copy
     * Interactive tag or visual mini-badge

5. INTERACTIVE HOW IT WORKS (3-Step Guided Flow):
   - Step 1: Connect / Setup (with icon `<i class="ri-user-add-line"></i>`)
   - Step 2: Automate & Build (with icon `<i class="ri-cpu-line"></i>`)
   - Step 3: Launch & Scale (with icon `<i class="ri-rocket-2-line"></i>`)
   - Step numbers with glowing indicators and visual connecting lines

6. LIVE PERFORMANCE & ROI STATS COUNTER:
   - 4-column metric grid (e.g., "99.99% Uptime", "10x Faster Deployment", "500K+ Active Users", "4.9/5 Star Rating")

7. INTERACTIVE PRICING CALCULATOR / TIERS (Monthly & Yearly Toggle):
   - Toggle switch for Monthly / Yearly billing with a "Save 20%" discount badge
   - 3 Clean Pricing Cards:
     * Starter / Free: Basic features for individual makers
     * Pro / Growth (HIGHLIGHTED with glowing border & "MOST POPULAR" badge): Complete suite for professionals
     * Enterprise: Custom high-volume scale for large teams
   - Feature checklist with green checkmarks (`<i class="ri-check-line text-emerald-400"></i>`)
   - Actionable CTA button on each card

8. CLIENT TESTIMONIALS & REVIEWS (3-Column Grid):
   - 3 authentic testimonial cards with client avatar, full name, job title/company, 5-star rating (`<i class="ri-star-fill text-amber-400"></i>`), and high-impact review quote

9. INTERACTIVE FAQ ACCORDION:
   - 5-6 common questions with smooth expand/collapse animations and chevron icon (`<i class="ri-arrow-down-s-line"></i>`)

10. FINAL HIGH-CONVERSION CTA BANNER:
    - High-energy gradient container with headline "Ready to Transform How You Work with {$appName}?"
    - Email subscription / signup input with instant submit button
    - Guarantee footnote

11. COMPREHENSIVE 4-COLUMN FOOTER:
    - Column 1: Brand identity, logo, bio, copyright notice
    - Column 2: Product links (Features, Pricing, Roadmap, Changelog)
    - Column 3: Resources (Documentation, API Reference, Community, Status)
    - Column 4: Company & Legal (Privacy Policy, Terms of Service, Security, Contact)
    - Social Media Links: `<i class="ri-twitter-x-line"></i>`, `<i class="ri-github-line"></i>`, `<i class="ri-linkedin-fill"></i>`, `<i class="ri-discord-line"></i>`

═══════════════════════════════════════════════════════════
5. JAVASCRIPT INTERACTIVITY (INSIDE <script> TAGS)
═══════════════════════════════════════════════════════════
1. Mobile Drawer Navigation: Toggle hamburger menu with body scroll lock and backdrop click listener.
2. Smooth Anchor Scrolling: Smooth scrolling on all `#section` links with offset calculation.
3. Pricing Toggle: JavaScript function that updates pricing numbers and period labels dynamically when switching Monthly/Yearly.
4. FAQ Accordion: Click listener to toggle active class, rotate chevron `<i class="ri-arrow-down-s-line"></i>`, and smoothly reveal answers.
5. Interactive Toast Notification: Slide-in notification banner at the top-right when users submit the newsletter/contact form.
6. Intersection Observer: Subtle fade-in on scroll for feature cards and pricing tables.

Write the ENTIRE `index.html` file completely with all CSS, HTML, and JavaScript. DO NOT truncate any sections.
PROMPT;
    }

    /**
     * Call Gemini to generate a UNIQUE, product-specific master prompt for a landing page.
     * Falls back to the static buildLandingPrompt() if API key is missing or request fails.
     */
    private function enhanceLandingViaGemini(string $appName, string $appDescription): string
    {
        $apiKey = (string) config('services.gemini.key');
        $model  = (string) config('services.gemini.model', 'gemini-2.5-flash');

        Log::info('Enhancing landing page prompt via Gemini', [
            'app_name'       => $appName,
            'api_key_present' => $apiKey !== '',
            'model'          => $model,
        ]);

        if ($apiKey === '') {
            return $this->buildLandingPrompt($appName, $appDescription);
        }

        try {
            $url = sprintf('%s/%s:generateContent', self::API_BASE_URL, $model);

            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [['text' => SystemInstruction::forLandingPageEnhancer($appName, $appDescription)]],
                        ],
                    ],
                    'generationConfig' => ['temperature' => 1.0],
                ])
                ->throw()
                ->json();

            $text = trim($response['candidates'][0]['content']['parts'][0]['text'] ?? '');

            if (empty($text)) {
                return $this->buildLandingPrompt($appName, $appDescription);
            }

            Log::info('Landing page prompt enhanced successfully via Gemini', ['app_name' => $appName]);

            return $text;
        } catch (\Throwable $e) {
            Log::warning('Gemini landing page enhancer failed, using static fallback', [
                'error'    => $e->getMessage(),
                'app_name' => $appName,
            ]);

            return $this->buildLandingPrompt($appName, $appDescription);
        }
    }

    /**
     * Call Gemini to generate an enhanced master prompt for a fullstack Node.js app.
     * Falls back to a static template if the API key is missing or the request fails.
     */
    private function enhanceViaGemini(string $appName, string $appDescription): string
    {
        $apiKey = (string) config('services.gemini.key');
        $model = (string) config('services.gemini.model', 'gemini-2.5-flash');

        Log::info('Enhancing prompt via Gemini', [
            'app_name' => $appName,
            'api_key_present' => $apiKey !== '',
            'model' => $model,
        ]);

        if ($apiKey === '') {
            return SystemInstruction::forFallbackPrompt($appName, $appDescription);
        }

        try {
            $url = sprintf(
                '%s/%s:generateContent',
                self::API_BASE_URL,
                $model
            );

            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => SystemInstruction::forPromptEnhancer($appName, $appDescription)]],
                        ],
                    ],
                ])
                ->throw()
                ->json();

            $output = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            return $output !== '' ? $output : SystemInstruction::forFallbackPrompt($appName, $appDescription);
        } catch (\Throwable $e) {
            Log::error('Gemini prompt enhancement failed', [
                'error' => $e->getMessage(),
                'app_name' => $appName,
            ]);

            return SystemInstruction::forFallbackPrompt($appName, $appDescription);
        }
    }
}
