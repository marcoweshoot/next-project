# Graph Report - .  (2026-08-12)

## Corpus Check
- Large corpus: 522 files · ~174,532 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2130 nodes · 4659 edges · 220 communities (130 shown, 90 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.58)
- Token cost: 200,531 input · 0 output

## Community Hubs (Navigation)
- Calendar Session Components
- shadcn UI Menu Primitives
- Admin & Tour Booking Data
- Static Marketing Pages
- Tour Detail Route
- Admin Booking Management API
- Tour Day Itinerary Components
- Auth & Checkout Forms
- TypeScript Config (base)
- Homepage Tours Grid
- Course Detail Components
- Sidebar UI Component
- User Dashboard & Profile
- Hero Sections & Image Utils
- Stripe Guest Checkout Claim
- Homepage Courses Section
- Admin Bookings & Reviews
- Supabase Database Types
- Location Gallery Layouts
- TypeScript Config (app)
- Checkout Funnel Components
- Courses & Stories Landing Pages
- Detail Page Heroes & Legal Pages
- Admin Auth Guards
- Payment & Email Docs
- Review & Gallery Lightbox
- shadcn UI Form Primitives
- Core Domain Types
- Transactional Email Templates
- Header Nav & Booking Details
- Reviews Listing Page
- Search Index Builder
- Homepage Gallery Lightbox
- Tours Listing & FAQ
- FAQ Components by Section
- Carousel UI Components
- TypeScript Config (node)
- Destination Detail Route
- Stripe Checkout Session API
- Payment Toast Notifications
- Coaches Listing Page
- Photographer Detail Route
- Dashboard Bookings & Payments
- Checkout Footer & Stepper UI
- Tour Gallery Components
- GraphQL Fragments (entities)
- GraphQL Page Queries
- npm Dependencies (misc)
- shadcn Components Config
- Location Detail Route
- Story Detail Route
- Checkout Resume State
- Destination Error & Footer
- Sitemap & GraphQL Coaches Query
- Tour Contact & Sticky Nav
- Tour Card Gallery Images
- Photographer Tours List
- Collection Detail Route
- Calendar & Account Deletion UI
- Data Sync Scripts
- GraphQL Image Fragments
- Destination Tours Grid
- Courses Feature Sections
- App Providers (Apollo/Theme)
- shadcn Form Field Context
- Rate Limiting Middleware
- Input Validation Utils
- npm Dev Dependencies
- Facebook Conversions API
- Analytics & Root Layout
- Payment Success Flow
- shadcn Chart Component
- shadcn Command Palette
- shadcn Toast Notifications
- Admin Statistics Dashboard
- Calendar & SEO GraphQL Queries
- Reviews Page Components
- Calendar Loading & Media Utils
- Icon Components
- Tour Card Pricing & Coaches
- Tour Highlights & Summary
- shadcn Pagination Component
- GraphQL Tour Detail Fields
- SEO Traffic Analysis Docs
- Tour Coach Display Utils
- shadcn Sheet Component
- shadcn Table Component
- Consent & Analytics Loaders
- Image Upload Utils
- npm Scripts
- Stripe Payment Intent API
- View Category Tracking
- Tour Reviews Display
- shadcn Navigation Menu
- Supabase Security Hardening Docs
- Thank You Page Tracking
- Gift Card Grid Components
- Tour Equipment Info
- Homepage Collections Section
- Contacts Section Components
- Tour Inclusions Section
- package.json Metadata
- Header Logo Components
- shadcn OTP Input
- Booking & Review Types
- Vercel Function Config
- jsconfig Path Aliases
- Auth Middleware Nonce
- Auto Login Flow
- Snapshot Reader Util
- Global Window Type Declarations
- Password Reset Email API
- Forgot Password Layout
- Login Page Layout
- Register Page Layout
- Reset Password Layout
- App Font Config
- Tour Details Grid
- GraphQL Inclusions Fragments
- Story Detail Hook
- Apollo Client Dependency
- Apollo Next.js Support Dependency
- clsx Dependency
- cmdk Dependency
- date-fns Dependency
- Embla Carousel Autoplay Dependency
- ESLint Next Config Dependency
- ESLint JS Dependency
- ESLint React Hooks Dependency
- ESLint React Refresh Dependency
- express-rate-limit Dependency
- globals Dependency
- graphql Dependency
- React Hook Form Resolvers Dependency
- input-otp Dependency
- Next.js Config File
- next-env Type Declarations
- Next.js ESLint Plugin Dependency
- next-themes Dependency
- ogl Dependency
- p-limit Dependency
- graphql-request Dependency
- lucide-react Dependency
- next Dependency
- Radix Accordion Dependency
- Radix Alert Dialog Dependency
- Radix Aspect Ratio Dependency
- Radix Avatar Dependency
- Radix Checkbox Dependency
- Radix Collapsible Dependency
- Radix Context Menu Dependency
- Radix Dialog Dependency
- Radix Dropdown Menu Dependency
- Radix Hover Card Dependency
- Radix Label Dependency
- Radix Navigation Menu Dependency
- Radix Popover Dependency
- Radix Progress Dependency
- Radix Radio Group Dependency
- Radix Scroll Area Dependency
- Radix Select Dependency
- Radix Separator Dependency
- Radix Slider Dependency
- Radix Slot Dependency
- Radix Switch Dependency
- Radix Tabs Dependency
- Radix Toast Dependency
- Radix Toggle Dependency
- Radix Toggle Group Dependency
- Radix Tooltip Dependency
- React Dependency
- React Day Picker Dependency
- React DOM Dependency
- React Hook Form Dependency
- Customerly Live Chat Dependency
- React Resizable Panels Dependency
- React Swipeable Dependency
- Recharts Dependency
- Sonner Toast Dependency
- Stripe SDK Dependency
- Stripe React.js Dependency
- Stripe.js Dependency
- Supabase SSR Dependency
- Supabase JS Client Dependency
- Tailwind Animate Dependency
- Vercel Speed Insights Dependency
- PostCSS Dependency
- Tailwind CSS Dependency
- Tailwind Typography Dependency
- Node Types Dependency
- React Types Dependency
- React DOM Types Dependency
- TypeScript Dependency
- typescript-eslint Dependency
- TypeScript ESLint Plugin Dependency
- Tailwind Config File
- FAQ Schema Markup Docs
- Stripe Command File (empty)
- Project README

## God Nodes (most connected - your core abstractions)
1. `cn()` - 237 edges
2. `Button` - 78 edges
3. `createClient()` - 67 edges
4. `createServerClientSupabase()` - 55 edges
5. `Card()` - 52 edges
6. `CardContent()` - 51 edges
7. `Tour` - 42 edges
8. `Header()` - 38 edges
9. `Alert` - 34 edges
10. `AlertDescription` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Fix: Facebook Meta Deduplicazione Eventi Inizio Acquisto` --semantically_similar_to--> `Analisi Problema Pagamento - Lorenzo Forcignano (69EUR)`  [INFERRED] [semantically similar]
  FACEBOOK_PIXEL_DEDUPLICATION_FIX.md → PAYMENT_ISSUE_ANALYSIS.md
- `Documentazione Casi di Pagamento` --conceptually_related_to--> `Implementazione Sistema Gift Card - WeShoot`  [INFERRED]
  PAYMENT_CASES_DOCUMENTATION.md → GIFT_CARD_IMPLEMENTATION.md
- `Fix: Facebook Pixel InitiateCheckout Event Timing` --references--> `Guida Test Facebook Pixel - Conversione Pagamento`  [EXTRACTED]
  FACEBOOK_INITIATECHECKOUT_FIX.md → FACEBOOK_PIXEL_TEST.md
- `Implementazione Sistema Gift Card - WeShoot` --references--> `Brevo Transactional Email Service`  [EXTRACTED]
  GIFT_CARD_IMPLEMENTATION.md → EMAIL_SETUP.md
- `Implementazione Sistema Gift Card - WeShoot` --references--> `src/lib/email.ts`  [EXTRACTED]
  GIFT_CARD_IMPLEMENTATION.md → EMAIL_SETUP.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Facebook Pixel / Conversions API Event Tracking Fix Flow** — facebook_fix_summary_it_doc, facebook_pixel_deduplication_fix_doc, facebook_initiatecheckout_fix_doc, facebook_pixel_test_doc, facebook_pixel_deduplication_fix_track_fb_event_route, facebook_initiatecheckout_fix_simplecheckoutmodal [INFERRED 0.85]
- **SEO Traffic Drop Root-Cause Diagnosis and Fix Set** — analisi_calo_traffico_seo_doc, impatto_blog_sottodominio_seo_doc, quick_fix_seo_steps_doc, riepilogo_calo_traffico_soluzione_doc [EXTRACTED 1.00]
- **Stripe Connect Multi-Recipient Payment Routing Documentation Set** — stripe_connect_setup_doc, stripe_connect_testing_doc, stripe_connect_quick_start_doc, stripe_connect_technical_reference_doc, implementazione_pagamenti_multipli_doc [EXTRACTED 1.00]

## Communities (220 total, 90 thin omitted)

### Community 0 - "Calendar Session Components"
Cohesion: 0.06
Nodes (41): dynamic, fetchCache, generateMetadata(), Page(), revalidate, dynamic, dynamicParams, fetchCache (+33 more)

### Community 1 - "shadcn UI Menu Primitives"
Cohesion: 0.07
Nodes (42): AlertTitle, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut() (+34 more)

### Community 2 - "Admin & Tour Booking Data"
Cohesion: 0.08
Nodes (24): Booking, COLORS, FinancialCharts(), FinancialChartsProps, BookingData, StatisticsClientProps, BookingForm(), BookingFormProps (+16 more)

### Community 3 - "Static Marketing Pages"
Cohesion: 0.08
Nodes (20): dynamic, dynamic, dynamic, DestinationsPage(), dynamic, GET_DESTINATIONS, ContactsHero(), ContactsSection() (+12 more)

### Community 4 - "Tour Detail Route"
Cohesion: 0.08
Nodes (35): absUrl(), dynamic, dynamicParams, extractPastCoaches(), extractUpcomingCoaches(), fetchTourOnce(), generateMetadata(), generateStaticParams() (+27 more)

### Community 5 - "Admin Booking Management API"
Cohesion: 0.09
Nodes (23): AdminBookingsPage(), AdminLayout(), metadata, AdminReviewsPage(), AdminUsersPage(), PUT(), TODO: Invia email di notifica al cliente, GET() (+15 more)

### Community 6 - "Tour Day Itinerary Components"
Cohesion: 0.07
Nodes (33): degradeHeadingsToParagraphs(), TourDayContent(), TourDayContentProps, TourDayHeader(), TourDayHeaderProps, Variant, DayLocation, joinUrl() (+25 more)

### Community 7 - "Auth & Checkout Forms"
Cohesion: 0.12
Nodes (21): ForgotPasswordPage(), Aurora, LoginForm(), Aurora, RegisterForm(), ResetPasswordForm(), GuestData, GoogleAuthButton() (+13 more)

### Community 8 - "TypeScript Config (base)"
Cohesion: 0.06
Nodes (35): esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, supabase/functions/**, **/*.ts, **/*.tsx, compilerOptions (+27 more)

### Community 9 - "Homepage Tours Grid"
Cohesion: 0.10
Nodes (23): ToursSection, CalendarMonthToursGrid(), CalendarMonthToursGridProps, toArray(), FeaturedToursProps, Props, MemoizedTourCard, ToursGrid (+15 more)

### Community 10 - "Course Detail Components"
Cohesion: 0.08
Nodes (25): client, CoursePage(), GET_COURSE_BY_SLUG, GET_COURSES_SLUGS, normalizePictures(), revalidate, CourseContent(), CourseContentProps (+17 more)

### Community 11 - "Sidebar UI Component"
Cohesion: 0.08
Nodes (28): Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel (+20 more)

### Community 12 - "User Dashboard & Profile"
Cohesion: 0.15
Nodes (17): UserRole, Review, Booking, DashboardOverviewProps, ProfilePictureUpload(), ProfilePictureUploadProps, Profile, UserProfile() (+9 more)

### Community 13 - "Hero Sections & Image Utils"
Cohesion: 0.14
Nodes (21): HomePage(), CalendarHero(), CalendarHeroProps, CollectionDetailTours(), CollectionDetailToursProps, LocationTours(), LocationToursProps, StoryRelatedTours() (+13 more)

### Community 14 - "Stripe Guest Checkout Claim"
Cohesion: 0.18
Nodes (25): getServiceSupabase(), POST(), GET(), getServiceSupabase(), POST(), POST(), runtime, afterGuestOrLinkedBooking() (+17 more)

### Community 15 - "Homepage Courses Section"
Cohesion: 0.09
Nodes (18): AcademySection, CoursesSection, dynamic, LastMinuteSection, metadata, WhatsWeShootSection, CourseCard(), features (+10 more)

### Community 16 - "Admin Bookings & Reviews"
Cohesion: 0.11
Nodes (18): Booking, BookingStats, Session, SessionChangeModal(), SessionChangeModalProps, Booking, Review, ReviewsList() (+10 more)

### Community 17 - "Supabase Database Types"
Cohesion: 0.10
Nodes (18): POST(), GET(), POST(), supabase, CompositeTypes, Constants, Database, DefaultSchema (+10 more)

### Community 18 - "Location Gallery Layouts"
Cohesion: 0.09
Nodes (12): GalleryEmptyState(), GalleryLayoutProps, MultiPhotosLayout(), MultiPhotosLayoutProps, SinglePhotoLayout(), SinglePhotoLayoutProps, ThreePhotosLayout(), ThreePhotosLayoutProps (+4 more)

### Community 19 - "TypeScript Config (app)"
Cohesion: 0.08
Nodes (24): ES2020, src, compilerOptions, baseUrl, composite, isolatedModules, jsx, lib (+16 more)

### Community 20 - "Checkout Funnel Components"
Cohesion: 0.15
Nodes (21): GoogleSignupConfirmContent(), CompleteAccountContent(), CheckoutFooter(), CheckoutOrderRecap(), CheckoutParticipants(), CheckoutPaymentMode(), CheckoutStepper(), QuickRegistrationForm() (+13 more)

### Community 21 - "Courses & Stories Landing Pages"
Cohesion: 0.10
Nodes (10): dynamic, dynamic, dynamic, revalidate, Story, CollectionsHero(), breadcrumbElements, WHAT_IS_WESHOOT_PARAGRAPHS (+2 more)

### Community 22 - "Detail Page Heroes & Legal Pages"
Cohesion: 0.20
Nodes (16): dynamic, dynamic, Collection, CollectionDetailHeroProps, CourseDetailHero(), CourseDetailHeroProps, BreadcrumbElement, PageBreadcrumbsProps (+8 more)

### Community 23 - "Admin Auth Guards"
Cohesion: 0.15
Nodes (17): AdminUserManagement(), ReviewsAdminList(), AdminGuard(), AdminGuardProps, CompactLoginForm(), CompactLoginFormProps, LoginDropdown(), LoginDropdownProps (+9 more)

### Community 24 - "Payment & Email Docs"
Cohesion: 0.16
Nodes (24): Brevo Transactional Email Service, Configurazione Email con Brevo, src/lib/email.ts, Fix Facebook Meta - Riepilogo Rapido, Fix: Facebook Pixel InitiateCheckout Event Timing, src/components/payment/SimpleCheckoutModal.tsx, Facebook Conversions API Event Deduplication (browser+server event_id), Fix: Facebook Meta Deduplicazione Eventi Inizio Acquisto (+16 more)

### Community 25 - "Review & Gallery Lightbox"
Cohesion: 0.13
Nodes (14): GalleryLightboxProps, LocationGalleryLightboxProps, GalleryLightboxProps, TourReviewsModal(), TourReviewsModalProps, DialogContent, DialogDescription, DialogFooter() (+6 more)

### Community 26 - "shadcn UI Form Primitives"
Cohesion: 0.10
Nodes (14): Checkbox, HoverCardContent, Progress, ResizableHandle(), ResizablePanelGroup(), Slider, Switch, Textarea (+6 more)

### Community 27 - "Core Domain Types"
Cohesion: 0.21
Nodes (16): Coach, Collection, Lesson, Picture, Story, Destination, Location, Place (+8 more)

### Community 28 - "Transactional Email Templates"
Cohesion: 0.20
Nodes (15): POST(), GET(), runtime, POST(), IMPORTANT: total_amount should always be the FULL tour price, not just the…, IMPORTANT: When using a gift card, we need to track what was "paid" with the…, EmailData, generateBalanceReminderAdminEmail() (+7 more)

### Community 29 - "Header Nav & Booking Details"
Cohesion: 0.15
Nodes (12): BookingDetailsPageProps, Booking, BookingDetails(), BookingDetailsProps, HeaderDesktopNavProps, ThemeToggleLazy, HeaderMobileNav(), HeaderMobileNavProps (+4 more)

### Community 30 - "Reviews Listing Page"
Cohesion: 0.16
Nodes (12): dynamic, PageProps, Review, ReviewsListProps, Review, ReviewsListProps, StoryAuthorProps, Avatar (+4 more)

### Community 31 - "Search Index Builder"
Cohesion: 0.15
Nodes (19): ALIASES, buildIndex(), dynamic, expandQuery(), fetchAllTours(), fetchPage(), GET(), getIndex() (+11 more)

### Community 32 - "Homepage Gallery Lightbox"
Cohesion: 0.15
Nodes (15): GallerySection, GalleryGrid(), GalleryHeader(), GalleryLightboxClient(), GalleryLightboxClientProps, GalleryGridProps, GalleryLightboxClientProps, GalleryLightboxProps (+7 more)

### Community 33 - "Tours Listing & FAQ"
Cohesion: 0.14
Nodes (15): dynamic, GetToursPageResponse, GetToursResponse, metadata, Page(), revalidate, ToursFAQ, ToursList (+7 more)

### Community 34 - "FAQ Components by Section"
Cohesion: 0.19
Nodes (13): CollectionDetailFAQProps, FAQ, CourseFAQProps, FAQ, slugify(), TourFAQ(), TourFAQProps, FAQ (+5 more)

### Community 35 - "Carousel UI Components"
Cohesion: 0.17
Nodes (17): Collection, CollectionCarouselProps, GalleryCarouselProps, GalleryImage, Carousel, CarouselApi, CarouselContent, CarouselContext (+9 more)

### Community 36 - "TypeScript Config (node)"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module (+10 more)

### Community 37 - "Destination Detail Route"
Cohesion: 0.13
Nodes (15): dynamic, generateStaticParams(), GET_ALL_STATE_SLUGS, GET_DESTINATION_STATE_PAGE, PageProps, RouteParams, StatePage(), DestinationDetailEmptyState() (+7 more)

### Community 38 - "Stripe Checkout Session API"
Cohesion: 0.21
Nodes (13): formatSessionDate(), GET_TOUR_PAYMENT_RECIPIENT, getTourPaymentRecipient(), POST(), POST(), getClient(), gql(), getSiteUrl() (+5 more)

### Community 39 - "Payment Toast Notifications"
Cohesion: 0.18
Nodes (11): DashboardPage(), PaymentCancelledToast(), PaymentErrorToast(), PaymentErrorToastProps, PaymentSuccessToast(), ToastContext, ToastContextType, ToastItem (+3 more)

### Community 40 - "Coaches Listing Page"
Cohesion: 0.15
Nodes (12): CoachesPage(), dynamic, slugify(), CoachCard(), normalizeInstagramUrl(), CoachesHero(), Coach, CoachesList() (+4 more)

### Community 41 - "Photographer Detail Route"
Cohesion: 0.13
Nodes (9): dynamic, RouteParams, PhotographerGallery(), PhotographerGalleryProps, Picture, PhotographerHero(), PhotographerHeroProps, GET_PHOTOGRAPHER_BY_USERNAME (+1 more)

### Community 42 - "Dashboard Bookings & Payments"
Cohesion: 0.15
Nodes (14): Booking, BookingsList(), BookingsListProps, Booking, PaymentCard(), PaymentCardProps, TourInfo, Booking (+6 more)

### Community 43 - "Checkout Footer & Stepper UI"
Cohesion: 0.15
Nodes (15): CheckoutFooterProps, CheckoutParticipantsProps, CheckoutStepperProps, CheckoutTripSummary(), CheckoutTripSummaryProps, formatShortDate(), RadioGroup, RadioGroupItem (+7 more)

### Community 44 - "Tour Gallery Components"
Cohesion: 0.16
Nodes (15): GalleryCarousel(), GalleryEmptyState(), GalleryImage, GalleryLightbox, GroupGallerySection(), GroupGallerySectionProps, joinUrl(), normalizeGroupImages() (+7 more)

### Community 45 - "GraphQL Fragments (entities)"
Cohesion: 0.18
Nodes (12): COLLECTION_FRAGMENT, COUPON_FRAGMENT, DAY_FRAGMENT, FAQ_FRAGMENT, HIGHLIGHT_FRAGMENT, PACKAGE_FRAGMENT, PLACE_FRAGMENT, STATE_FRAGMENT (+4 more)

### Community 46 - "GraphQL Page Queries"
Cohesion: 0.17
Nodes (9): GET_COLLECTION_DETAIL, GET_DESTINATION_DETAIL, GET_HOMEPAGE, GET_PRIVACY_POLICY, GET_FUTURE_SESSIONS_DIRECT, GET_SESSIONS, GET_STORIES, GET_TERMS_CONDITIONS (+1 more)

### Community 47 - "npm Dependencies (misc)"
Cohesion: 0.12
Nodes (17): class-variance-authority, cookies-next, embla-carousel-react, @getbrevo/brevo, dependencies, class-variance-authority, cookies-next, embla-carousel-react (+9 more)

### Community 48 - "shadcn Components Config"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 49 - "Location Detail Route"
Cohesion: 0.13
Nodes (14): dynamic, generateStaticParams(), GET_ALL_STATE_PLACE_SLUGS, GET_DESTINATION_PLACE_PAGE, Location, Page(), Props, QueryResult (+6 more)

### Community 50 - "Story Detail Route"
Cohesion: 0.15
Nodes (10): dynamicParams, Params, revalidate, StoryAuthor(), StoryContent(), StoryContentProps, StoryHero(), StoryHeroProps (+2 more)

### Community 51 - "Checkout Resume State"
Cohesion: 0.25
Nodes (12): AuthCallbackPage(), CheckoutOrderRecapProps, CheckoutPaymentModeProps, SimpleCheckoutModalProps, CheckoutResumeState, useCheckoutResume(), buildCheckoutResumeUrl(), CheckoutPaymentType (+4 more)

### Community 52 - "Destination Error & Footer"
Cohesion: 0.14
Nodes (8): Footer, Footer, Header, PageBreadcrumbs, DestinationDetailErrorProps, currentYear, QUICK_LINKS, SUPPORT_LINKS

### Community 53 - "Sitemap & GraphQL Coaches Query"
Cohesion: 0.17
Nodes (10): revalidate, sitemap(), slugify(), GET_COACHES, GET_COLLECTIONS, GET_COURSES, GET_DESTINATIONS, GET_TOURS (+2 more)

### Community 54 - "Tour Contact & Sticky Nav"
Cohesion: 0.19
Nodes (11): TourDetailContentClient, ContactLink(), ContactLinkProps, Coach, TourDetailContentClient(), TourDetailContentProps, TourStickyNav(), TourStickyNavProps (+3 more)

### Community 55 - "Tour Card Gallery Images"
Cohesion: 0.19
Nodes (10): GalleryImageProps, LastMinuteTourCard(), LastMinuteTourCardProps, TourCardImage(), TourCardImageProps, getDifficultyBadge(), getTourLink(), TourLinkData (+2 more)

### Community 56 - "Photographer Tours List"
Cohesion: 0.18
Nodes (12): PhotographerToursEmpty(), PhotographerToursEmptyProps, PhotographerTours(), PhotographerToursProps, Tour, getNextPhotographerSession(), getPhotographerSessions(), Tour (+4 more)

### Community 57 - "Collection Detail Route"
Cohesion: 0.15
Nodes (10): dynamic, Params, Props, Collection, CollectionDetailContent(), CollectionDetailContentProps, CollectionDetailError(), CollectionDetailErrorProps (+2 more)

### Community 58 - "Calendar & Account Deletion UI"
Cohesion: 0.23
Nodes (12): DeleteAccountButton(), AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay (+4 more)

### Community 59 - "Data Sync Scripts"
Cohesion: 0.26
Nodes (14): arr(), fetchAllReviews(), fetchGQL(), fetchSupabaseReviews(), main(), MEDIA_BASE, normalizeSupabaseReview(), normalizeTour() (+6 more)

### Community 60 - "GraphQL Image Fragments"
Cohesion: 0.20
Nodes (8): IMAGE_FRAGMENT, PICTURE_FRAGMENT, REVIEW_FRAGMENT, GET_COURSES_PAGE, GET_ALL_PICTURES, GET_GROUP_PICTURES, GET_PICTURES, TOUR_REVIEWS_FIELDS

### Community 61 - "Destination Tours Grid"
Cohesion: 0.32
Nodes (8): DestinationDetailTours(), DestinationToursGrid(), DestinationToursGridProps, DestinationToursLoading(), filterToursByDestination(), Destination, DestinationDetailToursProps, Tour

### Community 62 - "Courses Feature Sections"
Cohesion: 0.21
Nodes (5): WhySection, iconColumns, Column, IconWithTextSection(), Props

### Community 63 - "App Providers (Apollo/Theme)"
Cohesion: 0.23
Nodes (6): ApolloClientProvider(), ClientProviders(), Sonner, ThemeProvider(), ToasterProps, client

### Community 64 - "shadcn Form Field Context"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 65 - "Rate Limiting Middleware"
Cohesion: 0.32
Nodes (11): buildRateLimitResponse(), checkoutClaimRegistrationOptions, checkRateLimit(), cleanupExpired(), getClientIp(), getRecord(), rateLimit(), RateLimitOptions (+3 more)

### Community 66 - "Input Validation Utils"
Cohesion: 0.30
Nodes (11): sanitizeString(), validateEmail(), validateFields(), validateFiscalCode(), validateName(), validatePassword(), validatePhoneNumber(), validatePrice() (+3 more)

### Community 67 - "npm Dev Dependencies"
Cohesion: 0.18
Nodes (11): autoprefixer, dotenv, eslint, eslint-config-prettier, devDependencies, autoprefixer, dotenv, eslint (+3 more)

### Community 68 - "Facebook Conversions API"
Cohesion: 0.31
Nodes (7): POST(), POST(), CustomData, normalizeAndHashUserData(), sendServerEvent(), ServerEvent, UserData

### Community 69 - "Analytics & Root Layout"
Cohesion: 0.22
Nodes (7): montserrat, AdvancedMatchingData, FacebookPixel(), Window, ToastStateProvider(), Toaster(), IubendaScripts()

### Community 70 - "Payment Success Flow"
Cohesion: 0.29
Nodes (9): buildGuestRedirectView(), ClaimData, delay(), fetchClaimWithRetry(), PaymentSuccessContent(), SuccessVariant, SuccessView, trackPurchasePixel() (+1 more)

### Community 71 - "shadcn Chart Component"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 72 - "shadcn Command Palette"
Cohesion: 0.18
Nodes (9): Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 73 - "shadcn Toast Notifications"
Cohesion: 0.29
Nodes (9): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+1 more)

### Community 74 - "Admin Statistics Dashboard"
Cohesion: 0.20
Nodes (9): AdminStatisticsPage(), BookingData, BookingStats, GiftCardStats, RevenueStats, ReviewStats, TourStats, UserStats (+1 more)

### Community 75 - "Calendar & SEO GraphQL Queries"
Cohesion: 0.29
Nodes (5): GET(), SEO_FRAGMENT, GET_CALENDAR_PAGE, GET_FUTURE_SESSIONS, GET_TOUR_SESSIONS

### Community 76 - "Reviews Page Components"
Cohesion: 0.27
Nodes (7): dynamic, getReviews(), ReviewsPage(), ReviewsEmptyState(), ReviewsError(), ReviewsHero(), ReviewsList()

### Community 77 - "Calendar Loading & Media Utils"
Cohesion: 0.29
Nodes (6): CalendarLoadingProps, isHttp(), isLocalPath(), normalizeMedia(), PageHeader(), PageHeaderProps

### Community 78 - "Icon Components"
Cohesion: 0.29
Nodes (5): HeroVideoSection(), CameraIcon(), MapPinIcon(), StarIcon(), UsersIcon()

### Community 79 - "Tour Card Pricing & Coaches"
Cohesion: 0.24
Nodes (6): Coach, TourCardCoaches(), TourCardCoachesProps, TourCardContentProps, TourCardPricing(), TourCardPricingProps

### Community 80 - "Tour Highlights & Summary"
Cohesion: 0.24
Nodes (8): TourDescription(), TourDescriptionProps, HighlightCard, HighlightItem, slugify(), TourHighlights(), TourHighlightsProps, TourSummaryCard()

### Community 81 - "shadcn Pagination Component"
Cohesion: 0.20
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 82 - "GraphQL Tour Detail Fields"
Cohesion: 0.40
Nodes (5): TOUR_BASE_FIELDS, GET_TOUR_BY_SLUG, TOUR_INCLUSIONS_FIELDS, TOUR_ITINERARY_FIELDS, TOUR_SEO_FIELDS

### Community 83 - "SEO Traffic Analysis Docs"
Cohesion: 0.47
Nodes (9): Analisi Calo Traffico SEO - Settembre 2024, Incomplete Sitemap (missing tours, destinations, courses), src/app/sitemap.ts, Analisi Impatto Migrazione Blog: Subdirectory a Sottodominio, Blog Subdirectory-to-Subdomain Migration (www.weshoot.it/blog -> blog.weshoot.it), next.config.mjs, Rationale: Google treats subdomains as separate sites, splitting domain authority and link juice, Quick Fix SEO - Azioni Immediate (+1 more)

### Community 84 - "Tour Coach Display Utils"
Cohesion: 0.36
Nodes (8): Coach, getCoachDisplayName(), getCoachInitial(), isRealCoach(), normalizeInstagramUrl(), pickGridCols(), TourCoach(), TourCoachProps

### Community 85 - "shadcn Sheet Component"
Cohesion: 0.25
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 86 - "shadcn Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 87 - "Consent & Analytics Loaders"
Cohesion: 0.33
Nodes (6): ConsentLoaders(), ensureDL(), IubApi, loadGTM(), pushConsentGranted(), Window

### Community 88 - "Image Upload Utils"
Cohesion: 0.39
Nodes (8): fileToDataURL(), PROFILE_IMAGE_CONFIG, resizeImage(), UploadConfig, uploadProfileImage(), uploadToCloudinary(), uploadToSupabaseStorage(), validateImageFile()

### Community 89 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, analyze, build, build:analyze, dev, lint, snapshot, start

### Community 90 - "Stripe Payment Intent API"
Cohesion: 0.32
Nodes (3): GET(), POST(), stripe

### Community 91 - "View Category Tracking"
Cohesion: 0.32
Nodes (6): CalendarViewTracker(), CalendarViewTrackerProps, GroupedSessions, CourseViewTracker(), CourseViewTrackerProps, trackViewCategory()

### Community 92 - "Tour Reviews Display"
Cohesion: 0.43
Nodes (7): fullNameOf(), initialsOf(), makeReviewKey(), parseDateLabel(), SingleReviewCard(), TourReviews(), TourReviewsProps

### Community 93 - "shadcn Navigation Menu"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 94 - "Supabase Security Hardening Docs"
Cohesion: 0.48
Nodes (7): Reset Password Email Template (WeShoot), Come Abilitare Password Protection in Supabase, Leaked Password Protection (HaveIBeenPwned check), Quick Start: Risolvi Security Warnings, Spiegazione Security Warnings di Supabase, RLS Anonymous Access Policies (intentional, guest checkout), Supabase Security Advisor

### Community 95 - "Thank You Page Tracking"
Cohesion: 0.33
Nodes (4): dynamic, Item, Purchase, ThankYouTracking()

### Community 96 - "Gift Card Grid Components"
Cohesion: 0.33
Nodes (5): CustomGiftCard(), GiftCardGrid(), giftCardOptions, GiftCardItem(), GiftCardItemProps

### Community 97 - "Tour Equipment Info"
Cohesion: 0.38
Nodes (6): EXPERIENCE_MAP, ExperienceInfo, normalize(), resolveExperience(), TourEquipment(), TourEquipmentProps

### Community 98 - "Homepage Collections Section"
Cohesion: 0.33
Nodes (4): CollectionSection, CollectionCarousel(), Collection, CollectionSectionProps

### Community 99 - "Contacts Section Components"
Cohesion: 0.40
Nodes (4): Contact, ContactCard(), ContactCardProps, ContactSection

### Community 100 - "Tour Inclusions Section"
Cohesion: 0.33
Nodes (3): InclusionItem, TourInclusionsSection(), TourInclusionsSectionProps

### Community 101 - "package.json Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 102 - "Header Logo Components"
Cohesion: 0.50
Nodes (3): HeaderLogo(), HeaderLogoProps, HeaderLogoDynamic()

### Community 103 - "shadcn OTP Input"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 104 - "Booking & Review Types"
Cohesion: 0.40
Nodes (4): Booking, BookingStatus, Review, User

### Community 105 - "Vercel Function Config"
Cohesion: 0.40
Nodes (4): functions, src/app/api/webhook-stripe/route.ts, headers, maxDuration

### Community 106 - "jsconfig Path Aliases"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

### Community 107 - "Auth Middleware Nonce"
Cohesion: 0.67
Nodes (3): config, makeNonce(), middleware()

### Community 110 - "Global Window Type Declarations"
Cohesion: 0.50
Nodes (3): FBQ, IubApi, Window

## Knowledge Gaps
- **602 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+597 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **90 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `shadcn UI Menu Primitives` to `Admin & Tour Booking Data`, `Static Marketing Pages`, `Admin Booking Management API`, `Auth & Checkout Forms`, `Sidebar UI Component`, `User Dashboard & Profile`, `Admin Bookings & Reviews`, `Checkout Funnel Components`, `Detail Page Heroes & Legal Pages`, `Admin Auth Guards`, `Review & Gallery Lightbox`, `shadcn UI Form Primitives`, `Header Nav & Booking Details`, `Reviews Listing Page`, `FAQ Components by Section`, `Carousel UI Components`, `Dashboard Bookings & Payments`, `Checkout Footer & Stepper UI`, `Calendar & Account Deletion UI`, `shadcn Form Field Context`, `shadcn Chart Component`, `shadcn Command Palette`, `shadcn Toast Notifications`, `Calendar Loading & Media Utils`, `shadcn Pagination Component`, `shadcn Sheet Component`, `shadcn Table Component`, `shadcn Navigation Menu`, `shadcn OTP Input`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `Button` connect `Header Nav & Booking Details` to `Calendar Session Components`, `shadcn UI Menu Primitives`, `Admin & Tour Booking Data`, `Admin Booking Management API`, `Auth & Checkout Forms`, `Homepage Tours Grid`, `Course Detail Components`, `Sidebar UI Component`, `User Dashboard & Profile`, `Homepage Courses Section`, `Admin Bookings & Reviews`, `Checkout Funnel Components`, `Admin Auth Guards`, `Review & Gallery Lightbox`, `Homepage Gallery Lightbox`, `Carousel UI Components`, `Coaches Listing Page`, `Dashboard Bookings & Payments`, `Checkout Footer & Stepper UI`, `Tour Contact & Sticky Nav`, `Collection Detail Route`, `Calendar & Account Deletion UI`, `Icon Components`, `Tour Card Pricing & Coaches`, `Tour Coach Display Utils`, `Thank You Page Tracking`, `Gift Card Grid Components`, `Homepage Collections Section`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `Header()` connect `Static Marketing Pages` to `Calendar Session Components`, `Admin & Tour Booking Data`, `Tour Detail Route`, `Admin Booking Management API`, `Course Detail Components`, `User Dashboard & Profile`, `Homepage Courses Section`, `Courses & Stories Landing Pages`, `Detail Page Heroes & Legal Pages`, `Reviews Listing Page`, `Tours Listing & FAQ`, `Destination Detail Route`, `Coaches Listing Page`, `Photographer Detail Route`, `Location Detail Route`, `Story Detail Route`, `Destination Error & Footer`, `Collection Detail Route`, `Reviews Page Components`, `Thank You Page Tracking`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _602 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Calendar Session Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._
- **Should `shadcn UI Menu Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._
- **Should `Admin & Tour Booking Data` be split into smaller, more focused modules?**
  _Cohesion score 0.08416389811738649 - nodes in this community are weakly interconnected._